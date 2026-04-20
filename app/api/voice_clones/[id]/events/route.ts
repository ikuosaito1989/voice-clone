import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createVoiceCloneEventsStreamResponse } from "@/server/events/voice-clone-events-client";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/voice_clones/[id]/events">,
) {
  const { id: rawId } = await context.params;
  const id = rawId.trim();

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  return createVoiceCloneEventsStreamResponse(env, id);
}
