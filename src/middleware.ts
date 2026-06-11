import { isAuthDisabled } from "@/lib/auth-config";
import { NextRequest, NextResponse } from "next/server";

const protectedPagePrefixes = ["/deploy", "/dashboard", "/success"];
const protectedApiPrefixes = ["/api/deploy", "/api/deployments"];

function isProtectedPath(pathname: string): boolean {
  if (protectedPagePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return (
      name === "better-auth.session_token" ||
      name === "__Secure-better-auth.session_token" ||
      name.endsWith("better-auth.session_token")
    );
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthDisabled()) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/deploy", request.url));
    }
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/deploy/:path*",
    "/dashboard/:path*",
    "/success/:path*",
    "/api/deploy",
    "/api/deploy/:path*",
    "/api/deployments",
    "/api/deployments/:path*",
  ],
};
