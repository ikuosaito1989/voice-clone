export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function encodeBase64Url(value: string) {
  return toBase64(textEncoder.encode(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function importJwtKey(secret: string, usage: KeyUsage) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

async function signJwtValue(value: string, secret: string) {
  const key = await importJwtKey(secret, "sign");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return toBase64(new Uint8Array(signature))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function signJwt(
  payload: Record<string, string | number>,
  secret: string,
) {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = await signJwtValue(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

function decodeBase64Url(value: string) {
  const base64 = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  return textDecoder.decode(fromBase64(base64));
}

export async function verifyJwt(token: string, secret: string) {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    return null;
  }

  const key = await importJwtKey(secret, "verify");
  const isValidSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64(
      signature
        .replaceAll("-", "+")
        .replaceAll("_", "/")
        .padEnd(Math.ceil(signature.length / 4) * 4, "="),
    ),
    textEncoder.encode(`${header}.${body}`),
  );

  if (!isValidSignature) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(body)) as JwtPayload;
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
