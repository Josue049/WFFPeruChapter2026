import type { CertificateStatus, CertificateType } from "../types/certificates";

export const TYPE_NAMES: Record<CertificateType, string> = {
  completion: "Finalización",
  participation: "Participación",
  recognition: "Reconocimiento",
  appreciation: "Agradecimiento",
  custom: "Personalizado",
};

export const STATUS_NAMES: Record<CertificateStatus, string> = {
  valid: "Vigente",
  revoked: "Revocado",
};

const CODE_PATTERN = /WFF-\d{4}-[0-9A-F]{12}/;

/** Extrae el código de un texto pegado (código suelto o URL de validación). */
export function extractCode(value: string): string | null {
  return CODE_PATTERN.exec(value.toUpperCase())?.[0] ?? null;
}

/** Fecha sin hora (AAAA-MM-DD) en español, sin desplazamientos de zona horaria. */
export function formatDay(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(value: string): string {
  // SQLite (desarrollo) devuelve fechas sin zona: se interpretan como UTC.
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

export function todayIso(): string {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Sin permiso de portapapeles: se muestra para copiarlo a mano.
    window.prompt("Copia el enlace:", text);
    return false;
  }
}

/** Identificador aleatorio para no emitir dos veces la misma solicitud. */
export function newRequestId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
