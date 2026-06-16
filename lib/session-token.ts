const SessionMaxAgeMs = 1000 * 60 * 60 * 24 * 30;

function BufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function ImportHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function CreateSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SessionMaxAgeMs;
  const payload = `auth:${expiresAt}`;
  const key = await ImportHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${BufferToHex(signature)}`;
}

export async function VerifySessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const key = await ImportHmacKey(secret);
  const signatureBuffer = Uint8Array.from(
    signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    new TextEncoder().encode(payload),
  );

  if (!valid) return false;

  const [, expiresRaw] = payload.split(":");
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export function GetSessionMaxAgeSeconds(): number {
  return SessionMaxAgeMs / 1000;
}
