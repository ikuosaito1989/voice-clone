import { connection } from "next/server";
import { VoiceCloneForm } from "@/app/_components/voice-clone-form";

export default async function Home() {
  await connection();

  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f99d_0%,#f8fafc_24%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <VoiceCloneForm turnstileSiteKey={turnstileSiteKey} />
      </div>
    </main>
  );
}
