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
  is_chapter_member: boolean | null;
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
  is_chapter_member: null,
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

  const [acceptedRules, setAcceptedRules] = useState(false);


  const canSend = useMemo(
    () =>
      form.author_name.trim().length > 0 &&
      form.author_lastname.trim().length > 0 &&
      form.author_cargo.trim().length > 0 &&
      form.author_email.trim().length > 0 &&
      form.is_chapter_member !== null &&
      form.author_photo.trim().length > 0 &&
      form.title.trim().length > 0 &&
      form.subtitle.trim().length > 0 &&
      form.body.trim().length > 0 &&
      acceptedRules,
    [form, acceptedRules],
  );


  const uploadPhoto = async (file: File) => {
    setError("");

    const dimensions = await readImageDimensions(file);

    if (dimensions.width !== dimensions.height) {
      setError(
        "La fotografía debe ser cuadrada (misma medida de ancho y alto).",
      );
      return;
    }

    if (dimensions.width > 640 || dimensions.height > 640) {
      setError(
        `La fotografía no puede superar 640 × 640 px. La seleccionada mide ${dimensions.width} × ${dimensions.height} px.`,
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = new FormData();

      data.append("file", file);

      const uploaded = await apiRequest<{ url: string }>(
        "/article-submissions/media",
        {
          method: "POST",
          body: data,
        },
      );

      setForm((current) => ({
        ...current,
        author_photo: uploaded.url,
      }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la fotografía.",
      );
    } finally {
      setUploading(false);
    }
  };


  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!acceptedRules) {
      setError(
        "Debes leer y aceptar las reglas de publicación antes de enviar tu artículo.",
      );
      return;
    }

    if (!canSend) {
      setError("Completa todos los campos antes de enviar tu artículo.");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const response =
        await apiRequest<ArticleSubmissionPublicResponse>(
          "/article-submissions",
          {
            method: "POST",
            body: JSON.stringify(form),
          },
        );

      setMessage(
        response.message || "Tu artículo fue enviado correctamente.",
      );

      setForm(emptyForm);
      setAcceptedRules(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar el artículo.",
      );
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
          <Link className={styles.back} to="/voces">
            ← Volver a Voces
          </Link>


          <header className={styles.hero}>
            <span>VOCES DEL CAPÍTULO</span>

            <h1>Envía tu artículo</h1>

            <p>
              Comparte un artículo de tu experiencia o de divulgación que
              creas que merezca ser leído por nuestra comunidad. El equipo
              del WFF Perú Chapter revisará el contenido antes de publicarlo.
            </p>
          </header>


          {message ? (
            <section className={styles.success}>
              <strong>¡Recibido!</strong>

              <p>{message}</p>

              <Link to="/voces">
                Volver a Voces
              </Link>
            </section>
          ) : (
            <form
              className={styles.form}
              onSubmit={submit}
            >
              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}


              <section className={styles.card}>
                <div className={styles.sectionHeading}>
                  <span>01</span>

                  <div>
                    <h2>Reglas para publicar en Voces</h2>

                    <p>
                      Revisa estos criterios antes de comenzar tu artículo.
                    </p>
                  </div>
                </div>


                <div className={styles.rules}>
                  <p>
                    <strong>1. Sé auténtico.</strong>{" "}
                    El artículo debe ser de autoría propia y no estar
                    generado por inteligencia artificial.
                  </p>

                  <p>
                    <strong>2. Usa información confiable.</strong>{" "}
                    Los datos y afirmaciones deben ser reales y
                    verificables. Cita las fuentes cuando corresponda.
                  </p>

                  <p>
                    <strong>3. No hagas publicidad.</strong>{" "}
                    El artículo no debe utilizarse para promocionar marcas,
                    productos, organizaciones, comunidades o partidos
                    políticos.
                  </p>

                  <p>
                    <strong>4. Puedes contar lo que haces.</strong>{" "}
                    Se permiten artículos sobre proyectos o iniciativas
                    propias cuando busquen compartir experiencias,
                    resultados o aprendizajes, y no hacer publicidad.
                  </p>

                  <p>
                    <strong>5. Mantén el respeto.</strong>{" "}
                    No se aceptará contenido discriminatorio, difamatorio,
                    violento, de odio ni ataques personales.
                  </p>

                  <p>
                    <strong>
                      6. Publicamos con criterio editorial.
                    </strong>{" "}
                    El equipo de Voces podrá solicitar ajustes o rechazar
                    artículos que no cumplan estas reglas o los criterios
                    de calidad de la plataforma.
                  </p>
                </div>
              </section>


              <section className={styles.card}>
                <div className={styles.sectionHeading}>
                  <span>02</span>

                  <div>
                    <h2>Sobre ti</h2>

                    <p>
                      Estos datos acompañarán el artículo si es aprobado.
                    </p>
                  </div>
                </div>


                <div className={styles.twoColumns}>
                  <Field
                    label="Nombres"
                    value={form.author_name}
                    onChange={(author_name) =>
                      setForm({
                        ...form,
                        author_name,
                      })
                    }
                  />

                  <Field
                    label="Apellidos"
                    value={form.author_lastname}
                    onChange={(author_lastname) =>
                      setForm({
                        ...form,
                        author_lastname,
                      })
                    }
                  />
                </div>


                <div className={styles.twoColumns}>
                  <Field
                    label="Cargo o entidad"
                    value={form.author_cargo}
                    onChange={(author_cargo) =>
                      setForm({
                        ...form,
                        author_cargo,
                      })
                    }
                  />

                  <Field
                    label="Correo electrónico"
                    type="email"
                    value={form.author_email}
                    onChange={(author_email) =>
                      setForm({
                        ...form,
                        author_email,
                      })
                    }
                  />
                </div>


                <div className={styles.memberField}>
                  <span className={styles.memberLabel}>
                    ¿Eres miembro registrado del Capítulo Nacional de Juventud
                    del WFF en Perú?
                  </span>

                  <div className={styles.memberOptions}>
                    <button
                      type="button"
                      className={
                        form.is_chapter_member === true
                          ? styles.memberOptionActive
                          : ""
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          is_chapter_member: true,
                        })
                      }
                    >
                      Sí, soy miembro
                    </button>

                    <button
                      type="button"
                      className={
                        form.is_chapter_member === false
                          ? styles.memberOptionActive
                          : ""
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          is_chapter_member: false,
                        })
                      }
                    >
                      No soy miembro
                    </button>
                  </div>

                  <small>
                    Esta información será visible únicamente para el equipo
                    revisor.
                  </small>
                </div>


                <div className={styles.photoField}>
                  <label>
                    Fotografía del autor
                  </label>

                  <p className={styles.photoHelp}>
                    Usa una foto cuadrada donde tu rostro se vea claramente.
                    Formatos JPG, PNG o WebP, máximo 640 × 640 px.
                  </p>

                  <div className={styles.photoRow}>
                    <label className={styles.uploadButton}>
                      {uploading
                        ? "Subiendo…"
                        : "Seleccionar imagen"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploading}
                        onChange={(event) => {
                          const file =
                            event.target.files?.[0];

                          if (file) {
                            void uploadPhoto(file);
                          }
                        }}
                      />
                    </label>

                    <span>
                      {form.author_photo
                        ? "Imagen lista · validada"
                        : "Cuadrada · rostro visible · máx. 640 × 640 px"}
                    </span>
                  </div>

                  {form.author_photo && (
                    <img
                      className={styles.photoPreview}
                      src={mediaUrl(form.author_photo)}
                      alt="Vista previa del autor"
                    />
                  )}
                </div>
              </section>


              <section className={styles.card}>
                <div className={styles.sectionHeading}>
                  <span>03</span>

                  <div>
                    <h2>Tu artículo</h2>

                    <p>
                      Puedes usar HTML sencillo para negritas, listas,
                      subtítulos y enlaces.
                    </p>
                  </div>
                </div>


                <Field
                  label="Título"
                  value={form.title}
                  onChange={(title) =>
                    setForm({
                      ...form,
                      title,
                    })
                  }
                />

                <Field
                  label="Breve descripción"
                  value={form.subtitle}
                  onChange={(subtitle) =>
                    setForm({
                      ...form,
                      subtitle,
                    })
                  }
                />


                <div className={styles.field}>
                  <label>
                    Contenido
                  </label>

                  <textarea
                    rows={18}
                    value={form.body}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        body: event.target.value,
                      })
                    }
                    placeholder="Escribe aquí tu artículo…"
                  />
                </div>


                <HtmlPreview value={form.body} />
              </section>


              <section className={styles.rulesConfirmation}>
                <label className={styles.rulesAcceptance}>
                  <input
                    type="checkbox"
                    checked={acceptedRules}
                    onChange={(event) =>
                      setAcceptedRules(event.target.checked)
                    }
                  />

                  <span>
                    He leído y acepto las reglas de publicación de Voces.
                  </span>
                </label>
              </section>


              <div className={styles.submitRow}>
                <p>
                  Al enviar, el contenido quedará pendiente de revisión y no
                  será publicado automáticamente.
                </p>

                <button
                  type="submit"
                  disabled={!canSend || sending || uploading}
                >
                  {sending
                    ? "Enviando…"
                    : "Enviar artículo"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <ScrollTopButton />
    </>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label}
      </label>

      <input
        required
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}


function readImageDimensions(
  file: File,
): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const url =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {
      const result = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      URL.revokeObjectURL(url);

      resolve(result);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);

      reject(
        new Error(
          "No se pudo leer la imagen seleccionada.",
        ),
      );
    };

    image.src = url;
  });
}