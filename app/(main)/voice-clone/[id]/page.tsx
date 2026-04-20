import { connection } from "next/server";
import { notFound } from "next/navigation";
import { VoiceCloneStatus } from "@/app/_components/voice-clone-status";
import { findVoiceCloneById } from "@/server/repositories/voice-clones";

export default async function VoiceClonePage(
  props: PageProps<"/voice-clone/[id]">,
) {
  await connection();

  const { id } = await props.params;
  const voiceClone = await findVoiceCloneById(id);

  if (!voiceClone) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_28%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <section className="w-full rounded-[2.5rem] bg-white/90 p-8 text-center shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur">
          <VoiceCloneStatus
            id={voiceClone.id}
            initialIsCloned={voiceClone.isCloned}
          />
        </section>
      </div>
    </main>
  );
}
