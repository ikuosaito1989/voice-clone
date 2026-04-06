import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

const ACCESS_TOKEN_COOKIE = "access_token";
const PUBLIC_API_PATHS = new Set(["/api/auth/login"]);

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function proxy(request: NextRequest) {
  if (PUBLIC_API_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token =
    getBearerToken(request) ?? request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(
    token,
    process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  );
  if (!payload) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
