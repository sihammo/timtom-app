import { db } from "@workspace/db";
import { 
  usersTable, distributorsTable, productsTable, storesTable, 
  tasksTable, deliveriesTable, storeSuggestionsTable, settlementsTable 
} from "@workspace/db";

async function cleanup() {
  console.log("🧹 Cleaning all tables...");
  
  // Order matters for foreign keys
  await db.delete(deliveriesTable);
  await db.delete(tasksTable);
  await db.delete(storeSuggestionsTable);
  await db.delete(settlementsTable);
  await db.delete(storesTable);
  await db.delete(distributorsTable);
  await db.delete(productsTable);
  await db.delete(usersTable);
  
  console.log("✅ Cleanup complete.");
}

cleanup().catch(err => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
