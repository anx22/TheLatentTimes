import React, { useRef, useLayoutEffect } from 'react';
import { LucideIcon, Target, ChevronRight, BarChart3, RefreshCw, Globe, Sparkles, Activity } from 'lucide-react';
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
 * Newsroom Design Tokens (Standardized across V2)
 */
export const newsroomTheme = {
  colors: {
    bg: '#060606',
    panel: '#0a0a0a',
    accent: 'emerald-500',
    text: {
      primary: 'zinc-100',
      secondary: 'zinc-400',
      muted: 'zinc-600',
      terminal: 'emerald-400',
    },
    border: 'zinc-800/50',
  },
  typography: {
    mono: 'font-mono uppercase tracking-[0.2em]',
    serif: 'font-serif italic',
    heading: 'font-bold tracking-tight',
    size: {
      xs: 'text-[14px]', 
      sm: 'text-[14px]',
      base: 'text-[16px]',
      lg: 'text-[18px]',
      xl: 'text-[20px]',
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
  <div className="h-16 border-b border-zinc-600 flex items-center px-8 gap-6 bg-zinc-800 backdrop-blur-md sticky top-0 z-20">
    <div className="flex-1 min-w-0">
      {subtitle && (
        <div className="text-[14px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-1">
          {subtitle}
        </div>
      )}
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-emerald-500/70" />}
        <h2 className="text-[16px] font-bold text-emerald-400 font-mono truncate uppercase tracking-[0.2em]">
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
}> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  disabled, 
  icon: Icon, 
  loading,
  className 
}) => {
  const baseStyles = "relative flex items-center gap-3 px-6 py-3 text-[14px] font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    secondary: "bg-zinc-100 text-black hover:bg-white",
    ghost: "border border-zinc-600 text-zinc-400 hover:border-zinc-600 hover:text-white",
    tactical: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
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
    left: "border-r border-zinc-600 bg-zinc-900",
    right: "border-l border-zinc-600 bg-zinc-800",
    center: "flex-1 flex flex-col min-w-0 bg-zinc-900",
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
    header: "text-[15px] font-bold uppercase tracking-[0.2em] text-zinc-400",
    status: "text-[14px] font-bold uppercase tracking-[0.2em] text-emerald-500/70 bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-sm",
    key: "text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-400",
  };

  return (
    <span className={cn(styles[type], className)}>
      {children}
    </span>
  );
};

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
        "p-5 bg-white/[0.03] border border-zinc-700 hover:bg-white/[0.06] hover:border-zinc-700 transition-all cursor-default group border-l-[3px] relative overflow-hidden flex flex-col h-full min-h-[160px] shadow-sm",
        isResonant ? "border-l-[#ccff00] bg-[#ccff00]/5 shadow-[0_0_30px_rgba(204,255,0,0.03)]" : "border-l-zinc-800 hover:border-l-emerald-500",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700/30 uppercase tracking-[0.15em] rounded-[2px]">
                  {item.source || 'UNK'}
              </span>
              {isResonant && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#ccff00] text-black uppercase tracking-[0.15em] rounded-[2px] animate-pulse">
                      RESONANT
                  </span>
              )}
              {item.innovation_score && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-emerald-500/20 text-emerald-500/80 uppercase tracking-widest bg-emerald-500/5 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" /> {item.innovation_score}%
                </span>
              )}
          </div>
          <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">
              {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
      </div>
      
      <h4 className={cn(
        "text-[16px] leading-[1.3] transition-colors font-bold mb-4 tracking-tight font-sans selection:bg-emerald-500/30",
        isResonant ? "text-emerald-300" : "text-zinc-100 group-hover:text-white"
      )}>
          {item.title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
          <button 
              onClick={() => onSelect(item.title, item.storyId)}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn",
                isResonant ? "text-[#ccff00]" : "text-emerald-500/60 hover:text-emerald-400"
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
                  className="p-1 text-zinc-700 hover:text-zinc-400 transition-colors"
                  title="Source URL"
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
        "group relative overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-zinc-600 transition-all flex flex-col",
        featured ? "md:col-span-2 md:row-span-2 p-8" : "p-6",
        className
      )}
    >
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      
      <div className="flex items-center gap-4 mb-6">
        <span className="text-[10px] font-mono font-black text-emerald-500/60 tracking-[0.3em] uppercase">
          {item.source || 'Signal'}
        </span>
        {item.innovation_score && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-mono font-bold text-emerald-500/80">{item.innovation_score}%</span>
          </div>
        )}
        <div className="h-px flex-1 bg-white/[0.05]" />
        <span className="text-[10px] font-mono text-zinc-600">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <h3 className={cn(
        "font-black tracking-tighter leading-[1.1] mb-6 transition-colors",
        featured ? "text-3xl md:text-4xl" : "text-xl",
        "text-zinc-100 group-hover:text-emerald-400"
      )}>
        {item.title}
      </h3>

      {item.content && (
        <p className={cn(
          "text-zinc-500 leading-relaxed mb-8 max-w-xl font-mono tracking-tight",
          featured ? "text-[14px] line-clamp-4" : "text-[12px] line-clamp-3"
        )}>
          {item.content}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/[0.05]">
        <div className="flex items-center gap-4">
            <button 
              onClick={() => onSelect(item.title, item.storyId)}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-[#ccff00] transition-colors border border-emerald-500/20 px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xs"
            >
              <Target className="w-3.5 h-3.5" />
              Draft Story
            </button>
            {onAnalyze && (
                <button 
                  onClick={() => onAnalyze(item.title, item.storyId)}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors border border-zinc-700/50 px-3 py-1.5 hover:bg-zinc-900 rounded-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  Analyze
                </button>
            )}
            {item.url && (
                <button 
                  onClick={() => { if(item.url) navigator.clipboard.writeText(item.url); }}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors"
                >
                  [ Copy Link ]
                </button>
            )}
        </div>
        
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-300 bg-zinc-900 p-1.5 rounded-[4px] hover:bg-zinc-800 transition-all">
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
        "p-6 bg-zinc-900 border border-emerald-500/10 hover:border-emerald-500/30 transition-all hover:translate-x-[5px] cursor-pointer group relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono font-black text-emerald-500 tracking-[0.2em] uppercase">Deep Dive Briefing</span>
        <span className="text-[10px] font-mono text-zinc-700">
          {new Date(draft._creationTime).toLocaleDateString()}
        </span>
      </div>
      <h4 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors mb-2 tracking-tight">
        {draft.headline}
      </h4>
      <p className="text-zinc-500 text-xs line-clamp-2 font-serif italic">
        {draft.deck}
      </p>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest pt-4 border-t border-white/[0.05]">
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
        "p-5 bg-zinc-900 border border-zinc-600 hover:border-zinc-700 transition-all rounded-sm group relative cursor-pointer",
        className
      )}
      onClick={() => onSelect(cluster.title, cluster._id)}
    >
       <div className="flex justify-between items-start mb-2">
          <NewsroomLabel type="status" className="border-none bg-transparent p-0 text-emerald-500/60 group-hover:text-emerald-400">
            #{cluster.status}
          </NewsroomLabel>
          <BarChart3 className="w-4 h-4 text-zinc-800" />
       </div>
       <h5 className="text-[14px] font-bold text-zinc-300 group-hover:text-white leading-tight mb-2 tracking-tight">{cluster.title}</h5>
       <div className="flex gap-2">
          {cluster.keyEntities?.slice(0, 3).map((e: string) => (
             <NewsroomLabel key={e} type="key" className="text-[10px] px-2 py-0.5 bg-black border border-zinc-600">
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
        "p-6 border border-zinc-600 bg-zinc-900 rounded-sm text-left group hover:border-emerald-500/20 transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <NewsroomLabel type="key" className="text-zinc-500 mb-3 block">{status}</NewsroomLabel>
      <p className="text-[13px] text-zinc-300 font-medium tracking-tight line-clamp-2 leading-relaxed group-hover:text-emerald-400 transition-colors">{title}</p>
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
      "aspect-[4/3] w-full max-w-[320px] mx-auto border border-zinc-700 bg-black overflow-hidden group relative rounded-sm shadow-2xl",
      className
    )}>
      <img 
        src={src} 
        alt="Synthetic Artifact" 
        className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
        referrerPolicy="no-referrer"
      />
      {onRefresh && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900">
          <NewsroomButton 
            variant="ghost"
            onClick={onRefresh}
            icon={RefreshCw}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            {""}
          </NewsroomButton>
        </div>
      )}
    </div>
  );
};




