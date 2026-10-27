import type { LessonKind } from "../../types/campus";

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  return minutes ? `${minutes} min${rest ? ` ${rest} s` : ""}` : `${rest} s`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

export const KIND_LABEL: Record<LessonKind, string> = {
  video: "Video",
  document: "Documento",
  quiz: "Evaluación",
};

export const KIND_ICON: Record<LessonKind, string> = {
  video: "▶",
  document: "📄",
  quiz: "✎",
};
