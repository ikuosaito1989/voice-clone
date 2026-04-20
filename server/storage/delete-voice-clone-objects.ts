import type { StaleVoiceClone } from "@/server/repositories/voice-clones";

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

export async function deleteVoiceCloneObjects(
  bucket: R2Bucket,
  staleVoiceClones: StaleVoiceClone[],
) {
  const objectKeys = Array.from(
    new Set(
      staleVoiceClones
        .flatMap((voiceClone) => [
          voiceClone.referenceAudioPath,
          voiceClone.clonedAudioPath,
        ])
        .filter(isDefined),
    ),
  );

  if (objectKeys.length === 0) {
    return;
  }

  await bucket.delete(objectKeys);
}
