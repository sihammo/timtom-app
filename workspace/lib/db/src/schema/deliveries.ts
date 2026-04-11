import { pgTable, serial, integer, text, numeric, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tasksTable } from "./tasks";
import { distributorsTable } from "./distributors";
import { storesTable } from "./stores";

export const deliveriesTable = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasksTable.id),
  distributorId: integer("distributor_id").notNull().references(() => distributorsTable.id),
  storeId: integer("store_id").notNull().references(() => storesTable.id),
  photoUrl: text("photo_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  amountCollected: numeric("amount_collected", { precision: 12, scale: 2 }).notNull().default("0"),
  status: text("status", { enum: ["pending_admin", "confirmed", "rejected"] }).notNull().default("pending_admin"),
  rejectionReason: text("rejection_reason"),
  deliveredAt: timestamp("delivered_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertDeliverySchema = createInsertSchema(deliveriesTable).omit({ id: true, deliveredAt: true });
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveriesTable.$inferSelect;
