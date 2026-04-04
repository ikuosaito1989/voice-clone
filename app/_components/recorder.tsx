"use client";

import { useRef, useState } from "react";
import { convertBlobToWav } from "@/lib/audio/convert-blob-to-wav";

type RecorderStatus = "idle" | "recording" | "stopped";
type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

export function Recorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
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

    setUploadStatus("idle");
    setUploadedKey(null);
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
    const fileName = `recording-${Date.now()}.wav`;
    const downloadUrl = URL.createObjectURL(wavBlob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(downloadUrl);

    const formData = new FormData();
    formData.append("file", wavBlob, fileName);

    setUploadStatus("uploading");
    setUploadedKey(null);

    const response = await fetch("/api/recordings", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setUploadStatus("error");
      return;
    }

    const data = (await response.json()) as { key: string };
    setUploadedKey(data.key);
    setUploadStatus("uploaded");
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
          disabled={recordedBlob === null || uploadStatus === "uploading"}
          className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-black/30"
        >
          {uploadStatus === "uploading" ? "アップロード中..." : "保存してR2へアップロード"}
        </button>
      </div>

      {recordedUrl ? <audio controls src={recordedUrl} className="w-full" /> : null}
      <p className="text-sm text-black/60">状態: {status}</p>
      {uploadStatus === "uploaded" ? (
        <p className="text-sm text-emerald-700">R2 に保存しました: {uploadedKey}</p>
      ) : null}
      {uploadStatus === "error" ? (
        <p className="text-sm text-red-700">R2 へのアップロードに失敗しました。</p>
      ) : null}
    </section>
  );
}
