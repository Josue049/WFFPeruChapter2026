import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import styles from "./ImageCropper.module.css";

export interface CropAspect {
  label: string;
  /** ancho / alto. `null` = proporción original de la imagen. */
  value: number | null;
}

interface ImageCropperProps {
  file: File | Blob;
  fileName?: string;
  aspects: CropAspect[];
  defaultAspectIndex?: number;
  /** Tamaño máximo (ancho) del resultado. */
  maxOutputWidth?: number;
  /** Muestra tablero de ajedrez y permite alejar la imagen (retratos sin fondo). */
  transparent?: boolean;
  title?: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

const MAX_VIEW_WIDTH = 560;
const MAX_VIEW_HEIGHT = 440;

export function ImageCropper({
  file,
  fileName = "imagen",
  aspects,
  defaultAspectIndex = 0,
  maxOutputWidth = 2400,
  transparent = false,
  title = "Recortar imagen",
  onConfirm,
  onCancel,
}: ImageCropperProps) {
  const [url, setUrl] = useState("");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [aspectIndex, setAspectIndex] = useState(defaultAspectIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const minZoom = transparent ? 0.4 : 1;

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      imageRef.current = image;
      setNatural({ w: image.naturalWidth, h: image.naturalHeight });
    };
    image.onerror = () => {
      if (!cancelled) setError("No se pudo leer la imagen.");
    };
    image.src = objectUrl;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const aspect = useMemo(() => {
    const chosen = aspects[aspectIndex]?.value ?? null;
    if (chosen) return chosen;
    return natural ? natural.w / natural.h : 1;
  }, [aspects, aspectIndex, natural]);

  const view = useMemo(() => {
    let width = Math.max(220, Math.min(MAX_VIEW_WIDTH, window.innerWidth - 90));
    let height = width / aspect;
    if (height > MAX_VIEW_HEIGHT) {
      height = MAX_VIEW_HEIGHT;
      width = height * aspect;
    }
    return { w: Math.round(width), h: Math.round(height) };
  }, [aspect]);

  // Escala base: la imagen cubre por completo el marco.
  const baseScale = natural ? Math.max(view.w / natural.w, view.h / natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  const clamp = useCallback(
    (x: number, y: number, w = dispW, h = dispH) => {
      const maxX = Math.abs(w - view.w) / 2;
      const maxY = Math.abs(h - view.h) / 2;
      return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
    },
    [dispW, dispH, view.w, view.h],
  );

  // Al cambiar de proporción se recentra la imagen.
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [aspectIndex, natural]);

  const changeZoom = (next: number) => {
    const value = Math.min(4, Math.max(minZoom, next));
    if (!natural) return;
    const nextScale = baseScale * value;
    setZoom(value);
    setOffset((current) => clamp(current.x, current.y, natural.w * nextScale, natural.h * nextScale));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOffset(clamp(drag.current.ox + event.clientX - drag.current.x, drag.current.oy + event.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    changeZoom(zoom - event.deltaY * 0.0015);
  };

  const confirm = async () => {
    const image = imageRef.current;
    if (!image || !natural) return;
    setBusy(true);
    setError("");
    try {
      const left = view.w / 2 + offset.x - dispW / 2;
      const top = view.h / 2 + offset.y - dispH / 2;
      const sx = -left / scale;
      const sy = -top / scale;
      const sw = view.w / scale;
      const sh = view.h / scale;

      const outW = Math.max(1, Math.min(maxOutputWidth, Math.round(sw)));
      const outH = Math.max(1, Math.round(outW / aspect));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("Tu navegador no pudo procesar la imagen.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.clearRect(0, 0, outW, outH);

      // Se dibuja solo la parte de la imagen que cae dentro del marco; el resto
      // queda transparente (útil al alejar un retrato sin fondo).
      const ix0 = Math.max(0, sx);
      const iy0 = Math.max(0, sy);
      const ix1 = Math.min(natural.w, sx + sw);
      const iy1 = Math.min(natural.h, sy + sh);
      if (ix1 > ix0 && iy1 > iy0) {
        const ratio = outW / sw;
        context.drawImage(image, ix0, iy0, ix1 - ix0, iy1 - iy0, (ix0 - sx) * ratio, (iy0 - sy) * ratio, (ix1 - ix0) * ratio, (iy1 - iy0) * ratio);
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("No se pudo generar el recorte.");
      const base = fileName.replace(/\.[^.]+$/, "") || "imagen";
      onConfirm(new File([blob], `${base}-recorte.png`, { type: "image/png", lastModified: Date.now() }));
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "No se pudo recortar la imagen.");
      setBusy(false);
    }
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h3>{title}</h3>
            <p>Arrastra la imagen para encuadrarla y usa el zoom para acercarla.</p>
          </div>
          <button type="button" className={styles.close} onClick={onCancel} aria-label="Cerrar">×</button>
        </header>

        <div className={styles.aspects} role="tablist" aria-label="Proporción">
          {aspects.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={index === aspectIndex}
              className={index === aspectIndex ? styles.aspectActive : ""}
              onClick={() => setAspectIndex(index)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.stage}>
          <div
            className={`${styles.frame} ${transparent ? styles.checker : ""}`}
            style={{ width: view.w, height: view.h }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            {url && natural && (
              <img
                src={url}
                alt="Imagen a recortar"
                draggable={false}
                style={{
                  width: dispW,
                  height: dispH,
                  left: view.w / 2 + offset.x - dispW / 2,
                  top: view.h / 2 + offset.y - dispH / 2,
                }}
              />
            )}
            <span className={styles.grid} aria-hidden="true" />
            {!natural && !error && <span className={styles.loading}>Cargando…</span>}
          </div>
        </div>

        <div className={styles.controls}>
          <label>
            <span>Zoom</span>
            <input
              type="range"
              min={minZoom}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => changeZoom(Number(event.target.value))}
            />
            <output>{Math.round(zoom * 100)}%</output>
          </label>
          <button type="button" className={styles.link} onClick={reset}>Restablecer</button>
        </div>

        {natural && (
          <p className={styles.meta}>
            Original: {natural.w} × {natural.h} px
            {transparent ? " · La zona en tablero quedará transparente." : ""}
          </p>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.footer}>
          <button type="button" className={styles.secondary} onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className={styles.primary} onClick={confirm} disabled={busy || !natural}>
            {busy ? "Procesando…" : "Aplicar y subir"}
          </button>
        </footer>
      </div>
    </div>
  );
}
