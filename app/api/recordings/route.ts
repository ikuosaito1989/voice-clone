import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const turnstileToken = formData.get("turnstileToken");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  if (typeof turnstileToken !== "string" || turnstileToken.length === 0) {
    return Response.json(
      { error: "turnstile token is required" },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "file is too large" }, { status: 413 });
  }

  const { env } = await getCloudflareContext({ async: true });
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

  if (verificationResult.action !== "upload_recording") {
    return Response.json(
      { error: "invalid turnstile action" },
      { status: 403 },
    );
  }

  const key = `${Date.now()}-${crypto.randomUUID()}.wav`;

  await env.recordings.put(key, file, {
    httpMetadata: {
      contentType: file.type || "audio/wav",
    },
  });

  return Response.json({ key });
}
