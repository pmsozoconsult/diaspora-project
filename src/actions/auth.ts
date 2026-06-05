"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreatePoaCase } from "@/lib/poa";
import { requireActionAdmin } from "@/lib/action-auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function registerClient(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid input. Check all fields." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash,
      role: Role.CLIENT,
    },
  });

  await getOrCreatePoaCase(user.id);
  return { success: true };
}

const staffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["STAFF", "ADMIN"]),
});

export async function createStaffUser(formData: FormData) {
  const authResult = await requireActionAdmin();
  if (!authResult.session) {
    return { error: "Only administrators can create staff accounts." };
  }
  const adminId = authResult.session.user.id;

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already in use." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role as Role,
      createdById: adminId,
    },
  });

  revalidatePath("/staff/team");
  return { success: true };
}

const updateInternalUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["STAFF", "ADMIN"]),
  password: z.string().optional(),
});

export async function updateInternalUser(
  userId: string,
  formData: FormData
) {
  const authResult = await requireActionAdmin();
  if (!authResult.session) {
    return { error: "Only administrators can edit internal users." };
  }

  const parsed = updateInternalUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || (target.role !== Role.STAFF && target.role !== Role.ADMIN)) {
    return { error: "User not found or not an internal account." };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email already in use." };
    }
  }

  if (target.role === Role.ADMIN && parsed.data.role === "STAFF") {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1) {
      return { error: "Cannot demote the only administrator." };
    }
  }

  const password = parsed.data.password?.trim();
  if (password && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role as Role,
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });

  revalidatePath("/staff/team");
  return { success: true };
}
