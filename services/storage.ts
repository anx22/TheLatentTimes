
import { createClient } from '@supabase/supabase-js';
import { IssueContent, AgentLog, StoryArtifact, RecipeArtifact, DropArtifact } from '../types';

// CONFIGURATION
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

// Check if configured (ignore placeholders)
export const IS_CONFIGURED = SUPABASE_URL && 
                      SUPABASE_KEY && 
                      !SUPABASE_URL.includes('placeholder') && 
                      !SUPABASE_URL.includes('MISSING');

// Initialize client
export const supabase = createClient(
  IS_CONFIGURED ? SUPABASE_URL : 'https://placeholder.supabase.co', 
  IS_CONFIGURED ? SUPABASE_KEY : 'public-anon-key'
);

// CONSTANTS
const KEY_CURRENT_ISSUE = 'current_issue';
const KEY_PENDING_ISSUE = 'pending_issue';
const KEY_LOGS = 'current_logs';
const MOCK_KEY = 'modus_mock_session';
const LOCAL_ISSUE_KEY = 'modus_local_issue';

// INTERNAL EVENT BUS FOR MOCK AUTH
const notifyMockAuth = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('modus-mock-auth'));
};

// AUTHENTICATION
export const getSession = async () => {
    if (!IS_CONFIGURED) {
        // Mock Session Fallback
        const mock = localStorage.getItem(MOCK_KEY);
        return mock ? JSON.parse(mock) : null;
    }
    const { data } = await supabase.auth.getSession();
    return data.session;
};

// Official Login Pattern (Logic Only)
export const login = async (email: string, password: string) => {
    if (!IS_CONFIGURED) {
        // MOCK LOGIN FOR DEMO/BUILD ENV
        const mockSession = {
            user: { email, id: 'mock-user-id' },
            access_token: 'mock-token-xyz',
            expires_at: Date.now() + 3600000
        };
        localStorage.setItem(MOCK_KEY, JSON.stringify(mockSession));
        notifyMockAuth();
        return { data: { session: mockSession }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
    if (!IS_CONFIGURED) {
        // MOCK SIGNUP
        return { data: { user: { email, id: 'mock-user-id' } }, error: null };
    }
    // Dynamic redirect ensures it works on localhost:5173 or deployed domains
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    
    return await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: redirectTo
        }
    });
};

export const signOut = async () => {
    if (!IS_CONFIGURED) {
        localStorage.removeItem(MOCK_KEY);
        notifyMockAuth();
        return { error: null };
    }
    return await supabase.auth.signOut();
};

// --- RELATIONAL MAPPERS ---

const saveRelationalIssue = async (issueId: string, issue: IssueContent) => {
    if (!IS_CONFIGURED) throw new Error("DB_NOT_CONFIGURED");

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
    await supabase.from('modus_articles').delete().eq('issue_id', issueId);
    await supabase.from('modus_recipes').delete().eq('issue_id', issueId);

    // 3. PREPARE ARTICLES (Features, Columns, Drops, Edit)
    const articles = [
        ...issue.features.map((f, i) => ({ ...f, type: 'FEATURE', sort: i })),
        ...issue.columns.map((c, i) => ({ ...c, type: 'COLUMN', sort: i })),
        ...issue.drops.map((d, i) => ({ ...d, type: 'DROP', sort: i })),
        ...issue.edit.map((e, i) => ({ 
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
        category: a.category || a.label,
        headline: a.headline || a.title,
        deck: a.deck || a.desc,
        body: Array.isArray(a.body) ? a.body : (a.body ? [a.body] : []),
        
        author_persona: a.author_persona,
        placement: a.placement,
        
        img_prompt: a.img_prompt,
        img_caption: a.img_caption,
        img_base64: a.img_base64,
        img_brief: a.img_brief,
        
        footnotes: a.footnotes,
        citations: a.citations,
        layout_config: a.layout,
        
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
    if (!IS_CONFIGURED) return null; // Silent fail

    // 1. FETCH ISSUE
    // CHANGED: .single() -> .maybeSingle() to avoid 406 Error on empty DB
    const { data: issue, error: issueError } = await supabase
        .from('modus_issues')
        .select('*')
        .eq('id', issueId)
        .maybeSingle();
        
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
            run_id: issueId,
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
            label: a.category, 
            body: a.body?.[0] || "",
            footer_context: "From DB"
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
        layout: a.layout_config, 
        author_persona: a.author_persona,
        category: a.category
    };
};

// NEW: FETCH ARCHIVE INDEX
export const getArchiveIndex = async (): Promise<Array<{ id: string; vol: string; theme: string; date: string }>> => {
    if (!IS_CONFIGURED) return [];
    
    const { data, error } = await supabase
        .from('modus_issues')
        .select('id, vol, theme, issue_date')
        .order('issue_date', { ascending: false });
        
    if (error) {
        console.warn("Error fetching archive index:", error);
        return [];
    }
    
    return data.map(d => ({
        id: d.id,
        vol: d.vol,
        theme: d.theme,
        date: d.issue_date
    }));
};

export const saveIssue = async (issue: IssueContent) => {
    // If no DB configured, use local storage fallback
    if (!IS_CONFIGURED) {
        localStorage.setItem(LOCAL_ISSUE_KEY, JSON.stringify(issue));
        return;
    }

    try {
        // Use the meta.issue_id as the primary key to enable history
        // Fallback to KEY_CURRENT_ISSUE only if undefined
        const issueId = issue.meta.issue_id || KEY_CURRENT_ISSUE;
        await saveRelationalIssue(issueId, issue);
    } catch (e) {
        console.warn("DB Save failed, falling back to local storage:", e);
        // Fallback to local storage on error
        localStorage.setItem(LOCAL_ISSUE_KEY, JSON.stringify(issue));
    }
};

export const loadIssue = async (specificId?: string): Promise<IssueContent | null> => {
    if (!IS_CONFIGURED) {
        const local = localStorage.getItem(LOCAL_ISSUE_KEY);
        return local ? JSON.parse(local) : null;
    }

    try {
        // Load specific ID if requested, otherwise get most recent
        let issueId = specificId;
        if (!issueId) {
             const { data } = await supabase.from('modus_issues').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
             issueId = data?.id;
        }

        if (issueId) {
             const dbIssue = await loadRelationalIssue(issueId);
             if (dbIssue) return dbIssue;
        }

        // Fallback
        const local = localStorage.getItem(LOCAL_ISSUE_KEY);
        return local ? JSON.parse(local) : null;
    } catch (e) {
        console.warn("Could not load issue from DB, checking local:", e);
        const local = localStorage.getItem(LOCAL_ISSUE_KEY);
        return local ? JSON.parse(local) : null;
    }
};

// --- STRICT DB LOGGING (No Fallbacks needed for logs, they are optional) ---

export interface StorageResult {
    success: boolean;
    error?: any;
}

export const saveLogs = async (logs: AgentLog[]): Promise<StorageResult> => {
    if (!IS_CONFIGURED) return { success: false, error: 'DB_NOT_CONFIGURED' };

    // Strict Supabase Upsert
    const { error } = await supabase
        .from('modus_logs')
        .upsert({ 
            id: KEY_LOGS, 
            entries: logs.slice(-200), // Keep last 200 items in DB
            updated_at: new Date().toISOString() 
        });
    
    if (error) {
        console.warn("DB LOG SYNC FAILED (Using Local Storage Fallback):", error.message);
        try {
            localStorage.setItem(KEY_LOGS, JSON.stringify({ 
                id: KEY_LOGS, 
                entries: logs.slice(-200),
                updated_at: new Date().toISOString() 
            }));
            // Return success so the UI doesn't flash Red Error for permissions issues
            return { success: true };
        } catch (localError) {
            return { success: false, error: localError };
        }
    }

    return { success: true };
};

export const loadLogs = async (): Promise<AgentLog[]> => {
    if (!IS_CONFIGURED) {
        const local = localStorage.getItem(KEY_LOGS);
        return local ? JSON.parse(local).entries : [];
    }

    const { data, error } = await supabase
        .from('modus_logs')
        .select('entries')
        .eq('id', KEY_LOGS)
        .maybeSingle();
    
    if (error) {
        console.warn("DB LOG LOAD ERROR (Checking Local):", error.message);
        const local = localStorage.getItem(KEY_LOGS);
        return local ? JSON.parse(local).entries : [];
    }

    return data?.entries || [];
};

export const checkDbConnection = async (): Promise<boolean> => {
    if (!IS_CONFIGURED) return false;
    const { error } = await supabase.from('modus_logs').select('id').limit(1);
    if (error && error.code !== 'PGRST116') return false; 
    return true;
};
