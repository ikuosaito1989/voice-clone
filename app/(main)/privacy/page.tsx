import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | neglegere",
  description: "neglegere のプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-slate-600">
            トップへ戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold">
            プライバシーポリシー
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            最終更新日: 2026年4月23日
          </p>
        </div>

        <div className="space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              1. 取得する情報
            </h2>
            <p className="mt-2">
              本サービスは、Google 認証を利用する際に、Google
              アカウントに紐づく識別子、メールアドレス、表示名、プロフィール画像など、認証のために Google
              から提供される情報を取得する場合があります。また、利用者が録音またはアップロードした音声データ、操作履歴、通信に伴う技術情報を取得する場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              2. 利用目的
            </h2>
            <p className="mt-2">
              取得した情報は、利用者の認証、アカウント識別、音声録音および関連機能の提供、不正利用の防止、サービス改善、問い合わせ対応のために利用します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              3. Google 認証について
            </h2>
            <p className="mt-2">
              本サービスでは、ログイン手段として Google 認証を使用します。認証処理は Google
              の認証画面を通じて行われ、利用者は認証に使用する Google
              アカウントを選択できます。本サービスは、Google
              から提供された情報を本ポリシーに記載した目的の範囲で取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              4. 第三者提供
            </h2>
            <p className="mt-2">
              本サービスは、法令に基づく場合を除き、利用者本人の同意なく個人情報を第三者に提供しません。ただし、サービス提供に必要な範囲で外部サービスやインフラ事業者に処理を委託する場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              5. 保存期間
            </h2>
            <p className="mt-2">
              取得した情報は、利用目的の達成に必要な期間保存し、不要になった場合は合理的な方法で削除または匿名化します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">
              6. ポリシーの変更
            </h2>
            <p className="mt-2">
              本ポリシーは、必要に応じて変更されることがあります。変更後のポリシーは、本サービス上に掲載された時点から効力を生じます。
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
