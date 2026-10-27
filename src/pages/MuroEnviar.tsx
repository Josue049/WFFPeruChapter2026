import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { useLanguage } from "../i18n/LanguageContext";
import { ApiError, apiRequest } from "../services/api";
import type { MuroCategory } from "../types/muro";
import styles from "./Muro.module.css";

const MIN_BODY = 80;
const MAX_BODY = 6000;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s.]{2,}$/;

interface Created {
  id: number;
  status: string;
  manage_token: string;
}

type Errors = Partial<Record<"name" | "email" | "title" | "category" | "body" | "terms" | "images", string>>;

export default function MuroEnviar() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<MuroCategory[]>([]);
  const [formToken, setFormToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [body, setBody] = useState("");
  const [terms, setTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const loadToken = () =>
    apiRequest<{ token: string }>("/muro/form-token")
      .then((data) => setFormToken(data.token))
      .catch(() => setServerError(t("muro.error")));

  useEffect(() => {
    apiRequest<MuroCategory[]>("/muro/categories").then(setCategories).catch(() => setServerError(t("muro.error")));
    void loadToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    let problem = "";
    for (const file of Array.from(list)) {
      if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) problem = t("muro.form.invalidImage");
      else if (next.length < MAX_IMAGES) next.push(file);
    }
    setFiles(next);
    setErrors((current) => ({ ...current, images: problem || undefined }));
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (name.trim().length < 2) found.name = t("muro.form.required");
    if (!EMAIL_RE.test(email.trim())) found.email = t("muro.form.emailInvalid");
    if (title.trim().length < 5) found.title = t("muro.form.tooShort", { min: 5 });
    if (!categoryId) found.category = t("muro.form.required");
    if (body.trim().length < MIN_BODY) found.body = t("muro.form.tooShort", { min: MIN_BODY });
    if (!terms) found.terms = t("muro.form.termsRequired");
    return found;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setServerError(t("muro.form.fixErrors"));
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.append(
        "metadata",
        JSON.stringify({
          author_name: name.trim(),
          author_email: email.trim(),
          title: title.trim(),
          category_id: Number(categoryId),
          body: body.trim(),
          accept_terms: terms,
          form_token: formToken,
          website,
        }),
      );
      files.forEach((file) => data.append("images", file));
      const result = await apiRequest<Created>("/muro/submissions", { method: "POST", body: data });
      setCreated(result);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("muro.error"));
      void loadToken();
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCreated(null);
    setName("");
    setEmail("");
    setTitle("");
    setCategoryId("");
    setBody("");
    setTerms(false);
    setFiles([]);
    setErrors({});
    void loadToken();
  };

  const privateLink = created ? `${window.location.origin}/muro/mi-reflexion/${created.manage_token}` : "";
  const field = (key: keyof Errors) => (errors[key] ? styles.invalid : "");

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <header className={styles.hero} style={{ paddingBottom: 80 }}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>Muro</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}>{t("muro.form.title")}</h1>
            <p>{t("muro.form.intro")}</p>
          </div>
        </header>

        <div className={styles.formShell}>
          {created ? (
            <div role="status">
              <h2 style={{ fontFamily: "Georgia, serif", color: "#174f3f" }}>{t("muro.success.title")}</h2>
              <p>{t("muro.success.text")}</p>
              <p><strong>{t("muro.success.privateLink")}</strong></p>
              <div className={styles.linkBox}>{privateLink}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link to="/muro" className={styles.primary}>{t("muro.back")}</Link>
                <button type="button" className={styles.ghost} onClick={reset}>{t("muro.success.another")}</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {serverError && <div className={styles.error} role="alert">{serverError}</div>}
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${field("name")}`}>
                  <label htmlFor="mu-name">{t("muro.form.name")}</label>
                  <input id="mu-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" aria-invalid={Boolean(errors.name)} />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>
                <div className={`${styles.field} ${field("email")}`}>
                  <label htmlFor="mu-email">{t("muro.form.email")}</label>
                  <input id="mu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={320} autoComplete="email" aria-invalid={Boolean(errors.email)} />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>
                <div className={`${styles.field} ${field("title")}`}>
                  <label htmlFor="mu-title">{t("muro.form.titleField")}</label>
                  <input id="mu-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} aria-invalid={Boolean(errors.title)} />
                  {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
                </div>
                <div className={`${styles.field} ${field("category")}`}>
                  <label htmlFor="mu-category">{t("muro.form.category")}</label>
                  <select id="mu-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-invalid={Boolean(errors.category)}>
                    <option value="">{t("muro.form.choose")}</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
                </div>
                <div className={`${styles.field} ${styles.fieldFull} ${field("body")}`}>
                  <label htmlFor="mu-body">{t("muro.form.body")}</label>
                  <textarea id="mu-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={MAX_BODY} aria-invalid={Boolean(errors.body)} />
                  <span className={`${styles.hint} ${styles.counter}`}>{t("muro.form.counter", { count: body.length, max: MAX_BODY, min: MIN_BODY })}</span>
                  {errors.body && <span className={styles.fieldError}>{errors.body}</span>}
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="mu-images">{t("muro.form.images", { max: MAX_IMAGES })}</label>
                  <input id="mu-images" type="file" accept={IMAGE_TYPES.join(",")} multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} disabled={files.length >= MAX_IMAGES} />
                  {errors.images && <span className={styles.fieldError}>{errors.images}</span>}
                  {previews.length > 0 && (
                    <div className={styles.previews}>
                      {previews.map((url, index) => (
                        <div key={url} className={styles.preview}>
                          <img src={url} alt="" />
                          <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))}>{t("muro.form.remove")}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Campo trampa para bots: las personas no lo ven ni lo rellenan. */}
                <div className={styles.honeypot} aria-hidden="true">
                  <label htmlFor="mu-website">Website</label>
                  <input id="mu-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>
              <label className={styles.check}>
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                <span>{t("muro.form.terms")}</span>
              </label>
              {errors.terms && <p className={styles.fieldError}>{errors.terms}</p>}
              <button type="submit" className={styles.primary} disabled={busy || !formToken}>
                {busy ? t("muro.form.sending") : t("muro.form.submit")}
              </button>
            </form>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}
