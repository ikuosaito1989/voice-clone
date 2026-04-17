import { eq } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";

type Database = ReturnType<typeof drizzle>;

export type PendingVoiceCloneItem = {
  id: string;
  referenceAudioPath: string;
  recordedText: string;
};

export type PendingVoiceClonesResponse = {
  items: PendingVoiceCloneItem[];
};

export async function getPendingVoiceClones(
  db: Database,
): Promise<PendingVoiceClonesResponse> {
  const items = await db
    .select({
      id: voiceClones.id,
      referenceAudioPath: voiceClones.referenceAudioPath,
      recordedText: voiceClones.recordedText,
    })
    .from(voiceClones)
    .where(eq(voiceClones.isCloned, false));

  return {
    items,
  };
}

export async function uploadPendingVoiceClonesSnapshot(
  bucket: R2Bucket,
  pendingVoiceClones: PendingVoiceClonesResponse,
) {
  const objectKey = "voice_clones/pending.json";

  await bucket.put(objectKey, JSON.stringify(pendingVoiceClones), {
    httpMetadata: {
      contentType: "application/json",
    },
  });

  return objectKey;
}
