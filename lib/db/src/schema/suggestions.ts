import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { distributorsTable } from "./distributors";

export const storeSuggestionsTable = pgTable("store_suggestions", {
  id: serial("id").primaryKey(),
  distributorId: integer("distributor_id").notNull().references(() => distributorsTable.id),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoreSuggestionSchema = createInsertSchema(storeSuggestionsTable).omit({ id: true, createdAt: true });
export type InsertStoreSuggestion = z.infer<typeof insertStoreSuggestionSchema>;
export type StoreSuggestion = typeof storeSuggestionsTable.$inferSelect;
