import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue, AuthUser } from "./AuthContext.types";

const AUTH_STORAGE_KEY = "auria_wallet_auth";

interface StoredAuthState {
  user: AuthUser;
  token: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

function getInitialSession(): StoredAuthState | null {
  try {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession) as Partial<StoredAuthState>;
    if (parsed.user && parsed.token) {
      return {
        user: parsed.user,
        token: parsed.token,
      };
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessionState, setSessionState] = useState<StoredAuthState | null>(() =>
    getInitialSession(),
  );

  const setSession = useCallback((session: StoredAuthState | null) => {
    if (session) {
      setSessionState(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      setSessionState(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const user = sessionState?.user ?? null;
  const token = sessionState?.token ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading: false,
      setSession,
      logout,
    }),
    [user, token, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
