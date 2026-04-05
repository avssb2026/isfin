import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OPERATOR_EMAIL ?? "operator@example.com";
  const password = process.env.SEED_OPERATOR_PASSWORD ?? "change-me-in-production";
  const hash = await argon2.hash(password);

  await prisma.bankOperator.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      lastName: "Администратор",
      firstName: "Системы",
      patronymic: null,
      role: Role.ADMIN,
    },
    create: {
      email,
      lastName: "Администратор",
      firstName: "Системы",
      patronymic: null,
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  console.log(`Seed: operator ${email} ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
