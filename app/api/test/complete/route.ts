import { getCloudflareContext } from "@opennextjs/cloudflare";
import { publishDoneEvent } from "@/lib/test-events-client";

export async function POST() {
  const { env } = await getCloudflareContext({ async: true });
  const event = await publishDoneEvent(env);

  return Response.json({
    ok: true,
    message: event.message,
    time: event.time,
  });
}
