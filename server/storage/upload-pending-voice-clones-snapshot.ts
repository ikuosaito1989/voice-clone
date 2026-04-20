import type { PendingVoiceClonesResponse } from "@/server/repositories/voice-clones";

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
