import { connection } from "next/server";
import { CustomerSection } from "@/app/_components/customer-section";
import { Recorder } from "@/app/_components/recorder";
import { getCustomers } from "@/lib/db/customers";

export default async function Home() {
  await connection();

  const customerRows = await getCustomers();
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <CustomerSection customerRows={customerRows} />

        <Recorder turnstileSiteKey={turnstileSiteKey} />
      </div>
    </main>
  );
}
