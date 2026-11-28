import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { API_BASE_URL } from "../config/api";
import { ApiError, apiBlob, apiRequest } from "../services/api";
import { usePageMeta } from "../seo/pageMeta";
import type { PublicCertificate } from "../types/certificates";
import { TYPE_NAMES, copyText, extractCode, formatDateTime, formatDay } from "../utils/certificates";
import styles from "./Certificados.module.css";

type Lookup =
  | { code: string; state: "found"; certificate: PublicCertificate }
  | { code: string; state: "missing" }
  | { code: string; state: "error"; message: string };

const ICONS = {
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <path d="M12 6v7.5M12 17.8v.2" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  download: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
  external: <path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
};

function Icon({ name, size = 20 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function SearchForm({ onSearch }: { onSearch: (code: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const code = extractCode(value);
    if (!code) {
      setError("Revisa el código: tiene el formato WFF-AAAA- seguido de 12 caracteres.");
      return;
    }
    setError("");
    onSearch(code);
  };

  return (
    <form className={styles.search} onSubmit={submit}>
      <label htmlFor="certificate-code">Código del certificado</label>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}><Icon name="search" /></span>
        <input
          id="certificate-code"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="WFF-2026-XXXXXXXXXXXX"
          maxLength={600}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby={error ? "certificate-code-error" : undefined}
        />
        <button type="submit">Validar</button>
      </div>
      {error && <p id="certificate-code-error" className={styles.formError} role="alert">{error}</p>}
    </form>
  );
}

/** Certificado original emitido (sin marcas de vista previa), a la vista y descargable. */
function Document({ code }: { code: string }) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const path = `/certificates/verify/${encodeURIComponent(code)}`;
  const pdf = `${API_BASE_URL}${path}/pdf`;

  useEffect(() => {
    const controller = new AbortController();
    let url = "";
    apiBlob(`${path}/preview`, { signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setImage(url);
        setError("");
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof ApiError ? e.message : "No se pudo mostrar el certificado");
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
      setImage("");
    };
  }, [path]);

  return (
    <section className={styles.document} aria-label="Certificado original">
      {image ? (
        <a className={styles.sheet} href={pdf} target="_blank" rel="noreferrer" title="Abrir en tamaño completo">
          <img src={image} alt={`Certificado original ${code}`} />
        </a>
      ) : (
        <p className={styles.sheetStatus} role="status">{error || "Cargando certificado…"}</p>
      )}
      <div className={styles.actions}>
        <a className={styles.primary} href={`${pdf}?download=true`}><Icon name="download" /> Descargar PDF</a>
        <a className={styles.secondary} href={pdf} target="_blank" rel="noreferrer"><Icon name="external" /> Abrir PDF</a>
      </div>
    </section>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className={styles.codeBox}>
      <div>
        <span>Código único</span>
        <strong>{code}</strong>
      </div>
      <button type="button" onClick={() => void copyText(code).then(setCopied)} aria-label="Copiar código">
        <Icon name={copied ? "check" : "copy"} size={18} />
        <span aria-live="polite">{copied ? "Copiado" : "Copiar"}</span>
      </button>
    </div>
  );
}

function Result({ certificate }: { certificate: PublicCertificate }) {
  const valid = certificate.status === "valid";
  const type = certificate.certificate_type === "custom" ? certificate.type_label : TYPE_NAMES[certificate.certificate_type];
  const facts: [string, string][] = [
    ["Tipo de certificado", type],
    ["Fecha", formatDay(certificate.certificate_date)],
    ...(certificate.show_duration ? [[certificate.duration_label, certificate.duration_value] as [string, string]] : []),
    ["Fecha de emisión", formatDateTime(certificate.issued_at)],
    ["Estado", valid ? "Vigente" : "No vigente (revocado)"],
  ];

  return (
    <article className={`${styles.result} ${valid ? styles.valid : styles.revoked}`}>
      <header className={styles.verdict}>
        <span className={styles.seal} aria-hidden="true"><Icon name={valid ? "check" : "alert"} size={30} /></span>
        <div>
          <h2>{valid ? "Certificado verificado" : "Certificado revocado"}</h2>
          <p>
            {valid
              ? "Este certificado fue emitido oficialmente por WFF Perú Chapter y se encuentra vigente."
              : "Este certificado existe en nuestros registros, pero ya no se encuentra vigente."}
          </p>
        </div>
      </header>

      <div className={`${styles.body} ${certificate.document_available ? styles.withDocument : ""}`}>
        <div className={styles.holder}>
          <span>Otorgado a</span>
          <h3>{certificate.recipient_name}</h3>
          <span>Curso o actividad</span>
          <p>{certificate.activity_name}</p>
        </div>

        {certificate.document_available && <Document key={certificate.code} code={certificate.code} />}

        <div className={styles.facts}>
          <dl>
            {facts.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <CopyCode code={certificate.code} />
          <p className={styles.compare}>Comprueba que estos datos coincidan con los del certificado que te presentaron.</p>
        </div>
      </div>
    </article>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.notice}>
      <span className={styles.noticeIcon} aria-hidden="true"><Icon name="search" size={30} /></span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

const STEPS: [string, string][] = [
  ["Escanea o escribe", "Usa el código QR del certificado o escribe el código impreso encima de él."],
  ["Consultamos el registro", "Revisamos en ese momento si fue emitido por el capítulo y si sigue vigente."],
  ["Compara los datos", "El nombre, la actividad y la fecha deben coincidir con el documento presentado."],
];

/** Consulta y validación pública de certificados (también destino del código QR). */
export default function Certificados() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const code = codigo?.trim().toUpperCase() ?? "";
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [attempt, setAttempt] = useState(0);

  usePageMeta(code ? {
    title: "Validación de certificado | WFF Perú Chapter",
    description: "Verifica la autenticidad de un certificado emitido por WFF Perú Chapter.",
    path: `/certificados/validar/${encodeURIComponent(code)}`,
  } : null);

  // Las páginas con datos de una persona no deben aparecer en buscadores.
  useEffect(() => {
    if (!code) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [code]);

  // El estado se consulta siempre en el servidor: no se guarda en caché ni se deduce del código.
  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();
    apiRequest<PublicCertificate>(`/certificates/verify/${encodeURIComponent(code)}`, { signal: controller.signal, cache: "no-store" })
      .then((certificate) => setLookup({ code, state: "found", certificate }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 404) setLookup({ code, state: "missing" });
        else setLookup({ code, state: "error", message: error instanceof ApiError ? error.message : "No pudimos consultar el certificado. Revisa tu conexión." });
      });
    return () => controller.abort();
  }, [code, attempt]);

  const current = lookup?.code === code ? lookup : null;
  const search = (next: string) => {
    if (next === code) {
      setLookup(null);
      setAttempt((n) => n + 1);
    } else {
      navigate(`/certificados/validar/${next}`);
    }
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <header className={`${styles.wrap} ${styles.masthead}`}>
          <p className={styles.kicker}>{code ? "Consulta oficial" : "Verifica la autenticidad"}</p>
          <h1>{code ? "Validación de Certificado" : "Certificados"}</h1>
        </header>

        <div className={`${styles.wrap} ${styles.content}`}>
          {!code && (
            <>
              <div className={styles.panel}>
                <SearchForm onSearch={search} />
              </div>
              <ol className={styles.steps}>
                {STEPS.map(([title, text], index) => (
                  <li key={title}>
                    <span aria-hidden="true">{index + 1}</span>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </>
          )}

          {code && (
            <>
              <div aria-live="polite">
                {!current && (
                  <div className={styles.notice} role="status">
                    <span className={styles.spinner} aria-hidden="true" />
                    <p>Consultando el registro…</p>
                  </div>
                )}
                {current?.state === "found" && <Result certificate={current.certificate} />}
                {current?.state === "missing" && (
                  <Notice title="Certificado no encontrado">
                    <p>No existe un certificado registrado con el código <strong>{code}</strong>.</p>
                    <p>Verifica que lo hayas escrito completo e inténtalo con otro código.</p>
                  </Notice>
                )}
                {current?.state === "error" && (
                  <Notice title="No se pudo completar la consulta">
                    <p>{current.message}</p>
                    <button type="button" className={styles.primary} onClick={() => search(code)}>Reintentar</button>
                  </Notice>
                )}
              </div>

              <div className={`${styles.panel} ${styles.again}`}>
                <h2>Consultar otro certificado</h2>
                <SearchForm key={code} onSearch={search} />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
