import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@sozo.local";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Set ADMIN_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log(`Updated password for ${updated.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
