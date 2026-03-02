import React, { useEffect, useState } from "react";
import CompanyStatsCard from "../../components/CompanyAdmin/cards/CompanyStataCard";
import CompanyAlertsCard from "../../components/CompanyAdmin/cards/CompanyAlertsCard";
import { getCompanyStats, getCompanyAlerts } from "../../services/companyAdminService";

const CompanyAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await getCompanyStats();
        const alertsRes = await getCompanyAlerts();

        // ⭐ Updated to match backend fields
        setStats({
          totalUsers: statsRes?.totalUsers ?? 0,
          totalActivity: statsRes?.totalActivity ?? 0,
          activeUsers: statsRes?.activeUsers ?? 0,
        });

        setAlerts(alertsRes ?? []);
      } catch (error) {
        console.error("Error loading company admin dashboard:", error);

        setStats({
          totalUsers: 0,
          totalActivity: 0,
          activeUsers: 0,
        });

        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading company dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#0989B1] mb-6">
        Company Admin Dashboard
      </h1>

      <CompanyStatsCard stats={stats} />
      <CompanyAlertsCard alerts={alerts} />
    </div>
  );
};

export default CompanyAdminDashboard;