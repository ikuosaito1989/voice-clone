function base64UrlEncode(input: string | Uint8Array) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function signHmacSha256(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return new Uint8Array(signature);
}

async function verifyHmacSha256(
  secret: string,
  message: string,
  signature: Uint8Array,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  const signatureBytes = new Uint8Array(signature.byteLength);
  signatureBytes.set(signature);

  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(message),
  );
}

type JwtPayload = Record<string, unknown>;

export async function signJwt(
  payload: Record<string, string | number | boolean>,
  secret: string,
) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHmacSha256(secret, data);

  return `${data}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token: string, secret: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const headerJson = base64UrlDecode(encodedHeader);
  const payloadJson = base64UrlDecode(encodedPayload);
  const header = JSON.parse(headerJson) as { alg?: string; typ?: string };
  const payload = JSON.parse(payloadJson) as JwtPayload;
  const signatureBytes = Uint8Array.from(
    atob(
      encodedSignature
        .replaceAll("-", "+")
        .replaceAll("_", "/")
        .padEnd(Math.ceil(encodedSignature.length / 4) * 4, "="),
    ),
    (char) => char.charCodeAt(0),
  );

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    return null;
  }

  const isValid = await verifyHmacSha256(
    secret,
    `${encodedHeader}.${encodedPayload}`,
    signatureBytes,
  );

  if (!isValid) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = typeof payload.exp === "number" ? payload.exp : Number.NaN;

  if (Number.isFinite(expiresAt) && expiresAt < now) {
    return null;
  }

  return payload;
}
