import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const SystemUsagePanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load stats", err));
  }, []);

  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6 border border-[#549E39]/30">
        <p className="text-gray-600">Loading system usage...</p>
      </div>
    );
  }

  const status =
    stats.dbCapacityPercent < 60
      ? "Healthy"
      : stats.dbCapacityPercent < 85
      ? "Warning"
      : "Critical";

  const statusColor =
    status === "Healthy"
      ? "text-green-600"
      : status === "Warning"
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto border border-[#549E39]/30">
      <h2 className="text-2xl font-bold mb-6 text-[#0989B1]">
        System Usage Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-[#0989B1]">{stats.totalUsers}</p>
        </div>

        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Active Users (24h)</p>
          <p className="text-3xl font-bold text-[#0989B1]">{stats.active24h}</p>
        </div>

        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Active Users (7 days)</p>
          <p className="text-3xl font-bold text-[#0989B1]">{stats.active7d}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Database Size</p>
          <p className="text-3xl font-bold text-[#0989B1]">{stats.dbSizeMB} MB</p>
        </div>

        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Capacity Used</p>
          <p className="text-3xl font-bold text-[#0989B1]">
            {stats.dbCapacityPercent}%
          </p>
        </div>

        <div className="p-4 rounded border border-[#549E39]/30 bg-gray-50">
          <p className="text-sm text-gray-500">Status</p>
          <p className={`text-3xl font-bold ${statusColor}`}>{status}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemUsagePanel;