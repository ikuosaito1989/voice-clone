import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { voiceClones } from "@/lib/db/schema";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.voice_clone);

  const pendingVoiceClones = await db
    .select({
      id: voiceClones.id,
      fileName: voiceClones.fileName,
    })
    .from(voiceClones)
    .where(eq(voiceClones.isCloned, false));

  return Response.json({
    items: pendingVoiceClones,
  });
}
