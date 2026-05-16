import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through without auth check
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    // `pathname` is always a relative path from nextUrl — safe to forward.
    // IMPORTANT: the login page MUST validate this param with `isSafeRedirectPath`
    // from `src/lib/utils.ts` before using it as a redirect target (open-redirect guard).
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Full session verification happens in server-side route handlers
  // using firebase-admin; the cookie presence check here is a fast-path guard.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
