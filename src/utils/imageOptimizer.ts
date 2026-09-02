export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetBytes?: number;
  preservePng?: boolean;
  quality?: number;
}

const loadImage = async (file: File): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
};

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo optimizar la imagen."))),
      type,
      quality,
    );
  });

export async function optimizeImageFile(
  file: File,
  {
    maxWidth = 3200,
    maxHeight = 2800,
    targetBytes = 3200 * 1024,
    preservePng = false,
    quality = 0.92,
  }: ImageOptimizationOptions = {},
): Promise<File> {
  const bitmap = await loadImage(file);
  try {
    let scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const outputType = preservePng ? "image/png" : "image/webp";
    let blob: Blob | null = null;
    let width = 0;
    let height = 0;

    for (let attempt = 0; attempt < 7; attempt += 1) {
      width = Math.max(1, Math.round(bitmap.width * scale));
      height = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("Tu navegador no pudo procesar la imagen.");

      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await canvasBlob(canvas, outputType, preservePng ? undefined : quality);

      if (blob.size <= targetBytes || width <= 720 || height <= 720) break;
      scale *= 0.88;
    }

    if (!blob) throw new Error("No se pudo optimizar la imagen.");

    const base = file.name.replace(/\.[^.]+$/, "") || "imagen";
    const extension = preservePng ? "png" : "webp";
    return new File([blob], `${base}-optimized.${extension}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export const optimizePortraitFile = (file: File) =>
  optimizeImageFile(file, {
    maxWidth: 1600,
    maxHeight: 2200,
    targetBytes: 1500 * 1024,
    preservePng: true,
  });

export const optimizeEditorialImageFile = (file: File) =>
  optimizeImageFile(file, {
    maxWidth: 3200,
    maxHeight: 2800,
    targetBytes: 3200 * 1024,
    preservePng: false,
    quality: 0.96,
  });


// Voces: las imágenes permanecen locales durante la edición y se optimizan
// únicamente al enviar el artículo.
export const optimizeAuthorSubmissionPhotoFile = (file: File) =>
  optimizeImageFile(file, {
    maxWidth: 640,
    maxHeight: 640,
    targetBytes: 250 * 1024,
    preservePng: false,
    quality: 0.84,
  });

export const optimizeArticleSubmissionImageFile = (file: File) =>
  optimizeImageFile(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    targetBytes: 600 * 1024,
    preservePng: false,
    quality: 0.82,
  });
