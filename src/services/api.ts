import { clearAuthToken } from "../auth/session";
import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  token?: string;
  redirectOnUnauthorized?: boolean;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
      message?: string;
    };
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) {
      return payload.detail
        .map((item) => item.msg || "Dato inválido")
        .slice(0, 3)
        .join(" · ");
    }
    return payload.message || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && options.redirectOnUnauthorized) {
    clearAuthToken();
    window.location.replace("/loginadmin");
    throw new ApiError("La sesión venció. Inicia sesión nuevamente.", 401);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
