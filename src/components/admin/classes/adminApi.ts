import { clearAuthToken } from "../../../auth/session";
import { API_BASE_URL } from "../../../config/api";
import { ApiError, apiRequest } from "../../../services/api";

export function adminRequest<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  return apiRequest<T>(`/admin/campus${path}`, init, { token, redirectOnUnauthorized: true });
}

export const jsonBody = (value: unknown) => JSON.stringify(value);

export function errorMessage(error: unknown, fallback = "No se pudo completar la acción"): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

/** Subida con barra de progreso (los videos pueden pesar cientos de MB). */
export function uploadWithProgress<T>(
  token: string,
  path: string,
  body: FormData,
  onProgress: (percent: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/admin/campus${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded * 100) / event.total));
    };
    xhr.onerror = () => reject(new ApiError("Error de red durante la subida", 0));
    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // respuesta sin JSON
      }
      if (xhr.status === 401) {
        clearAuthToken();
        window.location.replace("/loginadmin");
        return reject(new ApiError("La sesión venció. Inicia sesión nuevamente.", 401));
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(payload as T);
      const detail = (payload as { detail?: unknown } | null)?.detail;
      const text = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(String).join(" · ") : `Error ${xhr.status}`;
      reject(new ApiError(text, xhr.status));
    };
    xhr.send(body);
  });
}

/** Descarga un archivo protegido (CSV) enviando el token. */
export async function downloadFile(token: string, path: string, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/campus${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new ApiError("No se pudo descargar el archivo", response.status);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
