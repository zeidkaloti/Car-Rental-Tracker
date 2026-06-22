import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// proxy.ts only checks for the *presence* of a session cookie before a page
// renders, which is fast but not secure on its own (a cookie can be forged).
// Every authenticated page and Server Action must call this to get the real,
// verified session — this is the actual auth gate.
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session;
});
