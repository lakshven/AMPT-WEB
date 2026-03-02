import prisma from "../prisma/client";

interface UserActivityInput {
  userId: number | null;
  companyId: number | null;
  category: string;
}

export async function recordUserActivity({
  userId,
  companyId,
  category,
}: UserActivityInput) {
  const now = new Date();
  const hour = now.toISOString().slice(11, 13) + ":00";
  const dayOfWeek = now.getDay();

  return prisma.userActivity.upsert({
    where: {
      hour_dayOfWeek_category: {
        hour,
        dayOfWeek,
        category,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      companyId,
      hour,
      dayOfWeek,
      category,
      count: 1,
    },
  });
}