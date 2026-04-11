import { pgTable, serial, integer, numeric, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const distributorsTable = pgTable("distributors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeen: timestamp("last_seen"),
  totalTasksCompleted: integer("total_tasks_completed").notNull().default(0),
  totalAmountCollected: numeric("total_amount_collected", { precision: 12, scale: 2 }).notNull().default("0"),
  debt: numeric("debt", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDistributorSchema = createInsertSchema(distributorsTable).omit({ id: true, createdAt: true });
export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type Distributor = typeof distributorsTable.$inferSelect;
