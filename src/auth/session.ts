const TOKEN_KEY = "token";

interface JwtPayload {
  exp?: number;
  sub?: string;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasUsableAuthToken(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    clearAuthToken();
    return false;
  }

  const expiresAt = payload.exp * 1000;
  const clockToleranceMs = 5_000;
  const valid = expiresAt > Date.now() + clockToleranceMs;

  if (!valid) clearAuthToken();
  return valid;
}
