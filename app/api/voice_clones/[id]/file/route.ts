import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/voice_clones/[id]/file">,
) {
  const { id: rawId } = await context.params;
  const id = rawId.trim();

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.voice_clone);

  const [voiceClone] = await db
    .select({
      clonedAudioPath: voiceClones.clonedAudioPath,
    })
    .from(voiceClones)
    .where(eq(voiceClones.id, id))
    .limit(1);

  if (!voiceClone) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  if (!voiceClone.clonedAudioPath) {
    return Response.json({ error: "cloned audio is not ready" }, { status: 404 });
  }

  const object = await env.recordings.get(voiceClone.clonedAudioPath);

  if (!object) {
    return Response.json({ error: "cloned audio file not found" }, { status: 404 });
  }

  const fileName = `${new Date().toISOString().slice(0, 10)}-cloned.wav`;

  return new Response(object.body, {
    headers: {
      etag: object.httpEtag,
      "content-disposition": `attachment; filename="${fileName}"`,
      "content-type": object.httpMetadata?.contentType ?? "audio/wav",
    },
  });
}
