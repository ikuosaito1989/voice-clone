"use client";

import { signIn, signOut } from "next-auth/react";

type AuthActionsProps = {
  email?: string | null;
  userId?: string;
};

export function AuthActions({ email, userId }: AuthActionsProps) {
  if (userId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-slate-500">メールアドレス</p>
          <p className="mt-1 break-all text-sm font-medium text-slate-950">
            {email ?? "未取得"}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">認証済みユーザーID</p>
          <p className="mt-1 break-all font-mono text-sm text-slate-950">
            {userId}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
    >
      Sign in with Google
    </button>
  );
}
