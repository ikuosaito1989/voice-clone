import Link from "next/link";

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_28%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <section className="w-full rounded-[2.5rem] bg-white/90 p-8 text-center shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.24em] text-slate-500">
              404 NOT FOUND
            </p>
            <p className="text-3xl font-semibold text-slate-950">
              ページが見つかりません
            </p>
            <p className="text-base text-slate-600">
              指定された URL のページは存在しないか、移動しました。
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex rounded-full bg-slate-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              トップへ戻る
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
