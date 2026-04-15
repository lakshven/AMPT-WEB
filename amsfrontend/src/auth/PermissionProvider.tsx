import React, { createContext, useContext, useEffect, useState, ReactNode,} from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

interface PermissionsContextType {
  permissions: string[];
  loading: boolean;
  refreshPermissions: () => Promise<void>;   // ⭐ added
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  loading: false,
  refreshPermissions: async () => {},   // ⭐ added
});

interface ProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<ProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // ⭐ refreshPermissions function
  const refreshPermissions = async () => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setPermissions([]);
      return;
    }

    try {
      const res = await axiosInstance.get("/me/permissions");
      setPermissions(res.data.permissions || []);
    } catch (err: any) {
      console.error(
        "Failed to fetch permissions:",
        err.response?.data || err.message
      );
      setPermissions([]);
    }
  };
  useEffect(() => {
    async function loadPermissions() {
      const token = localStorage.getItem("token");
      if (!user || !token) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        // axiosInstance automatically adds Authorization header
        const res = await axiosInstance.get("/me/permissions");
        setPermissions(res.data.permissions || []);
      } catch (err: any) {
        console.error("Failed to fetch permissions:", err.response?.data || err.message
        );
        setPermissions([]);
      }finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [user]);


  return (
    <PermissionsContext.Provider value={{ permissions, loading, refreshPermissions }}>
      {children}
      
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);