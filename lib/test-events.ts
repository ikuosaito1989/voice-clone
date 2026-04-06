const encoder = new TextEncoder();
const subscribers = new Set<ReadableStreamDefaultController<Uint8Array>>();

type DonePayload = {
  message: string;
  time: string;
};

function formatDoneEvent(payload: DonePayload) {
  return encoder.encode(
    `event: done\ndata: ${JSON.stringify(payload)}\n\n`,
  );
}

export function createTestEventsStream() {
  let currentController: ReadableStreamDefaultController<Uint8Array> | null =
    null;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      currentController = controller;
      subscribers.add(controller);
    },
    cancel() {
      if (currentController) {
        subscribers.delete(currentController);
      }
    },
  });
}

export function publishDoneEvent(date = new Date()) {
  const time = date.toLocaleTimeString("ja-JP", {
    hour12: false,
    timeZone: "Asia/Tokyo",
  });
  const payload = {
    message: `${time}にAPIが叩かれました`,
    time,
  } satisfies DonePayload;

  subscribers.forEach((controller) => {
    try {
      controller.enqueue(formatDoneEvent(payload));
    } catch {
      subscribers.delete(controller);
    }
  });

  return payload;
}
