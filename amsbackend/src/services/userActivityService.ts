import prisma from "../prisma/client";

// ⭐ Existing function (kept exactly as you wrote it)
export const fetchUserActivity = () => {
  return prisma.userActivity.findMany({
    orderBy: { createdAt: "asc" }
  });
};

// ⭐ 1. Hourly activity (for 24-hour heatmap)
export const fetchHourlyActivity = () => {
  return prisma.userActivity.groupBy({
    by: ["hour"],
    _sum: { count: true },
    orderBy: { hour: "asc" }
  });
};

// ⭐ 2. Weekly activity (7×24 heatmap)
export const fetchWeeklyActivity = () => {
  return prisma.userActivity.groupBy({
    by: ["dayOfWeek", "hour"],
    _sum: { count: true },
    _min: {createdAt: true}, // to get date for each day
    orderBy: [
      { dayOfWeek: "asc" },
      { hour: "asc" }
    ]
  });
};

// ⭐ 3. Activity by category (pie chart)
export const fetchActivityByCategory = () => {
  return prisma.userActivity.groupBy({
    by: ["category"],
    _sum: { count: true },
    orderBy: { category: "asc" }
  });
};

// ⭐ 4. Top active users (bar chart)
export const fetchTopActiveUsers = () => {
  return prisma.userActivity.groupBy({
    by: ["userId"],
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: 10
  });
};

// ⭐ 5. Per-user analytics (user detail page)
export const fetchUserActivityByUserId = (userId: number) => {
  return prisma.userActivity.findMany({
    where: { userId },
    orderBy: [
      { dayOfWeek: "asc" },
      { hour: "asc" }
    ]
  });
};