import {
  createDonePayload,
  TEST_EVENTS_OBJECT_NAME,
  type DonePayload,
} from "@/lib/test-events-shared";

function getTestEventsStub(env: CloudflareEnv) {
  const id = env.TEST_EVENTS_DO.idFromName(TEST_EVENTS_OBJECT_NAME);
  return env.TEST_EVENTS_DO.get(id);
}

export function createTestEventsStreamResponse(env: CloudflareEnv) {
  return getTestEventsStub(env).fetch("https://test-events/subscribe");
}

export async function publishDoneEvent(env: CloudflareEnv, date = new Date()) {
  const payload = createDonePayload(date);
  const response = await getTestEventsStub(env).fetch(
    "https://test-events/publish",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return (await response.json()) as DonePayload;
}
