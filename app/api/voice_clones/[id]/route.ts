import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";
import { toIso8601 } from "@/lib/db/to-iso-8601";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
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
      id: voiceClones.id,
      createdAt: voiceClones.createdAt,
      updatedAt: voiceClones.updatedAt,
      isCloned: voiceClones.isCloned,
      clonedAt: voiceClones.clonedAt,
      referenceAudioPath: voiceClones.referenceAudioPath,
      clonedAudioPath: voiceClones.clonedAudioPath,
      recordedText: voiceClones.recordedText,
      desiredText: voiceClones.desiredText,
    })
    .from(voiceClones)
    .where(eq(voiceClones.id, id))
    .limit(1);

  if (!voiceClone) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  return Response.json({
    id: voiceClone.id,
    createdAt: toIso8601(voiceClone.createdAt),
    updatedAt: toIso8601(voiceClone.updatedAt),
    isCloned: voiceClone.isCloned,
    clonedAt: toIso8601(voiceClone.clonedAt),
    referenceAudioPath: voiceClone.referenceAudioPath,
    clonedAudioPath: voiceClone.clonedAudioPath,
    recordedText: voiceClone.recordedText,
    desiredText: voiceClone.desiredText,
  });
}
