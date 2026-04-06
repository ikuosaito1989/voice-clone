import { publishDoneEvent } from "@/lib/test-events";

export async function POST() {
  const event = publishDoneEvent();

  return Response.json({
    ok: true,
    message: event.message,
    time: event.time,
  });
}
