import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../frontendApi';
import { setGeminiAuthToken } from '../services/gemini';

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
 *
 * T-1.0.1: login now returns a server-issued session TOKEN (not just a boolean).
 * The token is stored and injected into the Gemini transport so the cost-incurring
 * model actions can verify the caller. `canEdit` is derived from token presence.
 * Storage key is bumped to v2 — pre-token sessions are treated as logged-out and
 * must re-authenticate to obtain a token.
 */
const STORAGE_KEY = 'lt_news_auth_v2';

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

  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY) || null; } catch { return null; }
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Keep the Gemini transport's token in sync with the session (incl. on boot,
  // so a restored token authenticates model calls without re-login).
  useEffect(() => { setGeminiAuthToken(token); }, [token]);

  const canEdit = !!token;

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res: any = await verify({ password });
      if (res?.ok && res?.token) {
        setToken(res.token);
        try { localStorage.setItem(STORAGE_KEY, res.token); } catch { /* ignore */ }
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
    setToken(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ canEdit, isVerifying, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
