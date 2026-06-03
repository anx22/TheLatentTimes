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
      <div className="flex items-center gap-2 border border-signal/40 bg-signal/[0.06] px-3 py-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-signal" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-signal font-bold">Redaktion</span>
        <button
          onClick={logout}
          title="Abmelden"
          aria-label="Abmelden"
          className="ml-1 text-ink-faint hover:text-ink transition-colors"
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
        className="flex items-center gap-2 border border-crimson/40 bg-crimson/[0.06] px-3 py-1.5 hover:bg-crimson/[0.12] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40"
        title="Im Read-only-Modus. Einloggen, um Aktionen auszuführen."
      >
        <Lock className="w-3.5 h-3.5 text-crimson" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-crimson font-bold">Read-only · Login</span>
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
        aria-label="Newsroom-Passwort"
        className="bg-paper border border-hairline focus:border-crimson outline-none px-3 py-1.5 text-[11px] font-mono text-ink w-44"
      />
      <button
        type="submit"
        disabled={isVerifying || !pw}
        className={cn(
          "px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.2em] font-bold border transition-colors",
          isVerifying || !pw
            ? "border-hairline text-ink-faint"
            : "border-ink text-paper bg-ink hover:bg-crimson hover:border-crimson"
        )}
      >
        {isVerifying ? '…' : 'Einloggen'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setPw(''); }}
        aria-label="Abbrechen"
        className="text-ink-faint hover:text-ink transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {authError && (
        <span className="font-mono text-[9px] text-crimson max-w-[180px] truncate" title={authError}>{authError}</span>
      )}
    </form>
  );
};
