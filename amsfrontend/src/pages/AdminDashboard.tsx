import React from "react";
import AdminSectionCards from "./AdminSectionCards";

import SystemUsagePanel from "../components/Admin/SystemUsagePanel";
import SystemAlertsPanel from "../components/Admin/SystemAlertsPanel";
import SecurityAlerts from "../components/Admin/SecurityAlerts";
import AdminAnnouncements from "../components/Admin/AdminAnnouncements";
import AuditLogList from "../components/AuditLogs/AuditLogList";

const AdminDashboard: React.FC = () => {
  const showCards = true; // toggle if needed

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800">App Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Welcome! Choose a section to manage system-wide settings.
          </p>
        </div>

        {/* Navigation Cards */}
        {showCards && <AdminSectionCards />}

        {/* System Insights (Summary Widgets) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SystemUsagePanel />
          <SystemAlertsPanel />
        </div>

        {/* Activity + Security + Announcements (Summary Widgets) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <SecurityAlerts />
          <AdminAnnouncements />
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <AuditLogList limit={5} />
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;