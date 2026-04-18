import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";
import { toIso8601 } from "@/lib/db/to-iso-8601";

export type VoiceCloneDetail = {
  id: string;
  createdAt: string;
  updatedAt: string;
  isCloned: boolean;
  clonedAt: string | null;
  referenceAudioPath: string;
  clonedAudioPath: string | null;
  recordedText: string;
  desiredText: string;
};

export async function getVoiceClone(
  id: string,
): Promise<VoiceCloneDetail | null> {
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
    return null;
  }

  const createdAt = toIso8601(voiceClone.createdAt);
  const updatedAt = toIso8601(voiceClone.updatedAt);

  if (!createdAt || !updatedAt) {
    throw new Error("voice clone timestamps are missing");
  }

  return {
    id: voiceClone.id,
    createdAt,
    updatedAt,
    isCloned: voiceClone.isCloned,
    clonedAt: toIso8601(voiceClone.clonedAt),
    referenceAudioPath: voiceClone.referenceAudioPath,
    clonedAudioPath: voiceClone.clonedAudioPath,
    recordedText: voiceClone.recordedText,
    desiredText: voiceClone.desiredText,
  };
}
