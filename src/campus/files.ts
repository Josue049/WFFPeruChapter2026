import { API_BASE_URL } from "../config/api";

/** Convierte una ruta de la API (por ejemplo /campus/stream/...) en URL absoluta. */
export function campusFileUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
}
