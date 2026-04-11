const encoder = new TextEncoder();

export type DonePayload = {
  message: string;
  time: string;
};

export const TEST_EVENTS_OBJECT_NAME = "test-events";
export const LAST_EVENT_KEY = "last-done-event";

export function formatDoneEvent(payload: DonePayload) {
  return encoder.encode(`event: done\ndata: ${JSON.stringify(payload)}\n\n`);
}

export function createDonePayload(date = new Date()) {
  const time = date.toLocaleTimeString("ja-JP", {
    hour12: false,
    timeZone: "Asia/Tokyo",
  });

  return {
    message: `${time}にAPIが叩かれました`,
    time,
  } satisfies DonePayload;
}

export function isDonePayload(value: unknown): value is DonePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.message === "string" && typeof candidate.time === "string"
  );
}
