import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// We don't throw an error here immediately because Next.js evaluates this file during the build step.
// If DATABASE_URL is missing, the Pool will naturally fail later when a connection is actually attempted.

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 2, // Limit connections per serverless instance to prevent exhaustion
    idleTimeoutMillis: 15000, // Close idle connections after 15s to prevent using dead sockets
    connectionTimeoutMillis: 10000, // Fail fast if DB is unreachable
    allowExitOnIdle: true, // Allow Node process to exit cleanly if only idle connections are left
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
