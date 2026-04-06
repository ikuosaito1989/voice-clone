import { createTestEventsStream } from "@/lib/test-events";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(createTestEventsStream(), {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
