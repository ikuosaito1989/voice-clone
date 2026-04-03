"use client";

import { useRef, useState } from "react";
import { convertBlobToWav } from "@/lib/audio/convert-blob-to-wav";

type RecorderStatus = "idle" | "recording" | "stopped";

export default function Home() {
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

  const handleStart = async () => {
    chunksRef.current = [];
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
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleStart}
          disabled={status === "recording"}
        >
          録音開始
        </button>
        <button
          type="button"
          onClick={handleStop}
          disabled={status !== "recording"}
        >
          停止
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={recordedBlob === null}
        >
          保存
        </button>
        {recordedUrl ? <audio controls src={recordedUrl} /> : null}
        <p>状態: {status}</p>
      </div>
    </main>
  );
}
