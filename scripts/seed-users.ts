/**
 * Creates the initial staff accounts.
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 *
 * Requires DATABASE_URL and BETTER_AUTH_SECRET in the environment (or .env).
 * Safe to re-run — existing emails are skipped.
 */
import "dotenv/config";
import { auth } from "../lib/auth";

const USERS: { name: string; email: string; password: string }[] = [
  // Add your staff here before running. Remove entries after first deploy.
  // { name: "Alice", email: "alice@example.com", password: "changeme123!" },
  // { name: "Bob",   email: "bob@example.com",   password: "changeme123!" },
];

if (USERS.length === 0) {
  console.error(
    "No users defined. Edit the USERS array in scripts/seed-users.ts, then re-run.",
  );
  process.exit(1);
}

for (const u of USERS) {
  const { data, error } = await auth.api.signUpEmail({ body: u });
  if (error) {
    const msg = (error as { message?: string }).message ?? String(error);
    if (msg.toLowerCase().includes("already")) {
      console.log(`skip  ${u.email} (already exists)`);
    } else {
      console.error(`error ${u.email}: ${msg}`);
    }
  } else {
    console.log(`created ${u.email} (id: ${data?.user?.id})`);
  }
}
