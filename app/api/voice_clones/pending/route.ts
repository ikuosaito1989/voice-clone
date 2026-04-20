import { listPendingVoiceClones } from "@/server/repositories/voice-clones";

export async function GET() {
  const pendingVoiceClones = await listPendingVoiceClones();

  return Response.json(pendingVoiceClones);
}
