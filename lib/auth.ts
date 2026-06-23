import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // No email provider is wired up yet — log the reset link instead of
    // emailing it (`docker compose logs app` to find it) until one is added.
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset requested for ${user.email}: ${url}`);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // No email-verification provider configured, so new addresses take
      // effect immediately rather than waiting on a confirmation email.
      updateEmailWithoutVerification: true,
    },
  },
  // All staff accounts have equal access — no roles/permissions plugin.
  plugins: [nextCookies()],
});
