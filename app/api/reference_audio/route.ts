import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createVoiceClone,
  listPendingVoiceClones,
} from "@/server/repositories/voice-clones";
import { sanitizeFileName } from "@/server/storage/sanitize-file-name";
import { uploadPendingVoiceClonesSnapshot } from "@/server/storage/upload-pending-voice-clones-snapshot";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const turnstileToken = formData.get("turnstileToken");
  const recordedText = formData.get("recordedText");
  const desiredText = formData.get("desiredText");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  if (typeof turnstileToken !== "string" || turnstileToken.length === 0) {
    return Response.json(
      { error: "turnstile token is required" },
      { status: 400 },
    );
  }

  if (typeof recordedText !== "string" || recordedText.trim().length === 0) {
    return Response.json(
      { error: "recorded text is required" },
      { status: 400 },
    );
  }

  if (typeof desiredText !== "string" || desiredText.trim().length === 0) {
    return Response.json(
      { error: "desired text is required" },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "file is too large" }, { status: 413 });
  }

  if (file.type !== "audio/wav") {
    return Response.json({ error: "wav file is required" }, { status: 400 });
  }

  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY ?? "";

  if (!turnstileSecretKey) {
    return Response.json(
      { error: "turnstile secret is not configured" },
      { status: 500 },
    );
  }

  const verificationBody = new FormData();
  verificationBody.append("secret", turnstileSecretKey);
  verificationBody.append("response", turnstileToken);
  verificationBody.append(
    "remoteip",
    request.headers.get("cf-connecting-ip") ?? "",
  );

  const verificationResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: verificationBody,
    },
  );
  const verificationResult = (await verificationResponse.json()) as {
    action?: string;
    success: boolean;
  };

  if (!verificationResponse.ok || !verificationResult.success) {
    return Response.json(
      { error: "turnstile verification failed" },
      { status: 403 },
    );
  }

  if (verificationResult.action !== "upload_voice_clone") {
    return Response.json(
      { error: "invalid turnstile action" },
      { status: 403 },
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const id = crypto.randomUUID();
  const fallbackFileName = `${crypto.randomUUID()}.wav`;
  const fileName = sanitizeFileName(
    file.name || fallbackFileName,
    fallbackFileName,
  );
  const objectKey = `reference_audio/${id}/${fileName}`;

  await env.recordings.put(objectKey, file, {
    httpMetadata: {
      contentType: "audio/wav",
    },
  });

  await createVoiceClone({
    id,
    referenceAudioPath: objectKey,
    recordedText: recordedText.trim(),
    desiredText: desiredText.trim(),
  });

  const pendingVoiceClones = await listPendingVoiceClones();

  await uploadPendingVoiceClonesSnapshot(env.recordings, pendingVoiceClones);

  return Response.json({
    id,
    referenceAudioPath: objectKey,
    recordedText: recordedText.trim(),
    desiredText: desiredText.trim(),
  });
}
