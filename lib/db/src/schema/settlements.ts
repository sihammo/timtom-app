import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { distributorsTable } from "./distributors";

export const settlementsTable = pgTable("settlements", {
  id: serial("id").primaryKey(),
  distributorId: integer("distributor_id").notNull().references(() => distributorsTable.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSettlementSchema = createInsertSchema(settlementsTable).omit({ id: true, createdAt: true });
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Settlement = typeof settlementsTable.$inferSelect;
