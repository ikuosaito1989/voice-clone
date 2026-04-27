import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | neglegere",
  description: "neglegere の利用規約です。",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-slate-600">
            トップへ戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold">利用規約</h1>
          <p className="mt-2 text-sm text-slate-500">
            最終更新日: 2026年4月23日
          </p>
        </div>

        <div className="space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">第1条 適用</h2>
            <p className="mt-2">
              本規約は、neglegere
              が提供する音声クローン生成および関連機能の利用条件を定めるものです。利用者は、本サービスを利用することで本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              第2条 Google 認証
            </h2>
            <p className="mt-2">
              本サービスでは、利用者の認証のために Google
              アカウントによるログイン機能を使用します。利用者は、Google
              の認証画面で認証に使用するアカウントを選択し、本サービスが認証に必要な情報を受け取ることに同意するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              第3条 禁止事項
            </h2>
            <p className="mt-2">
              利用者は、法令または公序良俗に反する行為、第三者の権利を侵害する行為、不正アクセス、過度な負荷を与える行為、その他本サービスの運営を妨げる行為を行ってはなりません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              第4条 音声データの取り扱い
            </h2>
            <p className="mt-2">
              利用者がアップロードまたは録音した音声データは、本サービスの機能提供、処理結果の生成、保存、確認のために利用されます。利用者は、必要な権利を有する音声データのみを送信してください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              第5条 サービスの変更・停止
            </h2>
            <p className="mt-2">
              本サービスは、必要に応じて機能の追加、変更、停止を行うことがあります。これにより利用者に損害が生じた場合でも、本サービスは法令で認められる範囲で責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              第6条 規約の変更
            </h2>
            <p className="mt-2">
              本規約は、必要に応じて変更されることがあります。変更後の規約は、本サービス上に掲載された時点から効力を生じます。
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
