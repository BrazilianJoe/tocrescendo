import { auth } from "@/lib/auth";

export type AdminSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: string;
  };
};

export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session as AdminSession;
}
