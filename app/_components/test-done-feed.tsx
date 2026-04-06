"use client";

import { startTransition, useSyncExternalStore } from "react";

const defaultMessage = "まだAPIは叩かれていません。";

let snapshot = defaultMessage;
let eventSource: EventSource | null = null;
const listeners = new Set<() => void>();

function emit(nextMessage: string) {
  snapshot = nextMessage;
  listeners.forEach((listener) => listener());
}

function ensureEventSource() {
  if (typeof window === "undefined" || eventSource) {
    return;
  }

  eventSource = new EventSource("/api/test/events");

  eventSource.addEventListener("done", (event) => {
    const data = JSON.parse((event as MessageEvent).data) as {
      message?: string;
    };

    startTransition(() => {
      emit(data.message ?? "APIが叩かれました。");
    });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureEventSource();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && eventSource) {
      eventSource.close();
      eventSource = null;
      snapshot = defaultMessage;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return defaultMessage;
}

export function TestDoneFeed() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <section className="flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Test Events</h2>
        <p className="text-sm text-black/60">
          `/api/test/complete` が叩かれたら `done` イベントを受け取ります。
        </p>
      </div>

      <div className="rounded-lg bg-black/5 p-4">
        <p className="text-sm text-black/80">{current}</p>
      </div>
    </section>
  );
}
