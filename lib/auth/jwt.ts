import { createHmac } from "node:crypto";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function signJwt(
  payload: Record<string, string | number>,
  secret: string,
) {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${header}.${body}.${signature}`;
}

function decodeBase64Url(value: string) {
  const base64 = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  return Buffer.from(base64, "base64").toString("utf8");
}

export function verifyJwt(token: string, secret: string) {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(body)) as JwtPayload;
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
