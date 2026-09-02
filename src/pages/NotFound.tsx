import { Link } from "react-router-dom";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

const BACK_HOME: Record<Language, string> = {
  es: "Volver al inicio",
  en: "Back to home",
  it: "Torna alla home",
  pt: "Voltar ao início",
};

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
        background: "linear-gradient(to bottom, #fff, #f4f4f4)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "1100px", width: "100%" }}>
        <picture style={{ display: "flex", flexDirection: "column", alignContent: "center", alignItems: "center" }}>
          <source media="(max-width: 968px)" srcSet="/img/404mobile.png" />
          <img
            src="/img/404desktop.png"
            alt="404 WFF Perú"
            style={{ width: "80%", height: "auto", marginBottom: "1.5rem" }}
          />
        </picture>

        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "0.9rem 2rem",
            backgroundColor: "rgb(255, 127, 23)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "40px",
            fontWeight: 700,
            transition: "0.3s ease",
            boxShadow: "0 10px 25px rgba(255,127,23,0.35)",
          }}
        >
          {BACK_HOME[language]}
        </Link>
      </div>
    </div>
  );
}
