// Editor de contenido del panel: el mismo del formulario público de Voces, con modo HTML y vista previa.
import { useState } from "react";
import { ModeSwitch } from "../editor/ModeSwitch";
import type { EditorMode } from "../editor/ModeSwitch";
import { RichTextEditor } from "../editor/RichTextEditor";
import type { PendingEditorImage } from "../editor/RichTextEditor";
import { HtmlPreview } from "./HtmlPreview";
import { toEditorHtml, toStoredHtml } from "./storyImages";
import styles from "./StoryEditor.module.css";

export function StoryEditor({
  label,
  value,
  onChange,
  onRegisterImage,
  variant = "article",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  onRegisterImage: (file: File) => PendingEditorImage;
  variant?: "article" | "volunteer";
  placeholder?: string;
}) {
  const [mode, setMode] = useState<EditorMode>("write");

  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <strong>{label}</strong>
        <ModeSwitch mode={mode} onChange={setMode} withHtml />
      </div>
      {mode === "write" && (
        <RichTextEditor
          value={toEditorHtml(value)}
          onChange={(html) => onChange(toStoredHtml(html))}
          onRegisterImage={onRegisterImage}
          placeholder={placeholder}
        />
      )}
      {mode === "html" && (
        <textarea
          className={styles.code}
          aria-label={`${label} en HTML`}
          value={value}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          placeholder="<p>Escribe o pega aquí el HTML…</p>"
        />
      )}
      {mode === "preview" && <HtmlPreview value={value} variant={variant} />}
    </div>
  );
}
