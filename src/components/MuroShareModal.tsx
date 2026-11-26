import { useEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { MuroShareForm } from "./MuroShareForm";
import styles from "../pages/Muro.module.css";

/** Ventana emergente para compartir una reflexión sin salir del Muro. */
export function MuroShareModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    // El sitio desplaza su contenido dentro de #main-scroll; se bloquea mientras el modal está abierto.
    const scroller = document.getElementById("main-scroll");
    const previousOverflow = scroller?.style.overflow ?? "";
    if (scroller) scroller.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (scroller) scroller.style.overflow = previousOverflow;
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className={styles.modalPanel} role="dialog" aria-modal="true" aria-labelledby="muro-share-title" tabIndex={-1}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        <h2 id="muro-share-title" className={styles.modalTitle}>{t("muro.form.title")}</h2>
        <p className={styles.modalIntro}>{t("muro.form.intro")}</p>
        <MuroShareForm onDone={onClose} />
      </div>
    </div>
  );
}
