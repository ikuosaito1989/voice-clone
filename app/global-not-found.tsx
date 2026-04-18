import type { Metadata } from "next";
import { NotFoundPage } from "@/app/_components/not-found-page";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | Voice Recorder",
  description: "指定されたページは見つかりませんでした。",
};

export default function GlobalNotFound() {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <NotFoundPage />
      </body>
    </html>
  );
}
