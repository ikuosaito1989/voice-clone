"use client";

import { ErrorPage } from "@/app/_components/error-page";

type MainErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function MainError({ error, unstable_retry }: MainErrorProps) {
  console.error(error);

  return <ErrorPage onRetry={unstable_retry} />;
}
