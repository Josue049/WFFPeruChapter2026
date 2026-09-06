import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./RichTextEditor.module.css";
import { useLanguage } from "../../i18n/LanguageContext";

export type PendingEditorImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onRegisterImage?: (
    file: File,
  ) => PendingEditorImage;
  maxImages?: number;
};

type TextSize =
  | "small"
  | "normal"
  | "large"
  | "xlarge";

const FONT_SIZE_COMMAND: Record<
  TextSize,
  string
> = {
  small: "2",
  normal: "3",
  large: "5",
  xlarge: "7",
};

const FONT_SIZE_DATA: Record<
  string,
  TextSize
> = {
  "1": "small",
  "2": "small",
  "3": "normal",
  "4": "normal",
  "5": "large",
  "6": "xlarge",
  "7": "xlarge",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeFontTags(
  root: HTMLElement,
) {
  const fonts = Array.from(
    root.querySelectorAll("font[size]"),
  );

  for (const font of fonts) {
    const size =
      FONT_SIZE_DATA[
        font.getAttribute("size") ?? "3"
      ] ?? "normal";

    const span =
      document.createElement("span");

    span.dataset.size = size;

    while (font.firstChild) {
      span.appendChild(font.firstChild);
    }

    font.replaceWith(span);
  }
}

function countPendingImages(
  root: HTMLElement | null,
) {
  return (
    root?.querySelectorAll(
      "img[data-pending-image-id]",
    ).length ?? 0
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí tu artículo…",
  onRegisterImage,
  maxImages = 8,
}: RichTextEditorProps) {
  const { t } = useLanguage();

  const editorRef =
    useRef<HTMLDivElement>(null);

  const savedRangeRef =
    useRef<Range | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================
     MENSAJES DEL EDITOR
     ========================= */

  const [
    editorMessage,
    setEditorMessage,
  ] = useState("");

  /* =========================
     MODAL DE ENLACE
     ========================= */

  const [
    linkModalOpen,
    setLinkModalOpen,
  ] = useState(false);

  const [linkText, setLinkText] =
    useState("");

  const [linkUrl, setLinkUrl] =
    useState("");

  const [
    linkError,
    setLinkError,
  ] = useState("");

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    if (
      document.activeElement !== editor &&
      editor.innerHTML !== value
    ) {
      editor.innerHTML = value;
    }
  }, [value]);

  /* =========================
     SELECCIÓN
     ========================= */

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection =
      window.getSelection();

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range =
      selection.getRangeAt(0);

    const common =
      range.commonAncestorContainer;

    if (
      editor.contains(common) ||
      common === editor
    ) {
      savedRangeRef.current =
        range.cloneRange();
    }
  };

  const getInsertionRange = () => {
    const editor = editorRef.current;

    if (!editor) return null;

    const savedRange = savedRangeRef.current;

    if (
      savedRange &&
      savedRange.startContainer.isConnected &&
      savedRange.endContainer.isConnected &&
      editor.contains(savedRange.startContainer) &&
      editor.contains(savedRange.endContainer)
    ) {
      return savedRange.cloneRange();
    }

    /*
      Si por cualquier motivo el navegador perdió la selección
      (por ejemplo al abrir el selector de archivos), usamos el
      final del contenido como fallback. Nunca el inicio.
    */
    const fallbackRange = document.createRange();
    fallbackRange.selectNodeContents(editor);
    fallbackRange.collapse(false);

    return fallbackRange;
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const range = getInsertionRange();

    if (!editor || !range) return;

    editor.focus({ preventScroll: true });

    const selection = window.getSelection();

    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    savedRangeRef.current = range.cloneRange();
  };

  /* =========================
     SINCRONIZAR HTML
     ========================= */

  const syncValue = (
    keepCurrentSelection = true,
  ) => {
    const editor = editorRef.current;

    if (!editor) return;

    normalizeFontTags(editor);

    if (
      !editor.textContent?.trim() &&
      !editor.querySelector("img")
    ) {
      editor.innerHTML = "";
      onChange("");

      if (keepCurrentSelection) {
        saveSelection();
      }

      return;
    }

    onChange(editor.innerHTML);

    /*
      IMPORTANTE: al abrir el modal de enlaces o el selector
      de archivos, el editor pierde el foco. En ese blur algunos
      navegadores mueven la selección al comienzo del editor.
      No debemos sobrescribir aquí la selección que guardamos al
      pulsar el botón de la barra de herramientas.
    */
    if (keepCurrentSelection) {
      saveSelection();
    }
  };

  /* =========================
     COMANDOS
     ========================= */

  const runCommand = (
    command: string,
    commandValue?: string,
  ) => {
    restoreSelection();

    document.execCommand(
      command,
      false,
      commandValue,
    );

    syncValue();
  };

  const applySize = (
    size: TextSize,
  ) => {
    restoreSelection();

    document.execCommand(
      "fontSize",
      false,
      FONT_SIZE_COMMAND[size],
    );

    syncValue();
  };

  const insertHtml = (
    html: string,
  ) => {
    const editor = editorRef.current;
    const range = getInsertionRange();

    if (!editor || !range) return;

    /*
      Insertamos con Range en lugar de depender de execCommand.
      Así la imagen o el enlace se colocan exactamente en la
      posición guardada aunque el modal/file picker haya quitado
      el foco al contentEditable.
    */
    range.deleteContents();

    const template = document.createElement("template");
    template.innerHTML = html;

    const fragment = template.content;
    const lastInsertedNode = fragment.lastChild;

    range.insertNode(fragment);

    const nextRange = document.createRange();

    if (lastInsertedNode?.isConnected) {
      nextRange.setStartAfter(lastInsertedNode);
    } else {
      nextRange.selectNodeContents(editor);
      nextRange.collapse(false);
    }

    nextRange.collapse(true);
    savedRangeRef.current = nextRange.cloneRange();

    editor.focus({ preventScroll: true });

    const selection = window.getSelection();

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(nextRange);
    }

    syncValue();
  };

  /* =========================
     ENLACES
     ========================= */

  const openLinkModal = () => {
    saveSelection();

    const selectedText =
      savedRangeRef.current
        ?.toString()
        .trim() ?? "";

    setLinkText(selectedText);
    setLinkUrl("");
    setLinkError("");
    setLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setLinkText("");
    setLinkUrl("");
    setLinkError("");
  };

  const confirmLink = () => {
    const rawUrl =
      linkUrl.trim();

    if (!rawUrl) {
      setLinkError(
        t("editor.linkRequired"),
      );

      return;
    }

    let url = rawUrl;

    if (
      !/^(https?:|mailto:|tel:)/i.test(
        url,
      )
    ) {
      url = `https://${url}`;
    }

    const text =
      linkText.trim() || url;

    insertHtml(
      `<a href="${escapeHtml(
        url,
      )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        text,
      )}</a>`,
    );

    closeLinkModal();
  };

  /* =========================
     IMÁGENES
     ========================= */

  const handleImage = (
    file: File,
  ) => {
    if (!onRegisterImage) {
      return;
    }

    setEditorMessage("");

    if (
      !file.type.match(
        /^image\/(jpeg|png|webp)$/,
      )
    ) {
      setEditorMessage(
        t("editor.invalidImage"),
      );

      return;
    }

    /*
      Todavía NO se sube al servidor.
      Solo evitamos archivos exagerados.
    */
    if (
      file.size >
      15 * 1024 * 1024
    ) {
      setEditorMessage(
        t("editor.imageTooLarge"),
      );

      return;
    }

    if (
      countPendingImages(
        editorRef.current,
      ) >= maxImages
    ) {
      setEditorMessage(
        t("editor.maxImages", {
          max: maxImages,
        }),
      );

      return;
    }

    const pending =
      onRegisterImage(file);

    const alt = file.name.replace(
      /\.[^.]+$/,
      "",
    );

    /*
      Ya NO preguntamos por pie de foto.

      La imagen se inserta inmediatamente.
    */
    /*
      IMPORTANTE:
      Insertamos la imagen como <img> (contenido "phrasing") y no como
      <figure> (bloque). Un <figure> puede quedar anidado dentro de <p> o
      <span> cuando se inserta en mitad del texto mediante Range. El navegador
      lo muestra en la posición correcta, pero al enviarlo el sanitizador del
      backend vuelve a parsear ese HTML inválido y puede reubicar el bloque.

      <img> sí es válido dentro de párrafos/spans, por lo que conserva
      exactamente su posición al pasar por el backend y llegar al admin.
    */
    insertHtml(
      `<img
        src="${escapeHtml(
          pending.previewUrl,
        )}"
        data-pending-image-id="${escapeHtml(
          pending.id,
        )}"
        alt="${escapeHtml(alt)}"
      ><br><br>`,
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  };

  /* =========================
     PEGAR TEXTO
     ========================= */

  const handlePaste = (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const plainText =
      event.clipboardData.getData(
        "text/plain",
      );

    if (!plainText) return;

    const safeText =
      escapeHtml(
        plainText,
      ).replace(/\n/g, "<br>");

    document.execCommand(
      "insertHTML",
      false,
      safeText,
    );

    syncValue();
  };

  return (
    <>
      <div
        className={styles.wrapper}
      >
        {/* =====================
            TOOLBAR
            ===================== */}

        <div
          className={styles.toolbar}
          role="toolbar"
          aria-label={t(
            "editor.toolbar",
          )}
          onMouseDown={
            saveSelection
          }
        >
          <select
            className={styles.select}
            defaultValue="normal"
            aria-label={t(
              "editor.textSize",
            )}
            title={t(
              "editor.textSize",
            )}
            onMouseDown={
              saveSelection
            }
            onChange={(event) =>
              applySize(
                event.target
                  .value as TextSize,
              )
            }
          >
            <option value="small">
              {t("editor.small")}
            </option>

            <option value="normal">
              {t("editor.normal")}
            </option>

            <option value="large">
              {t("editor.large")}
            </option>

            <option value="xlarge">
              {t("editor.xlarge")}
            </option>
          </select>

          <span
            className={
              styles.divider
            }
          />

          <ToolbarButton
            label={t(
              "editor.bold",
            )}
            onPress={() =>
              runCommand("bold")
            }
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.italic",
            )}
            onPress={() =>
              runCommand("italic")
            }
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.underline",
            )}
            onPress={() =>
              runCommand(
                "underline",
              )
            }
          >
            <u>U</u>
          </ToolbarButton>

          <span
            className={
              styles.divider
            }
          />

          <ToolbarButton
            label={t(
              "editor.subtitle",
            )}
            onPress={() =>
              runCommand(
                "formatBlock",
                "h2",
              )
            }
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.smallTitle",
            )}
            onPress={() =>
              runCommand(
                "formatBlock",
                "h3",
              )
            }
          >
            H3
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.paragraph",
            )}
            onPress={() =>
              runCommand(
                "formatBlock",
                "p",
              )
            }
          >
            ¶
          </ToolbarButton>

          <span
            className={
              styles.divider
            }
          />

          <ToolbarButton
            label={t(
              "editor.bullets",
            )}
            onPress={() =>
              runCommand(
                "insertUnorderedList",
              )
            }
          >
            •{" "}
            {t(
              "editor.listShort",
            )}
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.numbered",
            )}
            onPress={() =>
              runCommand(
                "insertOrderedList",
              )
            }
          >
            1.{" "}
            {t(
              "editor.listShort",
            )}
          </ToolbarButton>

          <ToolbarButton
            label={t(
              "editor.quote",
            )}
            onPress={() =>
              runCommand(
                "formatBlock",
                "blockquote",
              )
            }
          >
            “ ”
          </ToolbarButton>

          <span
            className={
              styles.divider
            }
          />

          {/* LINK */}

          <ToolbarButton
            label={t(
              "editor.link",
            )}
            onPress={
              openLinkModal
            }
          >
            <span className="material-symbols-outlined">
              link
            </span>
          </ToolbarButton>

          {/* IMAGEN */}

          {onRegisterImage && (
            <ToolbarButton
              label={t(
                "editor.image",
              )}
              onPress={() => {
                saveSelection();
                imageInputRef.current?.click();
              }}
            >
              <span
                className="material-symbols-outlined"
              >
                image
              </span>

              <span>
                {t(
                  "editor.imageButton",
                )}
              </span>
            </ToolbarButton>
          )}
        </div>

        {/* MENSAJES */}

        {editorMessage && (
          <div
            className={
              styles.editorMessage
            }
          >
            <span>!</span>

            <p>
              {editorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setEditorMessage(
                  "",
                )
              }
            >
              ×
            </button>
          </div>
        )}

        {/* EDITOR */}

        <div
          ref={editorRef}
          className={
            styles.editor
          }
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={
            placeholder
          }
          onInput={() =>
            syncValue()
          }
          onMouseUp={
            saveSelection
          }
          onKeyUp={
            saveSelection
          }
          onFocus={
            saveSelection
          }
          onBlur={() =>
            syncValue(false)
          }
          onPaste={
            handlePaste
          }
        />

        <div
          className={
            styles.footer
          }
        >
          <span>
            {t(
              "editor.selectText",
            )}
          </span>
{/* 
          <span>
            {t(
              "editor.imagesOnSubmit",
            )}
          </span> */}
        </div>

        <input
          ref={imageInputRef}
          className={
            styles.hiddenInput
          }
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file =
              event.target
                .files?.[0];

            if (file) {
              handleImage(file);
            }
          }}
        />
      </div>

      {/* =========================
          MODAL INSERTAR ENLACE
          ========================= */}

      {linkModalOpen && (
        <div
          className={
            styles.modalBackdrop
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLinkModal();
            }
          }}
        >
          <div
            className={
              styles.linkModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-modal-title"
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <span
                  className={
                    styles.modalEyebrow
                  }
                >
                  <span className="material-symbols-outlined">
                  link
                  </span>
                </span>

                <h3
                  id="link-modal-title"
                >
                  {t(
                    "editor.linkModalTitle",
                  )}
                </h3>
              </div>

              <button
                type="button"
                className={
                  styles.modalClose
                }
                onClick={
                  closeLinkModal
                }
                aria-label={t(
                  "editor.close",
                )}
              >
                ×
              </button>
            </div>

            <div
              className={
                styles.modalBody
              }
            >
              <label
                className={
                  styles.modalField
                }
              >
                <span>
                  {t(
                    "editor.linkText",
                  )}
                </span>

                <input
                  type="text"
                  value={linkText}
                  placeholder={t(
                    "editor.linkTextPlaceholder",
                  )}
                  onChange={(
                    event,
                  ) =>
                    setLinkText(
                      event.target
                        .value,
                    )
                  }
                />
              </label>

              <label
                className={
                  styles.modalField
                }
              >
                <span>
                  {t(
                    "editor.linkUrl",
                  )}
                </span>

                <input
                  type="text"
                  autoFocus
                  value={linkUrl}
                  placeholder="https://..."
                  onChange={(
                    event,
                  ) => {
                    setLinkUrl(
                      event.target
                        .value,
                    );

                    setLinkError(
                      "",
                    );
                  }}
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      confirmLink();
                    }

                    if (
                      event.key ===
                      "Escape"
                    ) {
                      closeLinkModal();
                    }
                  }}
                />
              </label>

              {linkError && (
                <div
                  className={
                    styles.modalError
                  }
                >
                  {linkError}
                </div>
              )}
            </div>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={
                  closeLinkModal
                }
              >
                {t(
                  "editor.cancel",
                )}
              </button>

              <button
                type="button"
                className={
                  styles.confirmButton
                }
                onClick={
                  confirmLink
                }
              >
                {t(
                  "editor.insertLink",
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   BOTÓN TOOLBAR
   ========================= */

function ToolbarButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        styles.toolButton
      }
      title={label}
      aria-label={label}
      onMouseDown={(
        event,
      ) => {
        event.preventDefault();
      }}
      onClick={onPress}
    >
      {children}
    </button>
  );
}