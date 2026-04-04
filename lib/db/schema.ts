import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("Customers", {
  customerId: integer("CustomerId").primaryKey(),
  companyName: text("CompanyName"),
  contactName: text("ContactName"),
});

export type Customer = typeof customers.$inferSelect;
