import { API_BASE_URL } from "../config/api";

export function mediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  return value;
}
