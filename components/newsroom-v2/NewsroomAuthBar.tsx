import React, { useState } from 'react';
import { Lock, ShieldCheck, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

/**
 * Compact newsroom auth control for the top bar.
 * - Authenticated: shows an "Editor" chip + logout.
 * - Anonymous: shows a "Read-only" chip that expands into a password field.
 * The actual enforcement happens at the NewsroomContext guard; this is just UI.
 */
export const NewsroomAuthBar: React.FC = () => {
  const { canEdit, isVerifying, authError, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');

  if (canEdit) {
    return (
      <div className="flex items-center gap-2 border border-[#ccff00]/30 bg-[#ccff00]/5 px-3 py-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#ccff00] font-bold">Redaktion</span>
        <button
          onClick={logout}
          title="Abmelden"
          className="ml-1 text-zinc-500 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-amber-500/40 bg-amber-500/5 px-3 py-1.5 hover:bg-amber-500/10 transition-colors"
        title="Im Read-only-Modus. Einloggen, um Aktionen auszuführen."
      >
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">Read-only · Login</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await login(pw);
        if (ok) { setOpen(false); setPw(''); }
      }}
      className="flex items-center gap-2"
    >
      <input
        type="password"
        autoFocus
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Newsroom-Passwort"
        className="bg-black border border-zinc-700 focus:border-[#ccff00] outline-none px-3 py-1.5 text-[11px] font-mono text-white w-44"
      />
      <button
        type="submit"
        disabled={isVerifying || !pw}
        className={cn(
          "px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest font-bold border transition-colors",
          isVerifying || !pw
            ? "border-zinc-700 text-zinc-600"
            : "border-[#ccff00]/50 text-[#ccff00] hover:bg-[#ccff00]/10"
        )}
      >
        {isVerifying ? '…' : 'Einloggen'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setPw(''); }}
        className="text-zinc-600 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {authError && (
        <span className="font-mono text-[9px] text-red-400 max-w-[180px] truncate" title={authError}>{authError}</span>
      )}
    </form>
  );
};
