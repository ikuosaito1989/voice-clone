"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { convertBlobToWav } from "@/lib/audio/convert-blob-to-wav";

type FormStep = "record" | "confirm";
type RecorderStatus = "idle" | "recording" | "ready";
type SubmissionState = "idle" | "submitting" | "success" | "error";

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

type VoiceCloneFormProps = {
  turnstileSiteKey: string;
};

const defaultRecordedText =
  "あの、最近少し暖かくなってきましたね。えっと、季節の変わり目は体調を崩しやすいので、無理をせずに過ごすことが大切だと思います。そうですね、しっかり休んで、毎日を元気に過ごしていきたいですね。";

export function VoiceCloneForm({ turnstileSiteKey }: VoiceCloneFormProps) {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [step, setStep] = useState<FormStep>("record");
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>("idle");
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedText, setRecordedText] = useState(defaultRecordedText);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const stopStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const resetRecordedAudio = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setStep("record");
    setRecorderStatus("idle");
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordedText(defaultRecordedText);
    setUploadedId(null);
    setUploadedFileName(null);
    setMessage(null);
    setIsTurnstileVerified(false);
    setSubmissionState("idle");
  };

  const startRecording = async () => {
    chunksRef.current = [];
    resetRecordedAudio();
    stopStream();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const sourceBlob = new Blob(chunksRef.current, {
        type: mediaRecorder.mimeType || "audio/webm",
      });
      const wavBlob = await convertBlobToWav(sourceBlob);
      const url = URL.createObjectURL(wavBlob);

      setRecordedBlob(wavBlob);
      setRecordedUrl(url);
      setRecorderStatus("ready");
      setStep("confirm");
      stopStream();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaStreamRef.current = stream;
    mediaRecorder.start();
    setRecorderStatus("recording");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      return;
    }

    stopStream();
  };

  const returnToRecording = () => {
    setStep("record");
  };

  const attachTurnstile = (node: HTMLDivElement | null) => {
    if (!node) {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
      return;
    }

    if (
      !turnstileSiteKey ||
      !window.turnstile ||
      turnstileWidgetIdRef.current
    ) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(node, {
      sitekey: turnstileSiteKey,
      action: "upload_voice_clone",
      callback: () => {
        setIsTurnstileVerified(true);
      },
      "error-callback": () => {
        setIsTurnstileVerified(false);
      },
      "expired-callback": () => {
        setIsTurnstileVerified(false);
      },
    });
  };

  const completeRecording = async () => {
    if (!recordedBlob) {
      return;
    }

    if (!turnstileSiteKey) {
      setSubmissionState("error");
      setMessage("Turnstile site key が未設定です。");
      return;
    }

    const turnstileToken = document.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    )?.value;

    if (!turnstileToken) {
      setSubmissionState("error");
      setMessage("Turnstile の検証を完了してください。");
      return;
    }

    const fileName = `${Date.now()}.wav`;
    const formData = new FormData();
    formData.append("file", recordedBlob, fileName);
    formData.append("turnstileToken", turnstileToken);
    formData.append("recordedText", recordedText);

    setSubmissionState("submitting");
    setMessage(null);
    setUploadedId(null);
    setUploadedFileName(null);

    const response = await fetch("/api/reference_audio", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setSubmissionState("error");
      setMessage(data?.error ?? "アップロードに失敗しました。");
      window.turnstile?.reset();
      return;
    }

    const data = (await response.json()) as {
      id: string;
      referenceAudioPath: string;
      recordedText: string;
    };

    setSubmissionState("success");
    setUploadedId(data.id);
    setUploadedFileName(data.referenceAudioPath);
    setMessage("R2 へのアップロードと D1 への登録が完了しました。");
    window.turnstile?.reset();
    router.push(`/voice-clone/${data.id}`);
  };

  return (
    <section className="flex min-h-[80vh] w-full items-center justify-center">
      {step === "record" ? (
        <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-10 rounded-[2.5rem] bg-slate-950 px-8 py-14 text-white shadow-[0_30px_120px_rgba(15,23,42,0.3)]">
          <button
            type="button"
            onClick={startRecording}
            disabled={recorderStatus === "recording"}
            className="h-48 w-48 rounded-full bg-emerald-400 text-2xl font-semibold text-slate-950 shadow-[0_20px_80px_rgba(74,222,128,0.45)] disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            録音
          </button>
          <button
            type="button"
            onClick={stopRecording}
            disabled={recorderStatus !== "recording"}
            className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
          >
            録音を止める
          </button>
          <p className="text-sm text-white/60">状態: {recorderStatus}</p>
          <div className="max-w-3xl space-y-3 text-center">
            <p className="text-base font-semibold text-white">
              次の例文を読み上げてください
            </p>
            <p className="text-lg leading-8 text-white/85">
              {defaultRecordedText}
            </p>
          </div>
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 rounded-[2.5rem] bg-amber-50 px-8 py-14 text-slate-950 shadow-[0_30px_120px_rgba(120,53,15,0.14)]">
          <p className="text-3xl font-semibold">これでよろしいですか？</p>
          {recordedUrl ? (
            <audio controls src={recordedUrl} className="w-full max-w-2xl" />
          ) : null}
          <label className="flex w-full max-w-2xl flex-col gap-3 text-left">
            <span className="text-sm font-semibold text-slate-700">
              録音した文章
            </span>
            <textarea
              value={recordedText}
              onChange={(event) => setRecordedText(event.currentTarget.value)}
              rows={5}
              className="w-full resize-y rounded-2xl border border-amber-200 bg-white px-4 py-3 text-base leading-7 text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </label>
          <div className="flex flex-col items-center gap-4">
            {turnstileSiteKey ? (
              <div ref={attachTurnstile} className="min-h-16" />
            ) : (
              <p className="text-sm text-red-700">
                Turnstile site key が未設定です。
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={returnToRecording}
                className="rounded-full border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700"
              >
                録り直す
              </button>
              <button
                type="button"
                onClick={completeRecording}
                disabled={
                  recordedBlob === null ||
                  submissionState === "submitting" ||
                  !isTurnstileVerified ||
                  recordedText.trim().length === 0
                }
                className="rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {submissionState === "submitting" ? "アップロード中..." : "OK"}
              </button>
            </div>
          </div>
          {!isTurnstileVerified ? (
            <p className="text-sm text-slate-600">
              Turnstile 検証が完了すると OK を押せます。
            </p>
          ) : null}
          {uploadedId ? (
            <p className="text-sm text-slate-600">id: {uploadedId}</p>
          ) : null}
          {uploadedFileName ? (
            <p className="break-all text-sm text-slate-600">
              reference_audio_path: {uploadedFileName}
            </p>
          ) : null}
          {message ? (
            <p
              className={
                submissionState === "error"
                  ? "text-sm text-red-700"
                  : "text-sm text-emerald-700"
              }
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
