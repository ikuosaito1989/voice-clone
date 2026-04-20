import { eq, inArray, lte } from "drizzle-orm";
import { toIso8601 } from "@/lib/to-iso-8601";
import { createDatabase, getDatabase } from "@/server/db/database";
import { voiceClones } from "@/server/db/schema";

export type CreateVoiceCloneInput = {
  id: string;
  referenceAudioPath: string;
  recordedText: string;
  desiredText: string;
};

export type PendingVoiceCloneItem = {
  id: string;
  referenceAudioPath: string;
  recordedText: string;
  desiredText: string;
};

export type PendingVoiceClonesResponse = {
  items: PendingVoiceCloneItem[];
};

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

export type StaleVoiceClone = {
  id: string;
  referenceAudioPath: string;
  clonedAudioPath: string | null;
};

export type VoiceCloneFileLookup = {
  found: boolean;
  path: string | null;
};

function toVoiceCloneDetail(voiceClone: {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isCloned: boolean;
  clonedAt: Date | null;
  referenceAudioPath: string;
  clonedAudioPath: string | null;
  recordedText: string;
  desiredText: string;
}): VoiceCloneDetail {
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

export async function createVoiceClone(input: CreateVoiceCloneInput) {
  const db = await getDatabase();

  await db.insert(voiceClones).values({
    id: input.id,
    isCloned: false,
    clonedAt: null,
    referenceAudioPath: input.referenceAudioPath,
    clonedAudioPath: null,
    recordedText: input.recordedText,
    desiredText: input.desiredText,
  });
}

export async function findVoiceCloneById(
  id: string,
): Promise<VoiceCloneDetail | null> {
  const db = await getDatabase();
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

  return toVoiceCloneDetail(voiceClone);
}

export async function findReferenceAudioPathByVoiceCloneId(
  id: string,
): Promise<string | null> {
  const db = await getDatabase();
  const [voiceClone] = await db
    .select({
      referenceAudioPath: voiceClones.referenceAudioPath,
    })
    .from(voiceClones)
    .where(eq(voiceClones.id, id))
    .limit(1);

  return voiceClone?.referenceAudioPath ?? null;
}

export async function findClonedAudioPathByVoiceCloneId(
  id: string,
): Promise<VoiceCloneFileLookup> {
  const db = await getDatabase();
  const [voiceClone] = await db
    .select({
      clonedAudioPath: voiceClones.clonedAudioPath,
    })
    .from(voiceClones)
    .where(eq(voiceClones.id, id))
    .limit(1);

  if (!voiceClone) {
    return {
      found: false,
      path: null,
    };
  }

  return {
    found: true,
    path: voiceClone.clonedAudioPath,
  };
}

export async function listPendingVoiceClones(): Promise<PendingVoiceClonesResponse> {
  const db = await getDatabase();
  const items = await db
    .select({
      id: voiceClones.id,
      referenceAudioPath: voiceClones.referenceAudioPath,
      recordedText: voiceClones.recordedText,
      desiredText: voiceClones.desiredText,
    })
    .from(voiceClones)
    .where(eq(voiceClones.isCloned, false));

  return {
    items,
  };
}

export async function getStaleVoiceClones(
  database: D1Database,
  cutoff: Date,
): Promise<StaleVoiceClone[]> {
  const db = createDatabase(database);

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

  const db = createDatabase(database);

  await db.delete(voiceClones).where(
    inArray(
      voiceClones.id,
      staleVoiceClones.map((voiceClone) => voiceClone.id),
    ),
  );
}
