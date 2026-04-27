"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AuthActionsProps = {
  email?: string | null;
  userId?: string;
};

export function AuthActions({ email, userId }: AuthActionsProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);

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
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Sign in with Google</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google でログイン</DialogTitle>
          <DialogDescription>
            Google
            アカウントでログインすると、認証済みユーザーとして音声生成機能を利用できます。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          ログインするとトップページに戻ります。その後、録音済みの参照音声とテキストを使って音声クローンを作成できます。
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button
            disabled={isSigningIn}
            onClick={async () => {
              setIsSigningIn(true);
              await signIn("google", { callbackUrl: "/" });
            }}
          >
            {isSigningIn ? "遷移中..." : "Google で続行"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
