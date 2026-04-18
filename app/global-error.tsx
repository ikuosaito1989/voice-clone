"use client";

import { ErrorPage } from "@/app/_components/error-page";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  console.error(error);

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <ErrorPage onRetry={unstable_retry} />
      </body>
    </html>
  );
}
