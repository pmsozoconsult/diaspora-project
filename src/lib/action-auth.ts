import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

type ActionSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
};

export type ActionAuthResult =
  | { session: ActionSession; error?: undefined }
  | { session?: undefined; error: string };

export async function requireActionAuth(): Promise<ActionAuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  return { session: session as ActionSession };
}

export async function requireActionClient(): Promise<ActionAuthResult> {
  const result = await requireActionAuth();
  if (!result.session) return result;
  if (result.session.user.role !== Role.CLIENT) {
    return { error: "Unauthorized" };
  }
  return result;
}

export async function requireActionStaff(): Promise<ActionAuthResult> {
  const result = await requireActionAuth();
  if (!result.session) return result;
  const role = result.session.user.role;
  if (role !== Role.STAFF && role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }
  return result;
}

export async function requireActionAdmin(): Promise<ActionAuthResult> {
  const result = await requireActionStaff();
  if (!result.session) return result;
  if (result.session.user.role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }
  return result;
}
