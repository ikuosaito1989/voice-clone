import {
  createVoiceCloneCompletedPayload,
  type VoiceCloneCompletedPayload,
} from "@/server/events/voice-clone-events-shared";

function getVoiceCloneEventsStub(env: CloudflareEnv, id: string) {
  const durableObjectId = env.VOICE_CLONE_EVENTS_DO.idFromName(
    `voice-clone:${id}`,
  );

  return env.VOICE_CLONE_EVENTS_DO.get(durableObjectId);
}

export function createVoiceCloneEventsStreamResponse(
  env: CloudflareEnv,
  id: string,
) {
  return getVoiceCloneEventsStub(env, id).fetch(
    "https://voice-clone-events/subscribe",
  );
}

export async function publishVoiceCloneCompletedEvent(
  env: CloudflareEnv,
  id: string,
  clonedAt: Date,
) {
  const payload = createVoiceCloneCompletedPayload(id, clonedAt);
  const response = await getVoiceCloneEventsStub(env, id).fetch(
    "https://voice-clone-events/publish",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return (await response.json()) as VoiceCloneCompletedPayload;
}
