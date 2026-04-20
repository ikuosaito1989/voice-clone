import { eq } from "drizzle-orm";
import { getDatabase } from "@/server/db/database";
import { users } from "@/server/db/schema";

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
};

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const db = await getDatabase();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}
