import { getCloudflareContext } from "@opennextjs/cloudflare";
import { findClonedAudioPathByVoiceCloneId } from "@/server/repositories/voice-clones";

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
  const clonedAudio = await findClonedAudioPathByVoiceCloneId(id);

  if (!clonedAudio.found) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  if (!clonedAudio.path) {
    return Response.json(
      { error: "cloned audio is not ready" },
      { status: 404 },
    );
  }

  const object = await env.recordings.get(clonedAudio.path);

  if (!object) {
    return Response.json(
      { error: "cloned audio file not found" },
      { status: 404 },
    );
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
