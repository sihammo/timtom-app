import { PGlite } from "@electric-sql/pglite";
import path from "path";
import fs from "fs";

async function init() {
  const workspaceRoot = path.resolve(import.meta.dirname, "../..");
  const dbDir = path.join(workspaceRoot, ".local", "db");
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log("📂 Database directory:", dbDir);
  const client = new PGlite(dbDir);

  console.log("🏗️ Creating tables with correct schema...");

  await client.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'distributor',
      phone TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS distributors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      latitude REAL,
      longitude REAL,
      last_seen TIMESTAMP,
      total_tasks_completed INTEGER NOT NULL DEFAULT 0,
      total_amount_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
      debt NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      purchase_price NUMERIC(10,2) NOT NULL,
      sell_price NUMERIC(10,2) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 10,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      debt NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_visits INTEGER NOT NULL DEFAULT 0,
      last_visit TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      distributor_id INTEGER NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      items JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes TEXT,
      failure_reason TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      distributor_id INTEGER NOT NULL REFERENCES distributors(id),
      store_id INTEGER NOT NULL REFERENCES stores(id),
      photo_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      amount_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending_admin',
      rejection_reason TEXT,
      delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_suggestions (
      id SERIAL PRIMARY KEY,
      distributor_id INTEGER NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      owner_name TEXT,
      phone TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT NOT NULL,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id SERIAL PRIMARY KEY,
      distributor_id INTEGER NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      remaining_debt NUMERIC(12,2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  console.log("✅ Tables created successfully!");
  process.exit(0);
}

init().catch(err => {
  console.error("❌ Init failed:", err);
  process.exit(1);
});
