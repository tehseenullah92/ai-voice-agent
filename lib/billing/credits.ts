import { prisma } from "@/lib/prisma";
import { SIGNUP_BONUS_CREDITS } from "@/lib/billing/plans";

export type CreditTxType =
  | "signup_bonus"
  | "subscription_renewal"
  | "call_usage"
  | "manual_adjustment";

/**
 * Atomically add credits and record a transaction.
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTxType,
  description?: string
): Promise<void> {
  if (amount <= 0) return;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    }),
    prisma.creditTransaction.create({
      data: { userId, amount, type, description },
    }),
  ]);
}

/**
 * Atomically deduct credits and record a transaction.
 * Clamps the user's balance to 0 (never goes negative).
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: CreditTxType,
  callId?: string,
  description?: string
): Promise<void> {
  if (amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });

    const actual = Math.min(amount, user.credits);
    if (actual <= 0) return;

    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: actual } },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -actual,
        type,
        callId,
        description: description ?? `Deducted ${actual} credits`,
      },
    });
  });
}

export async function hasEnoughCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return (user?.credits ?? 0) >= amount;
}

export async function grantSignupBonus(userId: string): Promise<void> {
  if (SIGNUP_BONUS_CREDITS <= 0) return;
  await addCredits(
    userId,
    SIGNUP_BONUS_CREDITS,
    "signup_bonus",
    `Welcome bonus: ${SIGNUP_BONUS_CREDITS} credits`
  );
}
