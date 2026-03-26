import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardMetrics from "./DashboardMetrics";
import TopPriorities from "./TopPriorities";
import MappingSection from "./MappingSection";
import { Asset } from "../common/MapView";
import { PriorityItem } from "../../types/PriorityItem";
import { useRBAC } from "../../hooks/useRBAC";

type SectionKey = "metrics" | "priorities" | "mapping";

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const rbac = useRBAC();

  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    open: 0,
    risk: "N/A",
  });

  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeSection, setActiveSection] = useState<SectionKey>("metrics");
  const [loading, setLoading] = useState(true);

  // Fetch asset locations
  useEffect(() => {
    if (!isAuthenticated) return;

    axiosInstance
      .get("/assets/locations")
      .then((res) => setAssets(res.data))
      .catch((err) =>
        console.error("Error fetching asset locations:", {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
          message: err.message,
        })
      );
  }, [isAuthenticated]);

  // Unified dashboard fetcher
  const refreshDashboard = useCallback(() => {
    axiosInstance
      .get("/dashboard")
      .then((res) => {
        setMetrics(
          res.data.metrics || {
            total: 0,
            completed: 0,
            open: 0,
            risk: "N/A",
          }
        );
        setPriorities(res.data.priorities || []);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
          message: err.message,
        });

        if (err.response?.status === 401) {
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Initial dashboard load
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshDashboard();
  }, [isAuthenticated, refreshDashboard]);

  // Prevent UI from rendering before token loads
  if (!isAuthenticated) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 m-0 p-0">
      {/* Sidebar navigation */}
      <div className="w-64 min-h-screen p-6 space-y-4 bg-[#0989B1] text-white">
        <h2 className="text-lg font-bold mb-4 text-white">Dashboard</h2>

        <button
          onClick={() => setActiveSection("metrics")}
          className="block w-full text-left px-2 py-1 rounded font-medium hover:opacity-80"
          style={{
            backgroundColor:
              activeSection === "metrics" ? "#549E39" : "transparent",
            color: activeSection === "metrics" ? "#066A6F" : "white",
          }}
        >
          Dashboard Metrics
        </button>

        <button
          onClick={() => setActiveSection("priorities")}
          className="block w-full text-left px-2 py-1 rounded font-medium hover:opacity-80"
          style={{
            backgroundColor:
              activeSection === "priorities" ? "#549E39" : "transparent",
            color: activeSection === "priorities" ? "#066A6F" : "white",
          }}
        >
          Top Priorities
        </button>

        {/* Viewer cannot see Mapping */}
        {!rbac.isViewer && (
          <button
            onClick={() => setActiveSection("mapping")}
            className="block w-full text-left px-2 py-1 rounded font-medium hover:opacity-80"
            style={{
              backgroundColor:
                activeSection === "mapping" ? "#549E39" : "transparent",
              color: activeSection === "mapping" ? "#066A6F" : "white",
            }}
          >
            Mapping
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto grid grid-cols-1 gap-6">
        {activeSection === "metrics" && (
          <DashboardMetrics
            metrics={metrics}
            onViewAssetLog={() => navigate("/asset-log")}
          />
        )}

        {activeSection === "priorities" && (
          <TopPriorities
            priorities={priorities}
            refreshDashboard={refreshDashboard}
          />
        )}

        {activeSection === "mapping" && (
          <MappingSection assets={assets} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
