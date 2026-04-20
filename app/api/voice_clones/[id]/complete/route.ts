import { getCloudflareContext } from "@opennextjs/cloudflare";
import { publishVoiceCloneCompletedEvent } from "@/server/events/voice-clone-events-client";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // const { id } = await context.params;
  // const formData = await request.formData();
  // const file = formData.get("file");

  // if (!id) {
  //   return Response.json({ error: "id is required" }, { status: 400 });
  // }

  // if (!(file instanceof File)) {
  //   return Response.json({ error: "file is required" }, { status: 400 });
  // }

  // if (file.size > 10 * 1024 * 1024) {
  //   return Response.json({ error: "file is too large" }, { status: 413 });
  // }

  // const { env } = await getCloudflareContext({ async: true });
  // const db = drizzle(env.voice_clone);

  // const [voiceClone] = await db
  //   .select({ id: voiceClones.id })
  //   .from(voiceClones)
  //   .where(eq(voiceClones.id, id))
  //   .limit(1);

  // if (!voiceClone) {
  //   return Response.json({ error: "voice clone not found" }, { status: 404 });
  // }

  // const fallbackFileName = `cloned-${Date.now()}.wav`;
  // const fileName = sanitizeFileName(
  //   file.name || fallbackFileName,
  //   fallbackFileName,
  // );
  // const objectKey = `clone/${id}/${fileName}`;
  // const clonedAt = new Date();

  // await env.recordings.put(objectKey, file, {
  //   httpMetadata: {
  //     contentType: file.type || "audio/wav",
  //   },
  // });

  // await db
  //   .update(voiceClones)
  //   .set({
  //     isCloned: true,
  //     clonedAt,
  //     clonedAudioPath: objectKey,
  //     updatedAt: clonedAt,
  //   })
  //   .where(eq(voiceClones.id, id));

  // const pendingVoiceClones = await getPendingVoiceClones(db);

  // await uploadPendingVoiceClonesSnapshot(env.recordings, pendingVoiceClones);
  // await publishVoiceCloneCompletedEvent(env, id, clonedAt);

  // return Response.json({
  //   ok: true,
  //   id,
  //   clonedAudioPath: objectKey,
  //   clonedAt: clonedAt.toISOString(),
  // });

  const { env } = await getCloudflareContext({ async: true });
  const { id } = await context.params;
  await publishVoiceCloneCompletedEvent(env, id, new Date());
  return Response.json({});
}
