import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrap } from "../api/client";
import { hasPermission as checkPermission } from "../lib/permissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vela_user")) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("vela_token")));

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem("vela_user", JSON.stringify(nextUser));
    else localStorage.removeItem("vela_user");
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("vela_token");
    if (!token) { setLoading(false); return null; }
    try {
      const profile = unwrap(await api.get("/auth/profile"));
      persistUser(profile);
      return profile;
    } catch {
      localStorage.removeItem("vela_token");
      persistUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  const login = useCallback(async (username, password) => {
    const data = unwrap(await api.post("/auth/login", { username, password }));
    localStorage.setItem("vela_token", data.token);
    persistUser(data.user);
    return data.user;
  }, [persistUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("vela_token");
    persistUser(null);
  }, [persistUser]);

  const hasPermission = useCallback((permission) => checkPermission(user, permission), [user]);
  const isSuperAdmin = user?.role === "super_admin";

  const value = useMemo(() => ({
    user, loading, login, logout, refreshProfile, hasPermission, isSuperAdmin
  }), [user, loading, login, logout, refreshProfile, hasPermission, isSuperAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
