import { findVoiceCloneById } from "@/server/repositories/voice-clones";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = rawId.trim();

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const voiceClone = await findVoiceCloneById(id);

  if (!voiceClone) {
    return Response.json({ error: "voice clone not found" }, { status: 404 });
  }

  return Response.json(voiceClone);
}
