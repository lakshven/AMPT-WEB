import DropdownManager from "../components/Admin/DropdownManager";
import AuditLogList from "../components/AuditLogs/AuditLogList";

import SystemUsagePanel from "../components/Admin/SystemUsagePanel";
import SystemAlertsPanel from "../components/Admin/SystemAlertsPanel";
import SecurityAlerts from "../components/Admin/SecurityAlerts";
import AdminAnnouncements from "../components/Admin/AdminAnnouncements";
import AdminAnalyticsDashboard from "../pages/Admin/AdminAnalyticsDashboars";


export const adminSections = [
  {
    key: "system-usage",
    title: "System Usage",
    description: "Database usage, active users, and system health.",
    path: "system-usage",
    component: <SystemUsagePanel />
  },
  {
    key: "system-alerts",
    title: "System Alerts",
    description: "Critical warnings and system notifications.",
    path: "system-alerts",
    component: <SystemAlertsPanel />
  },
  
  // ⭐ NEW — Analytics Dashboard (contains all 5 analytics components)
  {
    key: "analytics-dashboard",
    title: "Analytics Dashboard",
    description: "System-wide user activity insights and trends.",
    path: "analytics-dashboard",
    component: <AdminAnalyticsDashboard />
  },


  {
    key: "security-alerts",
    title: "Security Alerts",
    description: "Failed logins, suspicious activity, and warnings.",
    path: "security-alerts",
    component: <SecurityAlerts />
  },
  {
    key: "announcements",
    title: "Admin Announcements",
    description: "Internal messages and admin-wide updates.",
    path: "announcements",
    component: <AdminAnnouncements />
  },

  // ⭐ Client Groups REMOVED — now handled by AdminSidebar submenu

  {
    key: "dropdowns",
    title: "Dropdown Manager",
    description: "Manage dropdown categories and values.",
    path: "dropdowns",
    component: <DropdownManager />
  },
  {
    key: "audit-logs",
    title: "Audit Logs",
    description: "View system activity and compliance logs.",
    path: "audit-logs",
    component: <AuditLogList />
  }
];