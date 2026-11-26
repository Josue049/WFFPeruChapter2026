import type { CropAspect } from "./ImageCropper";

export const GENERAL_ASPECTS: CropAspect[] = [
  { label: "Original", value: null },
  { label: "Horizontal 16:9", value: 16 / 9 },
  { label: "Horizontal 3:2", value: 3 / 2 },
  { label: "Horizontal 4:3", value: 4 / 3 },
  { label: "Cuadrado 1:1", value: 1 },
  { label: "Vertical 4:5", value: 4 / 5 },
];

export const BANNER_ASPECTS: CropAspect[] = [
  { label: "Banner 16:9 (recomendado)", value: 16 / 9 },
  { label: "Panorámico 21:9", value: 21 / 9 },
  { label: "Original", value: null },
];

// Diseños de portada completos (1122 × 1402).
export const COVER_ASPECTS: CropAspect[] = [
  { label: "Portada de revista 4:5", value: 4 / 5 },
  { label: "Original", value: null },
];

// El marco de la portada pública mide ≈ 5:6 de alto útil (ver .coverPortrait).
export const PORTRAIT_ASPECTS: CropAspect[] = [
  { label: "Portada (recomendado)", value: 0.84 },
  { label: "Vertical 3:4", value: 3 / 4 },
  { label: "Cuadrado 1:1", value: 1 },
  { label: "Original", value: null },
];
