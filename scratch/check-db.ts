import { db, usersTable } from "@workspace/db";

async function check() {
  const users = await db.select().from(usersTable);
  console.log("Users in DB:", users.map(u => ({ id: u.id, username: u.username, role: u.role, isActive: u.isActive })));
  process.exit(0);
}

check().catch(console.error);
