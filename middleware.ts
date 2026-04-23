import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

const ACCESS_TOKEN_COOKIE = "access_token";
const PUBLIC_API_PATHS = new Set(["/api/reference_audio"]);
const PUBLIC_API_PATTERNS = [
  /^\/api\/voice_clones\/[^/]+$/,
  /^\/api\/voice_clones\/[^/]+\/events$/,
  /^\/api\/voice_clones\/[^/]+\/file$/,
];

function isSwaggerProtectedPath(pathname: string) {
  return pathname === "/api/openapi" || pathname.startsWith("/swagger");
}

function getBasicAuthCredentials(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) {
    return null;
  }

  const decoded = atob(encoded);
  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex < 0) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

function createBasicAuthResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Swagger", charset="UTF-8"',
    },
  });
}

function authorizeSwaggerRequest(request: NextRequest) {
  const username = "12345";
  const password = "67890";

  if (!username || !password) {
    return NextResponse.json(
      { error: "swagger basic auth is not configured" },
      { status: 500 },
    );
  }

  const credentials = getBasicAuthCredentials(request);
  if (
    !credentials ||
    credentials.username !== username ||
    credentials.password !== password
  ) {
    return createBasicAuthResponse();
  }

  return NextResponse.next();
}

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

export async function middleware(request: NextRequest) {
  if (isSwaggerProtectedPath(request.nextUrl.pathname)) {
    return authorizeSwaggerRequest(request);
  }

  if (
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    PUBLIC_API_PATHS.has(request.nextUrl.pathname) ||
    PUBLIC_API_PATTERNS.some((pattern) =>
      pattern.test(request.nextUrl.pathname),
    )
  ) {
    return NextResponse.next();
  }

  const token =
    getBearerToken(request) ?? request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(
    token,
    process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  );
  if (!payload) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/swagger/:path*"],
};
