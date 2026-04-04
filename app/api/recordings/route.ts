import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const key = `${Date.now()}-${crypto.randomUUID()}.wav`;

  await env.recordings.put(key, file, {
    httpMetadata: {
      contentType: file.type || "audio/wav",
    },
  });

  return Response.json({ key });
}
