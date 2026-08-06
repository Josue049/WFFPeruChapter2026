import { useCallback, useEffect, useMemo, useState } from "react";
import type { Article } from "../../types";
import { apiRequest } from "../../services/api";
import { ImageField } from "./ImageField";
import styles from "./AdminForms.module.css";

type ArticleForm = Omit<Article, "id">;

const emptyArticle = (): ArticleForm => ({
  author_name: "",
  author_lastname: "",
  author_photo: "",
  author_cargo: "",
  title: "",
  subtitle: "",
  date: new Date().toISOString().slice(0, 10),
  body: "",
});

const toArticleForm = (article: Article): ArticleForm => ({
  author_name: article.author_name ?? "",
  author_lastname: article.author_lastname ?? "",
  author_photo: article.author_photo ?? "",
  author_cargo: article.author_cargo ?? "",
  title: article.title ?? "",
  subtitle: article.subtitle ?? "",
  date: article.date?.slice(0, 10) ?? "",
  body: article.body ?? "",
});

export function ArticlesManager({ token }: { token: string }) {
  const [items, setItems] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyArticle());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    const data = await apiRequest<Article[]>(
      "/articles",
      {},
      { token, redirectOnUnauthorized: true },
    );

    setItems(data);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    void apiRequest<Article[]>(
      "/articles",
      {},
      { token, redirectOnUnauthorized: true },
    )
      .then((data) => {
        if (!cancelled) {
          setItems(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los artículos.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) =>
      `${item.title} ${item.author_name} ${item.author_lastname}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [items, search]);

  const select = (item: Article) => {
    setSelectedId(item.id);
    setForm(toArticleForm(item));
    setMessage("");
  };

  const createNew = () => {
    setSelectedId(null);
    setForm(emptyArticle());
    setMessage("");
  };

  const validateForm = (): string | null => {
    const requiredFields: Array<[string, string]> = [
      ["Foto del autor", form.author_photo],
      ["Nombre", form.author_name],
      ["Apellido", form.author_lastname],
      ["Cargo o entidad", form.author_cargo],
      ["Título", form.title],
      ["Subtítulo", form.subtitle],
      ["Fecha de publicación", form.date],
      ["Artículo", form.body],
    ];

    const emptyField = requiredFields.find(([, value]) => !value.trim());

    if (emptyField) {
      return `Completa el campo: ${emptyField[0]}.`;
    }

    return null;
  };

  const save = async () => {
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const payload: ArticleForm = {
      author_name: form.author_name.trim(),
      author_lastname: form.author_lastname.trim(),
      author_photo: form.author_photo.trim(),
      author_cargo: form.author_cargo.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      date: form.date,
      body: form.body.trim(),
    };

    try {
      setIsSaving(true);
      setMessage("");

      const result = await apiRequest<Article>(
        selectedId ? `/articles/${selectedId}` : "/articles",
        {
          method: selectedId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
        { token, redirectOnUnauthorized: true },
      );

      setSelectedId(result.id);
      setForm(toArticleForm(result));

      await load();

      setMessage("Artículo guardado correctamente.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;

    const confirmed = window.confirm("¿Eliminar este artículo?");

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setMessage("");

      await apiRequest(
        `/articles/${selectedId}`,
        { method: "DELETE" },
        { token, redirectOnUnauthorized: true },
      );

      setSelectedId(null);
      setForm(emptyArticle());

      await load();

      setMessage("Artículo eliminado correctamente.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo eliminar.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Voces</h2>
          <p>Artículos y columnas del capítulo.</p>

          <button
            type="button"
            className={styles.newButton}
            onClick={createNew}
          >
            + Nuevo artículo
          </button>
        </div>

        <input
          className={styles.search}
          placeholder="Buscar…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className={styles.itemList}>
          {filtered.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`${styles.listItem} ${
                selectedId === item.id ? styles.listItemActive : ""
              }`}
              onClick={() => select(item)}
            >
              <strong>{item.title}</strong>

              <span>
                {item.author_name} {item.author_lastname}
              </span>

              <small>{item.date}</small>
            </button>
          ))}

          {!filtered.length && (
            <div className={styles.empty}>No hay artículos.</div>
          )}
        </div>
      </aside>

      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <div>
            <h2>{selectedId ? "Editar artículo" : "Nuevo artículo"}</h2>
            <p>El contenido admite HTML editorial seguro.</p>
          </div>

          <div className={styles.actions}>
            {selectedId && (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={remove}
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? "Eliminando…" : "Eliminar"}
              </button>
            )}

            <button
              type="button"
              className={styles.primaryButton}
              onClick={save}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>

        <div className={styles.formGrid}>
          {message && <div className={styles.status}>{message}</div>}

          <ImageField
            label="Foto del autor"
            value={form.author_photo}
            token={token}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                author_photo: value,
              }))
            }
            required
          />

          <div className={styles.twoColumns}>
            <Field
              label="Nombre"
              value={form.author_name}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  author_name: value,
                }))
              }
              required
            />

            <Field
              label="Apellido"
              value={form.author_lastname}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  author_lastname: value,
                }))
              }
              required
            />
          </div>

          <Field
            label="Cargo o entidad"
            value={form.author_cargo}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                author_cargo: value,
              }))
            }
            required
          />

          <Field
            label="Título"
            value={form.title}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                title: value,
              }))
            }
            required
          />

          <Field
            label="Subtítulo"
            value={form.subtitle}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                subtitle: value,
              }))
            }
            required
          />

          <Field
            label="Fecha de publicación"
            type="date"
            value={form.date}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                date: value,
              }))
            }
            required
          />

          <TextArea
            label="Artículo"
            value={form.body}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                body: value,
              }))
            }
            rows={14}
            required
          />
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {required ? " *" : ""}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {required ? " *" : ""}
      </label>

      <textarea
        rows={rows}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}