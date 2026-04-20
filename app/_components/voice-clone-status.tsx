"use client";

import { startTransition, useSyncExternalStore } from "react";
import { VoiceCloneCompleteState } from "@/app/_components/voice-clone-complete-state";
import { VoiceCloneLoadingState } from "@/app/_components/voice-clone-loading-state";
import { parseVoiceCloneCompletedPayload } from "@/server/events/voice-clone-events-shared";

type VoiceCloneStatusProps = {
  id: string;
  initialIsCloned: boolean;
};

let currentId: string | null = null;
let snapshot = false;
let eventSource: EventSource | null = null;
const listeners = new Set<() => void>();

function emit(nextValue: boolean) {
  snapshot = nextValue;
  listeners.forEach((listener) => listener());
}

function ensureEventSource(id: string) {
  if (typeof window === "undefined" || eventSource || snapshot) {
    return;
  }

  currentId = id;
  eventSource = new EventSource(`/api/voice_clones/${id}/events`);

  eventSource.addEventListener("completed", (event) => {
    const data = JSON.parse((event as MessageEvent).data) as unknown;
    const payloadResult = parseVoiceCloneCompletedPayload(data);

    if (!payloadResult.success || payloadResult.data.id !== id) {
      return;
    }

    startTransition(() => {
      emit(true);
    });
  });
}

function subscribe(id: string, initialIsCloned: boolean, listener: () => void) {
  if (currentId !== id) {
    eventSource?.close();
    eventSource = null;
    currentId = id;
    snapshot = initialIsCloned;
  } else if (initialIsCloned && !snapshot) {
    snapshot = true;
  }

  listeners.add(listener);
  ensureEventSource(id);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(initialIsCloned: boolean) {
  return initialIsCloned;
}

export function VoiceCloneStatus({
  id,
  initialIsCloned,
}: VoiceCloneStatusProps) {
  const isCloned = useSyncExternalStore(
    (listener) => subscribe(id, initialIsCloned, listener),
    getSnapshot,
    () => getServerSnapshot(initialIsCloned),
  );

  return isCloned ? (
    <VoiceCloneCompleteState id={id} />
  ) : (
    <VoiceCloneLoadingState />
  );
}
