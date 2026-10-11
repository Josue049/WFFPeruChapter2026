export function getContrastTextColor(hex: string | null | undefined): "#111111" | "#FFFFFF" {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#FFFFFF";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#FFFFFF";
}
