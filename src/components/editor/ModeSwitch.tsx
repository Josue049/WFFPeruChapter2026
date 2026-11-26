// Selector «Escribir / HTML / Vista previa» que acompaña al editor.
import { useLanguage } from "../../i18n/LanguageContext";
import styles from "./ModeSwitch.module.css";

export type EditorMode = "write" | "html" | "preview";

export function ModeSwitch({
  mode,
  onChange,
  withHtml = false,
}: {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
  /** Añade la pestaña para editar el código (solo en el panel). */
  withHtml?: boolean;
}) {
  const { t } = useLanguage();
  const options: Array<{ id: EditorMode; label: string }> = [
    { id: "write", label: t("editor.write") },
    ...(withHtml ? [{ id: "html" as const, label: "HTML" }] : []),
    { id: "preview", label: t("editor.preview") },
  ];

  return (
    <div className={styles.modes} role="tablist" aria-label={t("editor.mode")}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={mode === option.id}
          className={mode === option.id ? styles.modeActive : ""}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
