import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const password = await hashPassword(
    process.env.SEED_USER_PASSWORD ?? "dev-local-password-min-8-chars"
  );

  const user = await prisma.user.upsert({
    where: { email: "dev@convaire.local" },
    update: { password, emailVerifiedAt: new Date() },
    create: {
      email: "dev@convaire.local",
      password,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.workspace.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
