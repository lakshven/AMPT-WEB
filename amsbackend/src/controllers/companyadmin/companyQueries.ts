import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

// Dashboard Stats
// Dashboard Stats
export const getCompanyStatsQuery = async (companyId: number) => {
  // ⭐ Total Users (already correct)
  const totalUsers = await prismaClient().users.count({ where: { companyId } });

  // ⭐ Total Activity (new)
  const totalActivity = await prismaClient().audit.count({
    where: { companyId },
  });

  // ⭐ Active Users (new) — last 7 days
  const activeUsers = await prismaClient().audit.groupBy({
    by: ["actorUserId"],
    where: {
      companyId,
      actorUserId: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
      },
    },
  });

  return {
    totalUsers,
    totalActivity,
    activeUsers: activeUsers.length,
  };
};
 
// Alerts
export const getCompanyAlertsQuery = async (companyId: number) => {
  const alerts = await prismaClient().systemAlert.findMany({
    where: { companyId, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
   return alerts.map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    severity: a.severity,
    createdAt: a.createdAt,
  }));
};

// Activity Logs (with filtering, sorting, pagination)
export const getCompanyActivityLogsQuery = async (companyId: number, filters: any) => {
  const where: any = { companyId };

  if (filters.performedBy) {
    where.performedBy = {
      contains: filters.performedBy,
      mode: "insensitive",
    };
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }

  const skip = (filters.page - 1) * filters.limit;
  const take = filters.limit;

  const orderBy: any = {};
  orderBy[filters.sort] = filters.order;

  const [logs, total] = await Promise.all([
    prismaClient().audit.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prismaClient().audit.count({ where }),
  ]);

  return {
    data: logs,   // ⭐ FIXED
    pagination: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};

// Analytics
export const getCompanyAnalyticsQuery = async (companyId: number) => {
  // ⭐ Top Users (with firstname + lastname)
  const topUsersRaw = await prismaClient().userActivity.groupBy({
    by: ["userId"],
    where: { companyId },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take: 5,
  });

  const topUsers = (
    await Promise.all(
      topUsersRaw.map(async (u) => {
        if (!u.userId) return null; // ⭐ Prevent null errors

        const user = await prismaClient().users.findUnique({
          where: { id: u.userId },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });

        const fullName = `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim();

        return {
          userId: u.userId,
          userName: fullName || "Unknown",
          email: user?.email ?? "",
          totalActions: u._count.userId,
        };
      })
    )
  ).filter(Boolean); // ⭐ Remove nulls

  // ⭐ Weekly Activity (sorted Monday → Sunday)
  const weeklyActivityRaw = await prismaClient().userActivity.groupBy({
    by: ["dayOfWeek"],
    where: { companyId },
    _count: { dayOfWeek: true },
  });

  const weeklyActivity = weeklyActivityRaw
    .map((w) => ({
      dayOfWeek: w.dayOfWeek,
      count: w._count.dayOfWeek,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // ⭐ Hourly Activity (sorted 00:00 → 23:00)
  const hourlyActivityRaw = await prismaClient().userActivity.groupBy({
    by: ["hour"],
    where: { companyId },
    _count: { hour: true },
  });

  const hourlyActivity = hourlyActivityRaw
    .map((h) => ({
      hour: h.hour, // already a string like "11:00"
      count: h._count.hour,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour)); // ⭐ string-safe sorting

  return {
    topUsers,
    weeklyActivity,
    hourlyActivity,
  };
};

// Settings
export const getCompanySettingsQuery = async (companyId: number) => {
  let settings = await prismaClient().companySettings.findUnique({
    where: { companyId },
  });

  if (!settings) {
    settings = await prismaClient().companySettings.create({
      data: {
        companyId,
        companyInfo: {},
        branding: {},
        preferences: {},
      },
    });
  }

  // ⭐ Helper to ensure JSON is an object
  const ensureObject = (value: any) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  return {
    ...settings,

    companyInfo: {
      address: "",
      phone: "",
      website: "",
      description: "",
      ...ensureObject(settings.companyInfo),
    },

    branding: {
      primaryColor: "",
      secondaryColor: "",
      logoUrl: "",
      ...ensureObject(settings.branding),
    },

    preferences: {
      language: "en",
      timezone: "UTC",
      notifications: true,
      ...ensureObject(settings.preferences),
    },
  };
};;

// Update Company Info
export const updateCompanyInfoQuery = async (companyId: number, data: any) => {
  return await prismaClient().companySettings.update({
    where: { companyId },
    data: { companyInfo: data },
  });
};

// Update Branding
export const updateBrandingQuery = async (companyId: number, data: any) => {
  return await prismaClient().companySettings.update({
    where: { companyId },
    data: { branding: data },
  });
};

// Update Preferences
export const updatePreferencesQuery = async (companyId: number, data: any) => {
  return await prismaClient().companySettings.update({
    where: { companyId },
    data: { preferences: data },
  });
};