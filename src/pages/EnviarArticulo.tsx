import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { HtmlPreview } from "../components/admin/HtmlPreview";
import { apiRequest } from "../services/api";
import type { ArticleSubmissionPublicResponse } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./VocesSubmission.module.css";

interface SubmissionForm {
  author_name: string;
  author_lastname: string;
  author_cargo: string;
  author_email: string;
  author_photo: string;
  title: string;
  subtitle: string;
  body: string;
}

const emptyForm: SubmissionForm = {
  author_name: "",
  author_lastname: "",
  author_cargo: "",
  author_email: "",
  author_photo: "",
  title: "",
  subtitle: "",
  body: "",
};

export default function EnviarArticulo() {
  const [form, setForm] = useState<SubmissionForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canSend = useMemo(
    () => Object.values(form).every((value) => value.trim().length > 0),
    [form],
  );

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const uploaded = await apiRequest<{ url: string }>("/article-submissions/media", {
        method: "POST",
        body: data,
      });
      setForm((current) => ({ ...current, author_photo: uploaded.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la fotografía.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) {
      setError("Completa todos los campos antes de enviar tu artículo.");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<ArticleSubmissionPublicResponse>("/article-submissions", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage(response.message || "Tu artículo fue enviado correctamente.");
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar el artículo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <div className={styles.shell}>
          <Link className={styles.back} to="/voces">← Volver a Voces</Link>
          <header className={styles.hero}>
            <span>VOCES DEL CAPÍTULO</span>
            <h1>Envía tu artículo</h1>
            <p>Comparte una idea, experiencia o iniciativa. El equipo del WFF Perú Chapter revisará el contenido antes de publicarlo.</p>
          </header>

          {message ? (
            <section className={styles.success}>
              <strong>¡Recibido!</strong>
              <p>{message}</p>
              <Link to="/voces">Volver a Voces</Link>
            </section>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              {error && <div className={styles.error}>{error}</div>}

              <section className={styles.card}>
                <div className={styles.sectionHeading}>
                  <span>01</span><div><h2>Sobre ti</h2><p>Estos datos acompañarán el artículo si es aprobado.</p></div>
                </div>

                <div className={styles.twoColumns}>
                  <Field label="Nombres" value={form.author_name} onChange={(author_name) => setForm({ ...form, author_name })} />
                  <Field label="Apellidos" value={form.author_lastname} onChange={(author_lastname) => setForm({ ...form, author_lastname })} />
                </div>
                <div className={styles.twoColumns}>
                  <Field label="Cargo o entidad" value={form.author_cargo} onChange={(author_cargo) => setForm({ ...form, author_cargo })} />
                  <Field label="Correo electrónico" type="email" value={form.author_email} onChange={(author_email) => setForm({ ...form, author_email })} />
                </div>

                <div className={styles.photoField}>
                  <label>Fotografía del autor</label>
                  <div className={styles.photoRow}>
                    <label className={styles.uploadButton}>
                      {uploading ? "Subiendo…" : "Seleccionar imagen"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); }} />
                    </label>
                    <span>{form.author_photo ? "Imagen lista" : "JPG, PNG o WebP"}</span>
                  </div>
                  {form.author_photo && <img className={styles.photoPreview} src={mediaUrl(form.author_photo)} alt="Vista previa del autor" />}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.sectionHeading}>
                  <span>02</span><div><h2>Tu artículo</h2><p>Puedes usar HTML sencillo para negritas, listas, subtítulos y enlaces.</p></div>
                </div>
                <Field label="Título" value={form.title} onChange={(title) => setForm({ ...form, title })} />
                <Field label="Breve descripción" value={form.subtitle} onChange={(subtitle) => setForm({ ...form, subtitle })} />
                <div className={styles.field}>
                  <label>Contenido</label>
                  <textarea rows={18} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Escribe aquí tu artículo…" />
                </div>
                <HtmlPreview value={form.body} />
              </section>

              <div className={styles.submitRow}>
                <p>Al enviar, el contenido quedará pendiente de revisión y no será publicado automáticamente.</p>
                <button type="submit" disabled={!canSend || sending || uploading}>{sending ? "Enviando…" : "Enviar artículo"}</button>
              </div>
            </form>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className={styles.field}><label>{label}</label><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
