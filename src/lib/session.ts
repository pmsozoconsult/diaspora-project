import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireClient() {
  const session = await requireAuth();
  if (session.user.role !== Role.CLIENT) {
    redirect("/staff");
  }
  return session;
}

export async function requireStaff() {
  const session = await requireAuth();
  if (session.user.role === Role.CLIENT) redirect("/portal");
  if (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireStaff();
  if (session.user.role !== Role.ADMIN) redirect("/staff");
  return session;
}
