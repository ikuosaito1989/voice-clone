import { getCloudflareContext } from "@opennextjs/cloudflare";
import { findReferenceAudioPathByVoiceCloneId } from "@/server/repositories/voice-clones";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/reference_audio/[id]/file">,
) {
  const { id: rawId } = await context.params;
  const id = rawId.trim();

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const referenceAudioPath = await findReferenceAudioPathByVoiceCloneId(id);

  if (!referenceAudioPath) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  const object = await env.recordings.get(referenceAudioPath);

  if (!object) {
    return Response.json(
      { error: "reference audio file not found" },
      { status: 404 },
    );
  }

  const headers: Record<string, string> = {
    etag: object.httpEtag,
    "content-disposition": `inline; filename="${referenceAudioPath.split("/").at(-1) ?? `${id}.wav`}"`,
    "content-type": object.httpMetadata?.contentType ?? "audio/wav",
  };

  return new Response(object.body, {
    headers,
  });
}
