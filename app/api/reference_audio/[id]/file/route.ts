import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";

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
  const db = drizzle(env.voice_clone);

  const [voiceClone] = await db
    .select({
      fileName: voiceClones.fileName,
    })
    .from(voiceClones)
    .where(eq(voiceClones.id, id))
    .limit(1);

  if (!voiceClone) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  const object = await env.recordings.get(voiceClone.fileName);

  if (!object) {
    return Response.json(
      { error: "reference audio file not found" },
      { status: 404 },
    );
  }

  const headers: Record<string, string> = {
    etag: object.httpEtag,
    "content-disposition": `inline; filename="${voiceClone.fileName.split("/").at(-1) ?? `${id}.wav`}"`,
    "content-type": object.httpMetadata?.contentType ?? "audio/wav",
  };

  return new Response(object.body, {
    headers,
  });
}
