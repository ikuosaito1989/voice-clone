import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export type Database = ReturnType<typeof drizzle>;

export function createDatabase(database: D1Database) {
  return drizzle(database);
}

export async function getDatabase() {
  const { env } = await getCloudflareContext({ async: true });

  return createDatabase(env.voice_clone);
}
