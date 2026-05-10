import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { canAccess, type UserRole } from "@/lib/permissions";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isPublic = isAuthPage || isApiAuth;

  // Always allow auth routes
  if (isPublic) {
    if (isLoggedIn && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Require login for everything else
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access check
  const role = ((session.user as any)?.role ?? "CASHIER") as UserRole;
  const pathname = nextUrl.pathname;

  // API routes — check the equivalent page route
  const checkPath = pathname.startsWith("/api/")
    ? pathname.replace(/^\/api/, "")
    : pathname;

  if (!canAccess(role, checkPath)) {
    // Redirect to dashboard with a 403-style message rather than a blank page
    const url = new URL("/dashboard", nextUrl);
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
