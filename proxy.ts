import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/api/auth"];

// Fast, optimistic cookie-presence check only — no DB hit here. The real
// session verification happens in lib/dal.ts's verifySession(), called by
// every authenticated page and Server Action.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // _next/image does an internal self-fetch of local image sources (e.g.
  // car-logo.png) with no cookies attached, so public asset files must be
  // excluded here too or that fetch gets redirected to /login.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
