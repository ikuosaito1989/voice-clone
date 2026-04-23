import { connection } from "next/server";
import { auth, signIn, signOut } from "@/auth";
import { VoiceCloneForm } from "@/app/_components/voice-clone-form";

export default async function Home() {
  await connection();

  const session = await auth();
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f99d_0%,#f8fafc_24%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-6">
        <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {session?.user ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-slate-500">認証済みユーザーID</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-950">
                  {session.user.id}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                Sign in with Google
              </button>
            </form>
          )}
        </section>
        <VoiceCloneForm turnstileSiteKey={turnstileSiteKey} />
      </div>
    </main>
  );
}
