import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedPagePrefixes = ["/deploy", "/dashboard", "/success"];
const protectedApiPrefixes = ["/api/deploy", "/api/deployments"];

function isProtectedPath(pathname: string): boolean {
  if (protectedPagePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
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
