import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { apiRequest } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import styles from "./AdminForms.module.css";

interface UploadResponse {
  url: string;
  width: number;
  height: number;
  size_bytes: number;
}

interface ImageFieldProps {
  label: string;
  value: string;
  token: string;
  onChange: (value: string) => void;
  help?: string;
  required?: boolean;
}

export function ImageField({ label, value, token, onChange, help, required }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const result = await apiRequest<UploadResponse>(
        "/media/images",
        { method: "POST", body },
        { token, redirectOnUnauthorized: true },
      );
      onChange(result.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.field}>
      <label>{label}{required ? " *" : ""}</label>
      <div className={styles.imageRow}>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... o sube un archivo"
          required={required}
        />
        <button type="button" className={styles.uploadButton} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Subiendo…" : "Subir imagen"}
        </button>
        <input ref={inputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
      </div>
      {help && <small>{help}</small>}
      {error && <small className={styles.error}>{error}</small>}
      {value && (
        <div className={styles.imagePreview}>
          <img src={mediaUrl(value)} alt="Vista previa" />
          <button type="button" onClick={() => onChange("")}>Quitar</button>
        </div>
      )}
    </div>
  );
}

export function TransparentPortraitField({ label, value, token, onChange, help, required }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      setError("El retrato debe ser un archivo PNG.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const result = await apiRequest<UploadResponse>(
        "/media/portraits",
        { method: "POST", body },
        { token, redirectOnUnauthorized: true },
      );
      onChange(result.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo subir el retrato");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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
        <button type="button" className={styles.uploadButton} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Validando…" : "Subir PNG"}
        </button>
        <input ref={inputRef} className={styles.hiddenInput} type="file" accept="image/png" onChange={upload} />
      </div>
      {help && <small>{help}</small>}
      {error && <small className={styles.error}>{error}</small>}
      {value && (
        <div className={`${styles.imagePreview} ${styles.transparentPreview}`}>
          <img src={mediaUrl(value)} alt="Vista previa del retrato" />
          <button type="button" onClick={() => onChange("")}>Quitar</button>
        </div>
      )}
    </div>
  );
}

interface GalleryFieldProps {
  value: string[];
  token: string;
  onChange: (value: string[]) => void;
}

export function GalleryField({ value, token, onChange }: GalleryFieldProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const addUrl = () => {
    const url = draft.trim();
    if (url && !value.includes(url)) onChange([...value, url]);
    setDraft("");
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const result = await apiRequest<UploadResponse>(
          "/media/images",
          { method: "POST", body },
          { token, redirectOnUnauthorized: true },
        );
        uploaded.push(result.url);
      }
      onChange([...value, ...uploaded.filter((url) => !value.includes(url))]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo subir la galería");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.field}>
      <label>Galería adicional</label>
      <div className={styles.imageRow}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="URL de una imagen" />
        <button type="button" className={styles.secondaryButton} onClick={addUrl}>Agregar URL</button>
        <button type="button" className={styles.uploadButton} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Subiendo…" : "Subir varias"}
        </button>
        <input ref={inputRef} className={styles.hiddenInput} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={upload} />
      </div>
      {error && <small className={styles.error}>{error}</small>}
      <div className={styles.galleryGrid}>
        {value.map((url, index) => (
          <div className={styles.galleryItem} key={`${url}-${index}`}>
            <img src={mediaUrl(url)} alt={`Galería ${index + 1}`} />
            <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
