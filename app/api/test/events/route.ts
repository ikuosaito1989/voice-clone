import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createTestEventsStreamResponse } from "@/lib/test-events-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  return createTestEventsStreamResponse(env);
}
