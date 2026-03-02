import axiosInstance from "../utils/axiosInstance";

// ⭐ System Usage
export const getSystemUsage = async () => {
  const res = await axiosInstance.get("/admin/stats");
  return res.data;
};

// ⭐ System Alerts
export const getSystemAlerts = async () => {
  const res = await axiosInstance.get("/admin/alerts");
  return res.data;
};

// ⭐ User Activity (raw)
export const getUserActivity = async () => {
  const res = await axiosInstance.get("/admin/user-activity");
  return res.data;
};

// ⭐ Hourly Heatmap
export const getHourlyActivity = async () => {
  const res = await axiosInstance.get("/admin/user-activity/hourly");
  return res.data;
};

// ⭐ Weekly Heatmap
export const getWeeklyActivity = async () => {
  const res = await axiosInstance.get("/admin/user-activity/weekly");
  return res.data;
};

// ⭐ Category Activity (Pie Chart)
export const getActivityByCategory = async () => {
  const res = await axiosInstance.get("/admin/user-activity/categories");
  return res.data;
};

// ⭐ Top Active Users (Bar Chart)
export const getTopActiveUsers = async () => {
  const res = await axiosInstance.get("/admin/user-activity/top-users");
  return res.data;
};

// ⭐ Per-user analytics (User Detail Page)
export const getUserActivityByUserId = async (id: number) => {
  const res = await axiosInstance.get(`/admin/user-activity/user/${id}`);
  return res.data;
};