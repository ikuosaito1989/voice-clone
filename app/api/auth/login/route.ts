import { NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { findUserByEmail } from "@/server/repositories/users";

const ACCESS_TOKEN_COOKIE = "access_token";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return Response.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(email);

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "invalid credentials" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + ACCESS_TOKEN_TTL_SECONDS,
    },
    process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  );

  const response = NextResponse.json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  return response;
}
