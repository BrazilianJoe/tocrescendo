import { hash } from "bcryptjs";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

config({ path: ".env.local" });
config();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await hash(password, 12);
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name, role: "ADMIN" })
      .where(eq(users.id, existing.id));
    console.log(`Updated admin: ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    name,
    passwordHash,
    role: "ADMIN",
  });
  console.log(`Created admin: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
