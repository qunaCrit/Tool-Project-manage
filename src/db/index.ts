import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import * as schema from "./schema";

const databasePath =
  process.env.TOOL_PROJECT_MANAGE_DB_PATH ?? "data/tool-project-manage.db";
const migrationsFolder =
  process.env.TOOL_PROJECT_MANAGE_MIGRATIONS_DIR ?? join(process.cwd(), "drizzle");

mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder });
