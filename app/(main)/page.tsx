import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@/auth";
import { AuthActions } from "@/app/_components/auth-actions";
import { VoiceCloneForm } from "@/app/_components/voice-clone-form";

export default async function Home() {
  await connection();

  const session = await auth();
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f99d_0%,#f8fafc_24%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-6">
        <section className="w-full max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-normal text-slate-950">
            neglegere
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            neglegere は、ブラウザで録音した参照音声と入力した文章を使って、音声クローンの生成リクエストを作成し、生成された音声を確認・ダウンロードするためのアプリです。
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Google アカウントでログインすると、認証済みユーザーとして音声生成機能を利用できます。
          </p>
        </section>
        <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <AuthActions
            email={session?.user.email}
            userId={session?.user.id}
          />
        </section>
        <VoiceCloneForm turnstileSiteKey={turnstileSiteKey} />
        <nav className="flex gap-4 text-sm text-slate-600">
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </nav>
      </div>
    </main>
  );
}
