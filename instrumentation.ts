import { sql } from "drizzle-orm";

// Runs once at server startup. Fails loudly here if DATABASE_URL is
// misconfigured, rather than on whatever request happens to hit the DB first.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
  }
}
