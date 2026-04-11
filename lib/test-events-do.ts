import { DurableObject } from "cloudflare:workers";
import {
  formatDoneEvent,
  isDonePayload,
  LAST_EVENT_KEY,
  type DonePayload,
  createDonePayload,
} from "@/lib/test-events-shared";

type Subscriber = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  close: () => void;
  closed: boolean;
};

const encoder = new TextEncoder();

export class TestEventsDurableObject extends DurableObject<CloudflareEnv> {
  private subscribers = new Set<Subscriber>();
  private lastPayload: DonePayload | null = null;

  constructor(ctx: DurableObjectState, env: CloudflareEnv) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      this.lastPayload =
        (await ctx.storage.get<DonePayload>(LAST_EVENT_KEY)) ?? null;
    });
  }

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

        if (this.lastPayload) {
          controller.enqueue(formatDoneEvent(this.lastPayload));
        }

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
    const payload = isDonePayload(parsed) ? parsed : createDonePayload();

    this.lastPayload = payload;
    await this.ctx.storage.put(LAST_EVENT_KEY, payload);

    for (const subscriber of this.subscribers) {
      if (!subscriber.closed) {
        subscriber.controller.enqueue(formatDoneEvent(payload));
      }
    }

    return Response.json(payload);
  }
}
