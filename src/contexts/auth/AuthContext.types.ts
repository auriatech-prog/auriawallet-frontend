export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: { user: AuthUser; token: string } | null) => void;
  logout: () => void;
}
