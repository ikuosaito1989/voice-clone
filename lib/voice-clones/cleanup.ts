import { inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";

export type StaleVoiceClone = {
  id: string;
  referenceAudioPath: string;
  clonedAudioPath: string | null;
};

export async function getStaleVoiceClones(
  database: D1Database,
  cutoff: Date,
): Promise<StaleVoiceClone[]> {
  const db = drizzle(database);

  return db
    .select({
      id: voiceClones.id,
      referenceAudioPath: voiceClones.referenceAudioPath,
      clonedAudioPath: voiceClones.clonedAudioPath,
    })
    .from(voiceClones)
    .where(lte(voiceClones.updatedAt, cutoff));
}

export async function deleteVoiceCloneRecords(
  database: D1Database,
  staleVoiceClones: StaleVoiceClone[],
) {
  if (staleVoiceClones.length === 0) {
    return;
  }

  const db = drizzle(database);

  await db.delete(voiceClones).where(
    inArray(
      voiceClones.id,
      staleVoiceClones.map((voiceClone) => voiceClone.id),
    ),
  );
}
