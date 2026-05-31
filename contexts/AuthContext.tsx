import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../frontendApi';

/**
 * NEWSROOM AUTH (password-only soft wall).
 *
 * Anonymous visitors get a READ-ONLY newsroom: they can navigate the rooms and
 * watch what happens, but every action is neutralised at the NewsroomContext
 * choke-point (see contexts/NewsroomContext.tsx). After a successful server-side
 * password check (convex/auth.ts) the session is marked editable.
 *
 * Robustness: `useAuth()` fails CLOSED (read-only) if used outside the provider,
 * so newsroom rebuilds can never accidentally grant edit rights.
 */
const STORAGE_KEY = 'lt_news_auth_v1';

interface AuthContextType {
  canEdit: boolean;
  isVerifying: boolean;
  authError: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fail closed: no provider -> read-only.
    return {
      canEdit: false,
      isVerifying: false,
      authError: null,
      login: async () => false,
      logout: () => {},
    };
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const verify = useAction(api.auth.verifyNewsroomPassword);

  const [canEdit, setCanEdit] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res: any = await verify({ password });
      if (res?.ok) {
        setCanEdit(true);
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
        return true;
      }
      setAuthError(
        res?.configured === false
          ? 'Newsroom-Passwort ist serverseitig nicht konfiguriert (NEWSROOM_PASSWORD).'
          : 'Falsches Passwort.'
      );
      return false;
    } catch (e: any) {
      setAuthError('Login fehlgeschlagen: ' + (e?.message || 'Netzwerkfehler'));
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [verify]);

  const logout = useCallback(() => {
    setCanEdit(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ canEdit, isVerifying, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
