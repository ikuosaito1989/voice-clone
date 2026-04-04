import type { Customer } from "@/lib/db/schema";

type CustomerSectionProps = {
  customerRows: Customer[];
};

export function CustomerSection({ customerRows }: CustomerSectionProps) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">D1 Customers</h1>
        <p className="text-sm text-black/60">
          Drizzle で `select * from Customers` 相当の取得をしています。
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/60">
              <th className="px-3 py-2 font-medium">CustomerId</th>
              <th className="px-3 py-2 font-medium">CompanyName</th>
              <th className="px-3 py-2 font-medium">ContactName</th>
            </tr>
          </thead>
          <tbody>
            {customerRows.map((customer) => (
              <tr key={customer.customerId} className="border-b border-black/5">
                <td className="px-3 py-2">{customer.customerId}</td>
                <td className="px-3 py-2">{customer.companyName}</td>
                <td className="px-3 py-2">{customer.contactName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
