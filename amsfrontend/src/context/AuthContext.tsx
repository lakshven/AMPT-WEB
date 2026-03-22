import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { normalizeRole } from "../utils/normalizeRole";
import axiosInstance from "../utils/axiosInstance";
export interface DecodedUser {
  id: number;
  username: string;
  role: string;
  roleId?: number;
  permissions: string[];
  clientGroupId: number | null;
  companyId: number | null;   // ⭐ REQUIRED
  accountType: "single" | "company";
  exp?: number;
}

interface AuthContextType {
  user: DecodedUser | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
  permissions: string[];
  accountType: string | null;
  clientGroupId: number | null;
  companyId: number | null;
  hasPermission: (perm: string) => boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  role: null,
  permissions: [],
  accountType: null,
  clientGroupId: null,
  companyId: null,
  hasPermission: () => false,
  loading: false,
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalize decoded token
  const normalizeUser = (decoded: DecodedUser): DecodedUser => {
    let normalizedRole = normalizeRole(decoded.role);
  //     // ⭐ Auto-upgrade role on frontend if backend already upgraded
  // if (normalizedRole === "single_user" && decoded.companyId !== null) {
  //   normalizedRole = "company_admin";
  // }


    return {
      ...decoded,
      role: normalizedRole,
      clientGroupId: decoded.clientGroupId ?? null,
      companyId: decoded.companyId ?? null,   // ⭐ REQUIRED
      permissions: decoded.permissions ?? [],
      accountType: normalizedRole === "single_user" ? "single" : "company",
    };
  };
  // ⭐ FIXED refreshUser with logging
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/me");

      if (res.data?.user) {
        setUser(normalizeUser(res.data.user));
      } else {
        console.warn("refreshUser: backend returned no user");
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
  };
 // Debug helper for console testing
if (typeof window !== "undefined") {
  (window as any).__auth = { refreshUser };
}
  // ⭐ FIXED: Load token on mount — wait for refreshUser BEFORE ending loading
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedUser>(token);

        // Token expired?
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }

        // Set decoded user immediately
        setUser(normalizeUser(decoded));

        // ⭐ WAIT for backend sync BEFORE finishing loading
        await refreshUser();
      } catch(err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        // ⭐ loading ends ONLY after refreshUser completes
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  // Login stores token and decodes user
  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<DecodedUser>(token);
    setUser(normalizeUser(decoded));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const role = user?.role ?? null;
  const permissions = user?.permissions ?? [];
  const accountType = user?.accountType ?? null;
  const clientGroupId = user?.clientGroupId ?? null;
  const companyId = user?.companyId ?? null;
  const hasPermission = (perm: string) => permissions.includes(perm);
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        role,
        permissions,
        accountType,
        clientGroupId,
        companyId,
        hasPermission,
        loading,
        refreshUser,  // ⭐ added
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}