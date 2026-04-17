import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { getPendingVoiceClones } from "@/lib/voice-clones/pending";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.voice_clone);
  const pendingVoiceClones = await getPendingVoiceClones(db);

  return Response.json(pendingVoiceClones);
}
