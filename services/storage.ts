
import { createClient } from '@supabase/supabase-js';
import { IssueContent, AgentLog, StoryArtifact, RecipeArtifact, DropArtifact } from '../types';

// CONFIGURATION
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fiivdhjxuvvmeboqncns.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_5cuInsft6tF3Q3WqqcMJDg_4LM2GQHs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CONSTANTS
const KEY_CURRENT_ISSUE = 'current_issue';
const KEY_PENDING_ISSUE = 'pending_issue';
const KEY_LOGS = 'current_logs';

// AUTHENTICATION
export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const initiateLogin = async () => {
    const email = window.prompt("Supabase Login: Enter Email");
    if (!email) throw new Error("cancelled");
    const password = window.prompt("Supabase Login: Enter Password");
    if (!password) throw new Error("cancelled");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert(`Login Failed: ${error.message}`);
        throw error;
    }
    return;
};

// --- RELATIONAL MAPPERS ---

const saveRelationalIssue = async (issueId: string, issue: IssueContent) => {
    // 1. UPSERT ISSUE PARENT
    const issuePayload = {
        id: issueId,
        vol: issue.meta.vol,
        theme: issue.meta.theme,
        issue_date: issue.meta.date,
        editor: issue.meta.editor,
        status: issue.meta.status,
        ticker: issue.ticker,
        
        cover_eyebrow: issue.cover.eyebrow,
        cover_title: issue.cover.title,
        cover_deck: issue.cover.deck,
        cover_img_prompt: issue.cover.imgPrompt,
        cover_img_base64: issue.cover.img_base64,
        cover_coverlines: issue.cover.coverlines, // Keep as JSONB array
        
        index_keys: issue.index_keys,
        colophon: issue.colophon,
        debates: issue.debates,
        
        updated_at: new Date().toISOString()
    };

    const { error: issueError } = await supabase.from('modus_issues').upsert(issuePayload);
    if (issueError) throw issueError;

    // 2. DELETE CHILDREN (Full replacement strategy for simplicity in singleton model)
    // We handle errors gracefully here in case tables are empty
    await supabase.from('modus_articles').delete().eq('issue_id', issueId);
    await supabase.from('modus_recipes').delete().eq('issue_id', issueId);

    // 3. PREPARE ARTICLES (Features, Columns, Drops, Edit)
    const articles = [
        ...issue.features.map((f, i) => ({ ...f, type: 'FEATURE', sort: i })),
        ...issue.columns.map((c, i) => ({ ...c, type: 'COLUMN', sort: i })),
        ...issue.drops.map((d, i) => ({ ...d, type: 'DROP', sort: i })),
        ...issue.edit.map((e, i) => ({ 
             // Convert legacy Edit items to flat structure
             id: `edit_${i}`, 
             type: 'EDIT', 
             sort: i, 
             status: 'PUBLISHED',
             headline: e.title,
             deck: e.desc,
             category: e.category 
        })) 
    ];

    const articleRows = articles.map((a: any) => ({
        issue_id: issueId,
        id: a.id,
        type: a.type,
        status: a.status,
        category: a.category || a.label, // Unified category
        headline: a.headline || a.title, // Unified title
        deck: a.deck || a.desc,          // Unified description
        body: Array.isArray(a.body) ? a.body : (a.body ? [a.body] : []), // Normalize body to array
        
        author_persona: a.author_persona,
        placement: a.placement,
        
        img_prompt: a.img_prompt,
        img_caption: a.img_caption,
        img_base64: a.img_base64,
        img_brief: a.img_brief,
        
        footnotes: a.footnotes,
        citations: a.citations,
        layout_config: a.layout, // Maps to layout in TS
        
        sort_order: a.sort
    }));

    if (articleRows.length > 0) {
        const { error: artError } = await supabase.from('modus_articles').insert(articleRows);
        if (artError) throw artError;
    }

    // 4. PREPARE RECIPES
    const recipeRows = issue.atelier.map((r, i) => ({
        issue_id: issueId,
        id: r.id,
        status: r.status,
        title: r.title,
        intent: r.intent,
        ingredients: r.ingredients,
        steps: r.steps,
        params: r.params,
        failure_modes: r.failure_modes,
        warning: r.warning,
        sort_order: i
    }));

    if (recipeRows.length > 0) {
        const { error: recError } = await supabase.from('modus_recipes').insert(recipeRows);
        if (recError) throw recError;
    }
};

const loadRelationalIssue = async (issueId: string): Promise<IssueContent | null> => {
    // 1. FETCH ISSUE
    const { data: issue, error: issueError } = await supabase
        .from('modus_issues')
        .select('*')
        .eq('id', issueId)
        .single();
        
    if (issueError || !issue) return null;

    // 2. FETCH CHILDREN
    const { data: articles } = await supabase
        .from('modus_articles')
        .select('*')
        .eq('issue_id', issueId)
        .order('sort_order');
        
    const { data: recipes } = await supabase
        .from('modus_recipes')
        .select('*')
        .eq('issue_id', issueId)
        .order('sort_order');

    // 3. RECONSTRUCT
    const features = (articles || []).filter(a => a.type === 'FEATURE').map(mapDbArticleToArtifact);
    const columns = (articles || []).filter(a => a.type === 'COLUMN').map(mapDbArticleToArtifact);
    const drops = (articles || []).filter(a => a.type === 'DROP').map(mapDbArticleToArtifact);
    
    // Legacy Edit Mapping
    const edit = (articles || []).filter(a => a.type === 'EDIT').map(a => ({
        category: a.category,
        title: a.headline,
        desc: a.deck
    }));

    const atelier = (recipes || []).map(r => ({
        id: r.id,
        status: r.status,
        title: r.title,
        intent: r.intent,
        ingredients: r.ingredients,
        steps: r.steps,
        params: r.params,
        failure_modes: r.failure_modes,
        warning: r.warning
    }));

    return {
        meta: {
            run_id: 'loaded', // generic
            issue_id: issue.id,
            vol: issue.vol,
            theme: issue.theme,
            date: issue.issue_date,
            editor: issue.editor,
            status: issue.status as any
        },
        ticker: issue.ticker,
        cover: {
            eyebrow: issue.cover_eyebrow,
            title: issue.cover_title,
            deck: issue.cover_deck,
            imgPrompt: issue.cover_img_prompt,
            img_base64: issue.cover_img_base64,
            coverlines: issue.cover_coverlines || []
        },
        index_keys: issue.index_keys || [],
        colophon: issue.colophon || {},
        debates: issue.debates || [],
        
        features: features as StoryArtifact[],
        columns: columns as StoryArtifact[],
        drops: drops as DropArtifact[],
        edit: edit,
        atelier: atelier as RecipeArtifact[]
    };
};

const mapDbArticleToArtifact = (a: any): any => {
    // Helper to map DB columns back to TS interface
    const isDrop = a.type === 'DROP';
    const base = {
        id: a.id,
        status: a.status,
        headline: a.headline,
        placement: a.placement,
        citations: a.citations,
        img_base64: a.img_base64,
    };

    if (isDrop) {
        return {
            ...base,
            category: a.category,
            label: a.category, // map category back to label
            body: a.body?.[0] || "",
            footer_context: "From DB" // generic fallback or store in db
        };
    }
    
    return {
        ...base,
        deck: a.deck,
        body: a.body,
        footnotes: a.footnotes,
        img_prompt: a.img_prompt,
        img_caption: a.img_caption,
        img_brief: a.img_brief,
        layout: a.layout_config, // Map layout_config -> layout
        author_persona: a.author_persona,
        category: a.category
    };
};

// --- PUBLIC API ---

export const saveIssue = async (issue: IssueContent) => {
    await saveRelationalIssue(KEY_CURRENT_ISSUE, issue);
};

export const loadIssue = async (): Promise<IssueContent | null> => {
    return await loadRelationalIssue(KEY_CURRENT_ISSUE);
};

export const savePendingIssue = async (issue: IssueContent | null) => {
    if (issue) {
        await saveRelationalIssue(KEY_PENDING_ISSUE, issue);
    }
};

export const loadPendingIssue = async (): Promise<IssueContent | null> => {
    return await loadRelationalIssue(KEY_PENDING_ISSUE);
};

export const saveLogs = async (logs: AgentLog[]) => {
    const { error } = await supabase
        .from('modus_logs')
        .upsert({ id: KEY_LOGS, entries: logs.slice(-200), updated_at: new Date().toISOString() });
    if (error) console.error("Supabase Save Logs Error:", error);
};

export const loadLogs = async (): Promise<AgentLog[]> => {
    const { data } = await supabase
        .from('modus_logs')
        .select('entries')
        .eq('id', KEY_LOGS)
        .single();
    return data?.entries || [];
};

export const clearStorage = async () => {
    await supabase.auth.signOut();
};
