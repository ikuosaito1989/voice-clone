import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { customers } from "@/lib/db/schema";

export async function getCustomers() {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.voice_clone);

  return db.select().from(customers);
}
