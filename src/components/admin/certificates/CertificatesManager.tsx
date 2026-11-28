import { useCallback, useEffect, useMemo, useState } from "react";
import { certificatesApi } from "../../../services/certificates";
import type { CertificateDetail, CertificateOptions, CertificateSummary } from "../../../types/certificates";
import forms from "../AdminForms.module.css";
import { BulkIssue } from "./BulkIssue";
import styles from "./Certificates.module.css";
import { IssueForm } from "./IssueForm";
import type { Correction } from "./IssueForm";
import { IssuedList } from "./IssuedList";
import { VerifyPanel } from "./VerifyPanel";

type Tab = "generate" | "issued" | "verify";
type Mode = "single" | "bulk";

export default function CertificatesManager({ token }: { token: string }) {
  const api = useMemo(() => certificatesApi(token), [token]);
  const [tab, setTab] = useState<Tab>("generate");
  const [mode, setMode] = useState<Mode>("single");
  const [options, setOptions] = useState<CertificateOptions | null>(null);
  const [summary, setSummary] = useState<CertificateSummary | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [verifyQuery, setVerifyQuery] = useState({ text: "", key: 0 });
  const [correction, setCorrection] = useState<{ value: Correction | null; key: number }>({ value: null, key: 0 });
  // La generación masiva se mantiene montada una vez abierta para no perder la lista.
  const [bulkOpened, setBulkOpened] = useState(false);

  useEffect(() => {
    api.options().then(setOptions).catch((e: Error) => setError(e.message));
  }, [api]);

  useEffect(() => {
    api.summary().then(setSummary).catch((e: Error) => setError(e.message));
  }, [api, version]);

  const changed = useCallback(() => setVersion((n) => n + 1), []);

  const openGenerator = (next: Mode) => {
    setTab("generate");
    setMode(next);
    if (next === "bulk") setBulkOpened(true);
  };

  const correct = (certificate: CertificateDetail) => {
    setCorrection((current) => ({ value: { certificate }, key: current.key + 1 }));
    openGenerator("single");
  };

  const verify = (code: string) => {
    setVerifyQuery((current) => ({ text: code, key: current.key + 1 }));
    setTab("verify");
  };

  const tabs: [Tab, string][] = [
    ["generate", "Generar certificados"],
    ["issued", "Certificados emitidos"],
    ["verify", "Verificar certificados"],
  ];

  return (
    <div className={styles.root}>
      <div className={styles.stats}>
        <div><span>Emitidos</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Vigentes</span><strong>{summary?.valid ?? "—"}</strong></div>
        <div><span>Revocados</span><strong>{summary?.revoked ?? "—"}</strong></div>
      </div>

      <div className={`${forms.managerTabs} ${styles.tabs}`} role="tablist" aria-label="Certificados">
        {tabs.map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? forms.managerTabActive : ""} onClick={() => setTab(value)}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {!options && !error && <p className={styles.hint} role="status">Cargando módulo…</p>}

      {options && (
        <>
          <div hidden={tab !== "generate"}>
            <div className={styles.modes}>
              <button type="button" aria-pressed={mode === "single"} onClick={() => openGenerator("single")}>Generación individual</button>
              <button type="button" aria-pressed={mode === "bulk"} onClick={() => openGenerator("bulk")}>Generación masiva</button>
            </div>
            <div hidden={mode !== "single"}>
              <IssueForm
                key={correction.key}
                api={api}
                options={options}
                correction={correction.value}
                onCancelCorrection={() => setCorrection((current) => ({ value: null, key: current.key + 1 }))}
                onIssued={changed}
              />
            </div>
            {bulkOpened && (
              <div hidden={mode !== "bulk"}>
                <BulkIssue api={api} options={options} onIssued={changed} />
              </div>
            )}
          </div>
          {tab === "issued" && (
            <IssuedList api={api} options={options} version={version} onChanged={changed} onVerify={verify} onCorrect={correct} />
          )}
          {tab === "verify" && <VerifyPanel key={verifyQuery.key} api={api} initialQuery={verifyQuery.text} />}
        </>
      )}
    </div>
  );
}
