import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.appSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      poaFeeCents: 50000,
      poaInstructions: `## Power of Attorney — Next steps

1. Download and complete the POA form (our team will email details if needed).
2. Visit your local Ethiopian embassy or consulate for authentication.
3. Send us copies of signed documents via this portal when requested in chat.
4. We will complete registration with the legal office in Ethiopia.

Our team will update your status when your POA is registered. You can message us from your dashboard once a service request exists.`,
    },
    update: {},
  });

  const services = [
    {
      name: "Property title verification",
      description: "Verify land or property title documents in Ethiopia.",
      priceCents: 15000,
      sortOrder: 1,
    },
    {
      name: "Bank account facilitation",
      description: "Support opening or managing diaspora banking requirements.",
      priceCents: 20000,
      sortOrder: 2,
    },
    {
      name: "Business registration support",
      description: "Company registration and licensing coordination.",
      priceCents: 35000,
      sortOrder: 3,
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@sozo.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Administrator",
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Created ADMIN user: ${adminEmail}`);
    console.log(`Default password: ${adminPassword} (change immediately)`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
