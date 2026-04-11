import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import pg from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const { Pool } = pg;

export let db: any;
export let pool: any;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
} else {
  // Use a local directory for persistence
  // In a monorepo, process.cwd() might be lib/db, so we go up to the root
  const workspaceRoot = path.resolve(import.meta.dirname, "../../../");
  const dbDir = path.join(workspaceRoot, ".local", "db");
  
  console.log("📂 Database Workspace Root:", workspaceRoot);
  console.log("📂 Database Directory:", dbDir);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const client = new PGlite(dbDir);
  db = drizzlePglite(client, { schema });
}

export * from "./schema";
