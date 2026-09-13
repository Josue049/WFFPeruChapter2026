import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  LANGUAGE_LABELS,
  LANGUAGE_SHORT_LABELS,
} from "../../i18n/translations";
import type { Language } from "../../i18n/translations";

const languages: Language[] = ["es", "en", "it", "pt"];

export function LanguageSwitcher() {
  const {
    language,
    country,
    automatic,
    detecting,
    setLanguage,
    useAutomaticLanguage,
    t,
  } = useLanguage();

  const [open, setOpen] = useState(false);

  const rootRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (
      event: MouseEvent,
    ) => {
      if (
        !rootRef.current?.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      onPointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onPointerDown,
      );
    };
  }, []);

  return (
    <div
      className="language-switcher"
      ref={rootRef}
    >
      <button
        type="button"
        className="language-switcher-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("language.change")}
        title={t("language.change")}
        onClick={() =>
          setOpen((value) => !value)
        }
      >
        <svg
          className="language-switcher-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21" />
          <path d="M12 3C9.5 5.5 8.2 8.5 8.2 12s1.3 6.5 3.8 9" />
        </svg>

        <strong>
          {detecting ? "…" : LANGUAGE_SHORT_LABELS[language]}
        </strong>
      </button>

      {open && (
        <div
          className="language-switcher-menu"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className={`language-switcher-option language-switcher-auto ${
              automatic ? "active" : ""
            }`}
            onClick={() => {
              void useAutomaticLanguage();
              setOpen(false);
            }}
          >
            <span className="language-switcher-code">AUTO</span>
            <span className="language-switcher-name">
              {detecting
                ? t("language.detecting")
                : `${t("language.auto")} · ${
                    country || t("language.autoDescription")
                  }`}
            </span>
          </button>

          <div className="language-switcher-divider" aria-hidden="true" />

          {languages.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              className={`language-switcher-option ${
                item === language
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setLanguage(item);
                setOpen(false);
              }}
            >
              <span className="language-switcher-code">
                {
                  LANGUAGE_SHORT_LABELS[
                    item
                  ]
                }
              </span>

              <span className="language-switcher-name">
                {LANGUAGE_LABELS[item]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}