import { pgTable, serial, integer, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { distributorsTable } from "./distributors";
import { storesTable } from "./stores";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  distributorId: integer("distributor_id").notNull().references(() => distributorsTable.id),
  storeId: integer("store_id").notNull().references(() => storesTable.id),
  items: jsonb("items").notNull().default([]),
  status: text("status", { enum: ["pending", "in_progress", "completed", "failed", "cancelled"] }).notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
