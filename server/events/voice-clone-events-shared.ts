import { z } from "zod";

const encoder = new TextEncoder();

export const voiceCloneCompletedPayloadSchema = z.object({
  id: z.string(),
  clonedAt: z.iso.datetime(),
});

export type VoiceCloneCompletedPayload = z.infer<
  typeof voiceCloneCompletedPayloadSchema
>;

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
  return voiceCloneCompletedPayloadSchema.parse({
    id,
    clonedAt: clonedAt.toISOString(),
  });
}

export function parseVoiceCloneCompletedPayload(value: unknown) {
  return voiceCloneCompletedPayloadSchema.safeParse(value);
}
