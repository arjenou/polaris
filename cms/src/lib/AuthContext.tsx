import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "./api";
import { isSuperAdmin } from "./adminRoles";

interface AuthState {
  loading: boolean;
  username: string | null;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUsername(res.authenticated ? res.username ?? null : null))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(user: string, password: string) {
    const res = await authApi.login(user, password);
    setUsername(res.username);
  }

  async function logout() {
    await authApi.logout();
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ loading, username, isSuperAdmin: isSuperAdmin(username), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
