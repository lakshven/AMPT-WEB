import React from "react";
import WeeklyHeatmap from "../../components/Admin/WeeklyHeatmap";
import ActivityCategoryChart from "../../components/Admin/ActivityCategoryChart";
import TopUsersChart from "../../components/Admin/TopUsersChart";
import UserAnalytics from "../../components/Admin/UserAnalytics";

const AdminAnalyticsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold text-[#0989B1] mb-6">
        Admin Analytics Dashboard
      </h1>

      {/* Weekly Heatmap */}
      <div className="w-full">
        <WeeklyHeatmap />
      </div>

      {/* Category Chart */}
      <div className="w-full">
        <ActivityCategoryChart />
      </div>

      {/* Top Users */}
      <div className="w-full">
        <TopUsersChart />
      </div>

      {/* Per-user analytics (example: admin views user 1) */}
      <div className="w-full">
        <UserAnalytics userId={1} />
      </div>

    </div>
  );
};

export default AdminAnalyticsDashboard;