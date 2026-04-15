import React, { useEffect, useState } from "react";
import CompanyCategoryChart from "../../components/CompanyAdmin/analytics/CompanyCategoryChart";
import CompanyTopUsersChart from "../../components/CompanyAdmin/analytics/CompanyTopUsersChart";
import CompanyWeeklyActivity from "../../components/CompanyAdmin/analytics/CompanyWeeklyActivity";
import CompanyHourlyActivity from "../../components/CompanyAdmin/analytics/CompanyHourlyActivity";
import { getCompanyAnalytics } from "../../services/companyAnalyticsService";

const CompanyAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await getCompanyAnalytics();
        setAnalytics(res);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#0989B1] mb-6">
        Company Analytics
      </h1>

      <CompanyCategoryChart data={analytics.categoryUsage} />
      <CompanyTopUsersChart data={analytics.topUsers} />
      <CompanyWeeklyActivity data={analytics.weeklyActivity} />
      <CompanyHourlyActivity data={analytics.hourlyActivity} />
    </div>
  );
};

export default CompanyAnalytics;