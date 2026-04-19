const encoder = new TextEncoder();

export type VoiceCloneCompletedPayload = {
  id: string;
  clonedAt: string;
};

const voiceCloneCompletedPayloadSchema = {
  id: "string",
  clonedAt: "string",
} as const;

export function formatVoiceCloneCompletedEvent(
  payload: VoiceCloneCompletedPayload,
) {
  return encoder.encode(
    `event: completed\ndata: ${JSON.stringify(payload)}\n\n`,
  );
}

export function createVoiceCloneCompletedPayload(
  id: string,
  clonedAt: Date,
): VoiceCloneCompletedPayload {
  return {
    id,
    clonedAt: clonedAt.toISOString(),
  };
}

export function isVoiceCloneCompletedPayload(
  value: unknown,
): value is VoiceCloneCompletedPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return Object.entries(voiceCloneCompletedPayloadSchema).every(
    ([key, expectedType]) => typeof candidate[key] === expectedType,
  );
}
