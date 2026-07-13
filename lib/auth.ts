import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
});

/** Dummy hash so missing users still pay bcrypt cost (mitigates timing/user enumeration). */
const DUMMY_PASSWORD_HASH =
  "$2b$12$3.ho5INyy8biMVbjn8xd2O8Xq7fNI0xC8pkRBIPSclmS53pMSISZ.";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);

        const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const valid = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !valid || user.role !== "ADMIN") return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
