"use client";

import { useRef, useState } from "react";
import { convertBlobToWav } from "@/lib/audio/convert-blob-to-wav";

type RecorderStatus = "idle" | "recording" | "stopped";

export function Recorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const stopActiveStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const resetRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

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
    setStatus("recording");
  };

  const handleStop = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      return;
    }

    stopActiveStream();
  };

  const handleSave = async () => {
    if (!recordedBlob) {
      return;
    }

    const wavBlob = await convertBlobToWav(recordedBlob);
    const downloadUrl = URL.createObjectURL(wavBlob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = `recording-${Date.now()}.wav`;
    anchor.click();

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <section className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Recorder</h2>
        <p className="text-sm text-black/60">ブラウザで録音して WAV 保存できます。</p>
      </div>

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
          disabled={recordedBlob === null}
          className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-black/30"
        >
          保存
        </button>
      </div>

      {recordedUrl ? <audio controls src={recordedUrl} className="w-full" /> : null}
      <p className="text-sm text-black/60">状態: {status}</p>
    </section>
  );
}
