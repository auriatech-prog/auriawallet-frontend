const GOOGLE_CODE_VERIFIER_KEY = "googleCodeVerifier";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return base64UrlEncode(randomBytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export async function startGoogleSignIn(): Promise<void> {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
    /\/+$/,
    "",
  );
  if (!apiBaseUrl) {
    throw new Error("Falta configurar VITE_API_BASE_URL.");
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  window.sessionStorage.setItem(GOOGLE_CODE_VERIFIER_KEY, codeVerifier);

  const authUrl = `${apiBaseUrl}/api/auth/google?code_challenge=${encodeURIComponent(codeChallenge)}`;
  window.location.assign(authUrl);
}

export function getStoredGoogleCodeVerifier(): string | null {
  return window.sessionStorage.getItem(GOOGLE_CODE_VERIFIER_KEY);
}

export function clearStoredGoogleCodeVerifier(): void {
  window.sessionStorage.removeItem(GOOGLE_CODE_VERIFIER_KEY);
}
