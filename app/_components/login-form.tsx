"use client";

import { useState } from "react";

type LoginResult =
  | {
      ok: true;
      token: string;
      user: {
        email: string;
        displayName: string | null;
        id: string;
        role: string;
      };
    }
  | {
      error?: string;
      ok?: false;
    };

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setMessage(null);
    setToken(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json().catch(() => null)) as LoginResult | null;

    if (!response.ok || !data?.ok) {
      setIsSubmitting(false);
      setMessage(
        data && "error" in data
          ? data.error ?? "ログインに失敗しました。"
          : "ログインに失敗しました。",
      );
      return;
    }

    setIsSubmitting(false);
    setMessage(
      `ログイン成功: ${data.user.email} (${data.user.role}) で認証されました。`,
    );
    setToken(data.token);
  };

  return (
    <section className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Login</h2>
        <p className="text-sm text-black/60">
          `/api/auth/login` にメールアドレスとパスワードを送って JWT を取得します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="demo@example.com"
          className="rounded-lg border border-black/15 px-4 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="password"
          className="rounded-lg border border-black/15 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-black/30"
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      {message ? <p className="text-sm text-black/70">{message}</p> : null}
      {token ? (
        <div className="rounded-lg bg-black/5 p-3">
          <p className="text-xs font-medium text-black/50">Access Token</p>
          <p className="mt-1 break-all font-mono text-xs text-black/80">{token}</p>
        </div>
      ) : null}
    </section>
  );
}
