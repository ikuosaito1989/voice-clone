"use client";

import { useRef, useState } from "react";
import { convertBlobToWav } from "@/lib/audio/convert-blob-to-wav";

type RecorderStatus = "idle" | "recording" | "stopped";
type UploadMessageTone = "default" | "error";

const maxRecordingDurationMs = 10_000;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          action: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          sitekey: string;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

type RecorderProps = {
  turnstileSiteKey: string;
};

export function Recorder({ turnstileSiteKey }: RecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadMessageTone, setUploadMessageTone] =
    useState<UploadMessageTone>("default");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const stopActiveStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearRecordingTimer = () => {
    if (recordingTimerRef.current === null) {
      return;
    }

    window.clearTimeout(recordingTimerRef.current);
    recordingTimerRef.current = null;
  };

  const stopMediaRecorder = () => {
    clearRecordingTimer();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      return true;
    }

    return false;
  };

  const clearUploadState = () => {
    setIsUploading(false);
    setUploadedKey(null);
    setUploadMessage(null);
    setUploadMessageTone("default");
  };

  const setUploadPending = () => {
    setIsUploading(true);
    setUploadedKey(null);
    setUploadMessage(null);
    setUploadMessageTone("default");
  };

  const setUploadError = (message: string) => {
    setIsUploading(false);
    setUploadedKey(null);
    setUploadMessage(message);
    setUploadMessageTone("error");
  };

  const setUploadSuccess = (key: string, message: string) => {
    setIsUploading(false);
    setUploadedKey(key);
    setUploadMessage(message);
    setUploadMessageTone("default");
  };

  const resetRecording = () => {
    clearRecordingTimer();

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    clearUploadState();
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  const handleStart = async () => {
    chunksRef.current = [];
    resetRecording();
    stopActiveStream();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      clearRecordingTimer();

      const blob = new Blob(chunksRef.current, {
        type: mediaRecorder.mimeType || "audio/webm",
      });
      const playbackUrl = URL.createObjectURL(blob);

      setRecordedBlob(blob);
      setRecordedUrl(playbackUrl);
      setStatus("stopped");
      stopActiveStream();
    };

    mediaRecorderRef.current = mediaRecorder;
    streamRef.current = stream;
    mediaRecorder.start();
    recordingTimerRef.current = window.setTimeout(() => {
      stopMediaRecorder();
    }, maxRecordingDurationMs);
    setStatus("recording");
  };

  const handleStop = () => {
    if (stopMediaRecorder()) {
      return;
    }

    stopActiveStream();
  };

  const handleSave = async () => {
    if (!recordedBlob) {
      return;
    }

    if (!turnstileSiteKey) {
      setUploadError("Turnstile site key が未設定です。");
      return;
    }

    const turnstileToken = document.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    )?.value;

    if (!turnstileToken) {
      setUploadError("Turnstile の検証を完了してください。");
      return;
    }

    const wavBlob = await convertBlobToWav(recordedBlob);
    const fileName = `recording-${Date.now()}.wav`;
    const downloadUrl = URL.createObjectURL(wavBlob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(downloadUrl);

    const formData = new FormData();
    formData.append("file", wavBlob, fileName);
    formData.append("turnstileToken", turnstileToken);

    setUploadPending();

    const response = await fetch("/api/recordings", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setUploadError(data?.error ?? "R2 へのアップロードに失敗しました。");
      window.turnstile?.reset();
      return;
    }

    const data = (await response.json()) as { key: string };
    setUploadSuccess(
      data.key,
      "R2 に保存しました。次のアップロード前に再度検証してください。",
    );
    window.turnstile?.reset();
  };

  return (
    <section className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Recorder</h2>
        <p className="text-sm text-black/60">
          ブラウザで録音して WAV 保存できます。アップロードには Turnstile 検証が必要です。
        </p>
      </div>

      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-action="upload_recording"
        />
      ) : (
        <p className="text-sm text-red-700">
          Turnstile site key が未設定のため、アップロードできません。
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={status === "recording"}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-black/30"
        >
          録音開始
        </button>
        <button
          type="button"
          onClick={handleStop}
          disabled={status !== "recording"}
          className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-black/30"
        >
          停止
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={recordedBlob === null || isUploading}
          className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-black/30"
        >
          {isUploading ? "アップロード中..." : "保存してR2へアップロード"}
        </button>
      </div>

      {recordedUrl ? <audio controls src={recordedUrl} className="w-full" /> : null}
      <p className="text-sm text-black/60">状態: {status}</p>
      {uploadedKey ? (
        <p className="text-sm text-emerald-700">R2 に保存しました: {uploadedKey}</p>
      ) : null}
      {uploadMessage ? (
        <p
          className={
            uploadMessageTone === "error"
              ? "text-sm text-red-700"
              : "text-sm text-black/60"
          }
        >
          {uploadMessage}
        </p>
      ) : null}
    </section>
  );
}
