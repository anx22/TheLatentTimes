import React, { useRef, useLayoutEffect } from 'react';
import { LucideIcon, Target, ChevronRight, BarChart3, RefreshCw, Globe, Sparkles, Activity, Inbox } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '../../lib/utils';

/**
 * GSAP entrance wrapper — replaces the former Framer Motion `motion.div`.
 * Scoped to its own ref and auto-reverted on unmount (see skills/custom_skills/gsap).
 * Animates FROM `from` to the element's natural rendered state.
 */
const Reveal: React.FC<React.PropsWithChildren<{
  from?: gsap.TweenVars;
  className?: string;
  onClick?: () => void;
}>> = ({ from, className, onClick, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { duration: 0.4, ease: 'power2.out', ...(from ?? { opacity: 0 }) });
    }, ref);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className} onClick={onClick}>{children}</div>;
};

/**
 * Newsroom Design Tokens — editorial cockpit grammar (T-1.4.1).
 * Paper/Ink base, Playfair display + Inter UI + JetBrains Mono for data,
 * restrained Crimson/Emerald accents, hairline rules. Tokens live in
 * tailwind.config.js (ink/crimson/signal/hairline/paper-*).
 */
export const newsroomTheme = {
  colors: {
    bg: 'paper',
    panel: 'paper-warm',
    accent: 'crimson',
    text: {
      primary: 'ink',
      secondary: 'ink-soft',
      muted: 'ink-faint',
      terminal: 'signal',
    },
    border: 'hairline',
  },
  typography: {
    display: 'font-display',
    mono: 'font-mono uppercase tracking-[0.18em]',
    serif: 'font-display italic',
    heading: 'font-sans font-semibold tracking-tight',
    size: {
      xs: 'text-[12px]',
      sm: 'text-[13px]',
      base: 'text-[15px]',
      lg: 'text-[18px]',
      xl: 'text-[22px]',
    }
  }
};

/**
 * Newsroom Header Component
 */
export const NewsroomHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, actions }) => (
  <div className="h-16 border-b border-hairline flex items-center px-8 gap-6 bg-paper sticky top-0 z-20">
    <div className="flex-1 min-w-0">
      {subtitle && (
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-faint mb-1">
          {subtitle}
        </div>
      )}
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-crimson" />}
        <h2 className="text-[22px] font-display text-ink truncate leading-none">
          {title}
        </h2>
      </div>
    </div>
    <div className="flex gap-3">
      {actions}
    </div>
  </div>
);

/**
 * Newsroom Button Component
 */
export const NewsroomButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'tactical';
  disabled?: boolean;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}> = ({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  icon: Icon,
  loading,
  className,
  'aria-label': ariaLabel,
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-[12px] font-sans font-medium uppercase tracking-[0.18em] transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper";

  const variants = {
    primary: "bg-ink text-paper hover:bg-crimson",
    secondary: "bg-paper text-ink border border-ink hover:bg-ink hover:text-paper",
    ghost: "text-ink-soft border border-transparent hover:border-hairline hover:text-ink",
    tactical: "bg-crimson/[0.06] border border-crimson/30 text-crimson hover:bg-crimson/[0.12]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cn(baseStyles, variants[variant], className)}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="truncate">{children}</span>
    </button>
  );
};

/**
 * Newsroom Panel Wrapper
 */
export const NewsroomPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'center';
  width?: string;
}> = ({ children, className, side = 'center', width }) => {
  const sideStyles = {
    left: "border-r border-hairline bg-paper-warm",
    right: "border-l border-hairline bg-paper-dim",
    center: "flex-1 flex flex-col min-w-0 bg-paper",
  };

  return (
    <div className={cn(sideStyles[side], width, "flex flex-col overflow-hidden", className)}>
      {children}
    </div>
  );
};

/**
 * Newsroom Label Component
 */
export const NewsroomLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
  type?: 'header' | 'status' | 'key';
}> = ({ children, className, type = 'key' }) => {
  const styles = {
    header: "text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-ink",
    status: "text-[10px] font-mono uppercase tracking-[0.15em] text-signal bg-signal/[0.08] border border-signal/25 px-2.5 py-1",
    key: "text-[10px] font-mono uppercase tracking-[0.12em] text-ink-faint",
  };

  return (
    <span className={cn(styles[type], className)}>
      {children}
    </span>
  );
};

/**
 * Empty State primitive (T-1.4.1) — one honest, consistent empty surface.
 */
export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon = Inbox, title, hint, action, className }) => (
  <div className={cn(
    "flex flex-col items-center justify-center text-center gap-4 p-10 border border-dashed border-hairline bg-paper-warm",
    className
  )}>
    <Icon className="w-7 h-7 text-ink-faint" aria-hidden />
    <div className="space-y-1.5 max-w-xs">
      <p className="text-[15px] font-display text-ink leading-snug">{title}</p>
      {hint && <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-faint leading-relaxed">{hint}</p>}
    </div>
    {action}
  </div>
);

export const SignalCard: React.FC<{
  item: any;
  onSelect: (title: string, storyId?: string) => void;
  className?: string;
  isResonant?: boolean;
}> = ({ item, onSelect, className, isResonant }) => {
  return (
    <Reveal
      from={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "p-5 bg-paper border border-hairline hover:border-ink/40 transition-all cursor-default group border-l-[3px] relative overflow-hidden flex flex-col h-full min-h-[160px]",
        isResonant ? "border-l-crimson bg-crimson/[0.03]" : "border-l-hairline hover:border-l-signal",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-paper-dim text-ink-soft border border-hairline uppercase tracking-[0.15em]">
                  {item.source || 'UNK'}
              </span>
              {isResonant && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-crimson text-paper uppercase tracking-[0.15em]">
                      RESONANT
                  </span>
              )}
              {item.innovation_score && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-signal/25 text-signal uppercase tracking-widest bg-signal/[0.06] flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" /> {item.innovation_score}%
                </span>
              )}
          </div>
          <span className="text-[10px] text-ink-faint font-mono tracking-tighter">
              {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
      </div>

      <h4 className={cn(
        "text-[19px] leading-[1.2] transition-colors font-display mb-4",
        isResonant ? "text-crimson" : "text-ink group-hover:text-crimson"
      )}>
          {item.title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline">
          <button
              onClick={() => onSelect(item.title, item.storyId)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40",
                isResonant ? "text-crimson" : "text-signal hover:text-ink"
              )}
          >
              <Target className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
              SELECT
          </button>

          {item.url && (
              <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-ink-faint hover:text-ink transition-colors"
                  title="Source URL"
                  aria-label="Open source URL"
              >
                  <ChevronRight className="w-4 h-4" />
              </a>
          )}
      </div>
    </Reveal>
  );
};

export const MagazineSignalCard: React.FC<{
  item: any;
  onSelect: (title: string, storyId?: string) => void;
  onAnalyze?: (title: string, storyId?: string) => void;
  className?: string;
  featured?: boolean;
}> = ({ item, onSelect, onAnalyze, className, featured }) => {
  return (
    <Reveal
      from={{ opacity: 0, y: 20 }}
      className={cn(
        "group relative overflow-hidden bg-paper border border-hairline hover:border-ink/40 transition-all flex flex-col",
        featured ? "md:col-span-2 md:row-span-2 p-8" : "p-6",
        className
      )}
    >
      <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-crimson/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />

      <div className="flex items-center gap-4 mb-6">
        <span className="text-[10px] font-mono font-black text-ink-soft tracking-[0.3em] uppercase">
          {item.source || 'Signal'}
        </span>
        {item.innovation_score && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-signal/[0.06] border border-signal/15">
            <Activity className="w-3 h-3 text-signal" />
            <span className="text-[10px] font-mono font-bold text-signal">{item.innovation_score}%</span>
          </div>
        )}
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-[10px] font-mono text-ink-faint">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <h3 className={cn(
        "font-display leading-[1.05] mb-6 transition-colors",
        featured ? "text-4xl md:text-5xl" : "text-2xl",
        "text-ink group-hover:text-crimson"
      )}>
        {item.title}
      </h3>

      {item.content && (
        <p className={cn(
          "text-ink-soft leading-relaxed mb-8 max-w-xl font-sans",
          featured ? "text-[15px] line-clamp-4" : "text-[13px] line-clamp-3"
        )}>
          {item.content}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-hairline">
        <div className="flex items-center gap-4">
            <button
              onClick={() => onSelect(item.title, item.storyId)}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-paper bg-ink hover:bg-crimson transition-colors px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40"
            >
              <Target className="w-3.5 h-3.5" />
              Draft Story
            </button>
            {onAnalyze && (
                <button
                  onClick={() => onAnalyze(item.title, item.storyId)}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors border border-hairline px-3 py-1.5 hover:bg-paper-dim"
                >
                  <Sparkles className="w-3 h-3" />
                  Analyze
                </button>
            )}
            {item.url && (
                <button
                  onClick={() => { if(item.url) navigator.clipboard.writeText(item.url); }}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.1em] text-ink-faint hover:text-ink transition-colors"
                >
                  [ Copy Link ]
                </button>
            )}
        </div>

        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-ink bg-paper-dim p-1.5 hover:bg-hairline transition-all" aria-label="Open source URL">
            <Globe className="w-4 h-4" />
          </a>
        )}
      </div>
    </Reveal>
  );
};

export const BriefingCard: React.FC<{
  draft: any;
  onSelect: (id: any) => void;
  className?: string;
}> = ({ draft, onSelect, className }) => {
  return (
    <Reveal
      from={{ opacity: 0, x: -20 }}
      onClick={() => onSelect(draft._id)}
      className={cn(
        "p-6 bg-paper border border-hairline hover:border-signal/40 transition-all hover:translate-x-[5px] cursor-pointer group relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-signal/30 group-hover:bg-signal transition-colors" />
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono font-black text-signal tracking-[0.2em] uppercase">Deep Dive Briefing</span>
        <span className="text-[10px] font-mono text-ink-faint">
          {new Date(draft._creationTime).toLocaleDateString()}
        </span>
      </div>
      <h4 className="text-xl font-display text-ink group-hover:text-crimson transition-colors mb-2 leading-snug">
        {draft.headline}
      </h4>
      <p className="text-ink-soft text-xs line-clamp-2 font-display italic">
        {draft.deck}
      </p>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-ink-faint uppercase tracking-widest pt-4 border-t border-hairline">
        <Sparkles className="w-3 h-3" />
        Status: Assets_Stored
      </div>
    </Reveal>
  );
};

export const ClusterCard: React.FC<{
  cluster: any;
  onSelect: (title: string, id: string) => void;
  className?: string;
}> = ({ cluster, onSelect, className }) => {
  return (
    <div
      className={cn(
        "p-5 bg-paper border border-hairline hover:border-ink/40 transition-all group relative cursor-pointer",
        className
      )}
      onClick={() => onSelect(cluster.title, cluster._id)}
    >
       <div className="flex justify-between items-start mb-2">
          <NewsroomLabel type="status" className="border-none bg-transparent p-0 text-signal">
            #{cluster.status}
          </NewsroomLabel>
          <BarChart3 className="w-4 h-4 text-ink-faint" />
       </div>
       <h5 className="text-[17px] font-display text-ink group-hover:text-crimson leading-tight mb-2">{cluster.title}</h5>
       <div className="flex gap-2 flex-wrap">
          {cluster.keyEntities?.slice(0, 3).map((e: string) => (
             <NewsroomLabel key={e} type="key" className="text-[10px] px-2 py-0.5 bg-paper-dim border border-hairline">
               {e}
             </NewsroomLabel>
          ))}
       </div>
    </div>
  );
};

export const EditorialCard: React.FC<{
  title: string;
  status: string;
  className?: string;
  onClick?: () => void;
}> = ({ title, status, className, onClick }) => {
  return (
    <div
      className={cn(
        "p-6 border border-hairline bg-paper text-left group hover:border-signal/40 transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <NewsroomLabel type="key" className="text-ink-faint mb-3 block">{status}</NewsroomLabel>
      <p className="text-[17px] text-ink font-display line-clamp-2 leading-snug group-hover:text-crimson transition-colors">{title}</p>
    </div>
  );
};

export const AssetPreviewCard: React.FC<{
  src: string;
  onRefresh?: () => void;
  className?: string;
}> = ({ src, onRefresh, className }) => {
  return (
    <div className={cn(
      "aspect-[4/3] w-full max-w-[320px] mx-auto border border-hairline bg-paper-dim overflow-hidden group relative",
      className
    )}>
      <img
        src={src}
        alt="Synthetic Artifact"
        className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
        referrerPolicy="no-referrer"
      />
      {onRefresh && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-ink/40">
          <NewsroomButton
            variant="primary"
            onClick={onRefresh}
            icon={RefreshCw}
            aria-label="Reshoot asset"
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            {""}
          </NewsroomButton>
        </div>
      )}
    </div>
  );
};
