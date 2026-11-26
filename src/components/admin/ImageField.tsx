import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { apiRequest } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import { optimizeEditorialImageFile, optimizePortraitFile } from "../../utils/imageOptimizer";
import { ImageCropper } from "./ImageCropper";
import type { CropAspect } from "./ImageCropper";
import { GENERAL_ASPECTS, PORTRAIT_ASPECTS } from "./cropAspects";
import styles from "./AdminForms.module.css";

interface UploadResponse {
  url: string;
  width: number;
  height: number;
  size_bytes: number;
}

function FilePicker({
  accept,
  multiple = false,
  disabled,
  busyLabel,
  label,
  className,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  disabled: boolean;
  busyLabel: string;
  label: string;
  className: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => inputRef.current?.click()} disabled={disabled}>
        {disabled ? busyLabel : label}
      </button>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

interface ImageFieldProps {
  label: string;
  value: string;
  token: string;
  onChange: (value: string) => void;
  help?: string;
  required?: boolean;
  aspects?: CropAspect[];
  defaultAspectIndex?: number;
  maxOutputWidth?: number;
}

/** Selección → recorte → optimización → subida. También permite reencuadrar la imagen ya subida. */
function useCroppedUpload({
  token,
  endpoint,
  optimize,
  onUploaded,
}: {
  token: string;
  endpoint: "/media/images" | "/media/portraits";
  optimize: (file: File) => Promise<File>;
  onUploaded: (url: string) => void;
}) {
  const [pending, setPending] = useState<File | Blob | null>(null);
  const [pendingName, setPendingName] = useState("imagen");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const choose = (file: File) => {
    setError("");
    setPendingName(file.name);
    setPending(file);
  };

  const reframe = async (currentUrl: string) => {
    setError("");
    try {
      // `reload`: la copia en caché la dejó un <img> sin cabeceras CORS y haría fallar el fetch.
      const response = await fetch(mediaUrl(currentUrl), { cache: "reload" });
      if (!response.ok) throw new Error("No se pudo cargar la imagen actual.");
      setPendingName(currentUrl.split("/").pop() ?? "imagen");
      setPending(await response.blob());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar la imagen actual.");
    }
  };

  const confirm = async (cropped: File) => {
    setPending(null);
    setUploading(true);
    setError("");
    try {
      const optimized = await optimize(cropped);
      const body = new FormData();
      body.append("file", optimized);
      const result = await apiRequest<UploadResponse>(endpoint, { method: "POST", body }, { token, redirectOnUnauthorized: true });
      onUploaded(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return { pending, pendingName, uploading, error, setError, choose, reframe, confirm, cancel: () => setPending(null) };
}

export function ImageField({
  label,
  value,
  token,
  onChange,
  help,
  required,
  aspects = GENERAL_ASPECTS,
  defaultAspectIndex = 0,
  maxOutputWidth = 3200,
}: ImageFieldProps) {
  const upload = useCroppedUpload({ token, endpoint: "/media/images", optimize: optimizeEditorialImageFile, onUploaded: onChange });

  return (
    <div className={styles.field}>
      <label>{label}{required ? " *" : ""}</label>
      <div className={styles.imageRow}>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... o sube un archivo en alta calidad"
          required={required}
        />
        <FilePicker
          accept="image/jpeg,image/png,image/webp"
          disabled={upload.uploading}
          busyLabel="Subiendo…"
          label="Subir imagen"
          className={styles.uploadButton}
          onFiles={([file]) => upload.choose(file)}
        />
      </div>
      {help && <small>{help}</small>}
      {upload.error && <small className={styles.error}>{upload.error}</small>}
      {value && (
        <div className={styles.imagePreview}>
          <img src={mediaUrl(value)} alt="Vista previa" />
          <div className={styles.previewActions}>
            <button type="button" onClick={() => void upload.reframe(value)}>Recortar</button>
            <button type="button" onClick={() => onChange("")}>Quitar</button>
          </div>
        </div>
      )}
      {upload.pending && (
        <ImageCropper
          file={upload.pending}
          fileName={upload.pendingName}
          aspects={aspects}
          defaultAspectIndex={defaultAspectIndex}
          maxOutputWidth={maxOutputWidth}
          onConfirm={(file) => void upload.confirm(file)}
          onCancel={upload.cancel}
        />
      )}
    </div>
  );
}

export function TransparentPortraitField({ label, value, token, onChange, help, required }: ImageFieldProps) {
  const upload = useCroppedUpload({ token, endpoint: "/media/portraits", optimize: optimizePortraitFile, onUploaded: onChange });

  const choose = (file: File) => {
    if (file.type !== "image/png" && file.type !== "image/webp") {
      upload.setError("El retrato debe ser un PNG (o WebP) con fondo transparente.");
      return;
    }
    upload.choose(file);
  };

  return (
    <div className={styles.field}>
      <label>{label}{required ? " *" : ""}</label>
      <div className={styles.imageRow}>
        <input
          type="text"
          value={value}
          readOnly
          placeholder="Sube un PNG transparente"
          required={required}
          aria-label="Ruta del retrato procesado"
        />
        <FilePicker
          accept="image/png,image/webp"
          disabled={upload.uploading}
          busyLabel="Subiendo…"
          label={value ? "Reemplazar PNG" : "Subir PNG"}
          className={styles.uploadButton}
          onFiles={([file]) => choose(file)}
        />
      </div>
      {help && <small>{help}</small>}
      {upload.error && <small className={styles.error}>{upload.error}</small>}
      {value && (
        <div className={`${styles.imagePreview} ${styles.transparentPreview}`}>
          <img src={mediaUrl(value)} alt="Vista previa del retrato" />
          <div className={styles.previewActions}>
            <button type="button" onClick={() => void upload.reframe(value)}>Reencuadrar</button>
            <button type="button" onClick={() => onChange("")}>Quitar</button>
          </div>
        </div>
      )}
      {upload.pending && (
        <ImageCropper
          file={upload.pending}
          fileName={upload.pendingName}
          aspects={PORTRAIT_ASPECTS}
          maxOutputWidth={1600}
          transparent
          title="Encuadrar retrato"
          onConfirm={(file) => void upload.confirm(file)}
          onCancel={upload.cancel}
        />
      )}
    </div>
  );
}

interface GalleryFieldProps {
  value: string[];
  token: string;
  onChange: (value: string[]) => void;
}

const GALLERY_LIMIT = 24;
const UPLOAD_CONCURRENCY = 3;

export function GalleryField({ value, token, onChange }: GalleryFieldProps) {
  const [draft, setDraft] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  // Siempre la lista más reciente: las subidas terminan después de varios renders.
  const latest = useRef(value);
  latest.current = value;

  const uploading = progress !== null;

  const addUrl = () => {
    const url = draft.trim();
    if (!url) return;
    if (value.length >= GALLERY_LIMIT) {
      setError(`La galería admite un máximo de ${GALLERY_LIMIT} imágenes.`);
      return;
    }
    if (!value.includes(url)) onChange([...value, url]);
    setDraft("");
  };

  const upload = async (picked: File[]) => {
    const images = picked.filter((file) => file.type.startsWith("image/"));
    const skipped = picked.length - images.length;
    const room = GALLERY_LIMIT - latest.current.length;
    const files = images.slice(0, Math.max(0, room));
    const messages: string[] = [];
    if (skipped) messages.push(`${skipped} archivo(s) ignorado(s) por no ser imágenes.`);
    if (images.length > files.length) messages.push(`Solo caben ${GALLERY_LIMIT} imágenes: se omitieron ${images.length - files.length}.`);
    setError(messages.join(" "));
    if (!files.length) return;

    setProgress({ done: 0, total: files.length });
    const failures: string[] = [];
    let next = 0;
    let done = 0;

    // Varias subidas en paralelo; cada imagen subida se agrega al instante,
    // así una falla no hace perder las que sí se subieron.
    const worker = async () => {
      while (next < files.length) {
        const file = files[next];
        next += 1;
        try {
          const optimized = await optimizeEditorialImageFile(file);
          const body = new FormData();
          body.append("file", optimized);
          const result = await apiRequest<UploadResponse>(
            "/media/images",
            { method: "POST", body },
            { token, redirectOnUnauthorized: true },
          );
          if (!latest.current.includes(result.url)) {
            latest.current = [...latest.current, result.url];
            onChange(latest.current);
          }
        } catch (requestError) {
          failures.push(`${file.name}: ${requestError instanceof Error ? requestError.message : "no se pudo subir"}`);
        } finally {
          done += 1;
          setProgress({ done, total: files.length });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker));
    setProgress(null);
    if (failures.length) messages.push(`No se subieron ${failures.length} de ${files.length}: ${failures.slice(0, 2).join(" · ")}`);
    setError(messages.join(" "));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const copy = [...value];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  return (
    <div className={styles.field}>
      <label>Galería adicional <small>({value.length} / {GALLERY_LIMIT})</small></label>
      <div className={styles.imageRow}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addUrl();
            }
          }}
          placeholder="URL de una imagen"
        />
        <button type="button" className={styles.secondaryButton} onClick={addUrl}>Agregar URL</button>
        <FilePicker
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          busyLabel={progress ? `Subiendo ${progress.done}/${progress.total}…` : "Subiendo…"}
          label="Subir varias"
          className={styles.uploadButton}
          onFiles={(files) => void upload(files)}
        />
      </div>
      {uploading && progress && (
        <div className={styles.uploadProgress} role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
          <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
        </div>
      )}
      {error && <small className={styles.error}>{error}</small>}
      <div
        className={`${styles.galleryGrid} ${dragging ? styles.galleryDrop : ""}`}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!uploading) void upload(Array.from(event.dataTransfer.files));
        }}
      >
        {value.map((url, index) => (
          <div className={styles.galleryItem} key={`${url}-${index}`}>
            <img src={mediaUrl(url)} alt={`Galería ${index + 1}`} />
            <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label="Quitar de la galería">×</button>
            <div className={styles.galleryMove}>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover antes">←</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Mover después">→</button>
            </div>
          </div>
        ))}
        {!value.length && <p className={styles.galleryHint}>Arrastra imágenes aquí o usa “Subir varias”.</p>}
      </div>
    </div>
  );
}
