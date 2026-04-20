import { DurableObject } from "cloudflare:workers";
import {
  formatVoiceCloneCompletedEvent,
  isVoiceCloneCompletedPayload,
} from "@/server/events/voice-clone-events-shared";

type Subscriber = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  close: () => void;
  closed: boolean;
};

const encoder = new TextEncoder();

export class VoiceCloneEventsDurableObject extends DurableObject<CloudflareEnv> {
  private subscribers = new Set<Subscriber>();

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/subscribe") {
      return this.handleSubscribe(request);
    }

    if (request.method === "POST" && url.pathname === "/publish") {
      return this.handlePublish(request);
    }

    return Response.json({ error: "not found" }, { status: 404 });
  }

  private handleSubscribe(request: Request) {
    let subscriber: Subscriber | null = null;

    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        const close = () => {
          if (!subscriber || subscriber.closed) {
            return;
          }

          subscriber.closed = true;
          this.subscribers.delete(subscriber);
          controller.close();
        };

        subscriber = {
          controller,
          close,
          closed: false,
        };

        this.subscribers.add(subscriber);
        controller.enqueue(encoder.encode(": connected\n\n"));

        request.signal.addEventListener("abort", close, { once: true });
      },
      cancel: () => {
        subscriber?.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  }

  private async handlePublish(request: Request) {
    const parsed = (await request.json()) as unknown;

    if (!isVoiceCloneCompletedPayload(parsed)) {
      return Response.json({ error: "invalid payload" }, { status: 400 });
    }

    for (const subscriber of this.subscribers) {
      if (!subscriber.closed) {
        subscriber.controller.enqueue(formatVoiceCloneCompletedEvent(parsed));
      }
    }

    return Response.json(parsed);
  }
}
