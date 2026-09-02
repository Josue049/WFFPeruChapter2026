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
    setLanguage,
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
        <span
          className="material-symbols-outlined language-switcher-icon"
          aria-hidden="true"
        >
          language
        </span>

        <strong>
          {LANGUAGE_SHORT_LABELS[language]}
        </strong>
      </button>

      {open && (
        <div
          className="language-switcher-menu"
          role="menu"
        >
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