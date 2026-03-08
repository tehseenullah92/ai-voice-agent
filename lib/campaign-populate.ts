import type { PrismaClient } from "@prisma/client";

export async function autoPopulateCalls(
  prisma: PrismaClient,
  campaignId: string,
  userId: string
): Promise<{ created: number; totalClients: number }> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
  });
  if (!campaign?.clientListKey) return { created: 0, totalClients: 0 };

  const clientList = await prisma.clientList.findFirst({
    where: { id: campaign.clientListKey, userId },
    include: { memberships: { include: { client: true } } },
  });
  if (!clientList || clientList.memberships.length === 0) {
    return { created: 0, totalClients: 0 };
  }

  const existingCalls = await prisma.call.findMany({
    where: { campaignId },
    select: { clientId: true, clientPhone: true },
  });
  const existingClientIds = new Set(
    existingCalls.map((c) => c.clientId).filter(Boolean)
  );
  const existingPhones = new Set(
    existingCalls.map((c) => c.clientPhone).filter(Boolean)
  );

  const toCreate = clientList.memberships.filter(
    (m) =>
      !existingClientIds.has(m.client.id) && !existingPhones.has(m.client.phone)
  );

  if (toCreate.length === 0) {
    const total = existingCalls.length;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalClients: total,
        remaining: total - campaign.called,
      },
    });
    return { created: 0, totalClients: total };
  }

  await prisma.call.createMany({
    data: toCreate.map((m) => ({
      campaignId,
      clientId: m.client.id,
      clientName: m.client.name,
      clientPhone: m.client.phone,
      status: "pending" as const,
    })),
  });

  const newTotal = existingCalls.length + toCreate.length;
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      totalClients: newTotal,
      remaining: newTotal - campaign.called,
    },
  });

  return { created: toCreate.length, totalClients: newTotal };
}
