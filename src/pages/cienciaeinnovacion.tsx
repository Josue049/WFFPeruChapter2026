import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { TemasCienciaInnovacion } from "../components/TemasCienciaInnovacion";
import { ProyectoSection } from "../components/ProyectosSection";
import { ClubProyectosSection } from "../components/ClubProyectoSection";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const TOPICS: Record<Language, string[]> = {
  es: ["Producción sostenible", "Inclusión social, género y equidad", "Seguridad alimentaria y nutrición", "Transformación digital y ciencia", "Comercialización y economía rural", "Ambiente y cambio climático", "Recursos hídricos y agua segura", "Gobernanza y políticas públicas", "Cultura alimentaria y educación", "Pérdidas y desperdicios de alimentos"],
  en: ["Sustainable production", "Social inclusion, gender and equity", "Food security and nutrition", "Digital transformation and science", "Marketing and rural economy", "Environment and climate change", "Water resources and safe water", "Governance and public policy", "Food culture and education", "Food loss and waste"],
  it: ["Produzione sostenibile", "Inclusione sociale, genere ed equità", "Sicurezza alimentare e nutrizione", "Trasformazione digitale e scienza", "Commercializzazione ed economia rurale", "Ambiente e cambiamento climatico", "Risorse idriche e acqua sicura", "Governance e politiche pubbliche", "Cultura alimentare ed educazione", "Perdite e sprechi alimentari"],
  pt: ["Produção sustentável", "Inclusão social, gênero e equidade", "Segurança alimentar e nutrição", "Transformação digital e ciência", "Comercialização e economia rural", "Meio ambiente e mudanças climáticas", "Recursos hídricos e água segura", "Governança e políticas públicas", "Cultura alimentar e educação", "Perdas e desperdício de alimentos"],
};

const COLORS = ["Azul", "Amarillo", "Rosa", "Verde", "Azul", "Verde", "Azul", "Amarillo", "Rosa", "Verde"] as const;

export const Inicio: FC = () => {
  const { t, language } = useLanguage();
  const temas = TOPICS[language].map((texto, index) => ({ texto, color: COLORS[index] }));

  return (
    <>
      <Header
        variant="static"
        label={t("area.strategic")}
        title={t("nav.science").toUpperCase()}
        subtitle="Isabella Chancahuana y Josué Gutiérrez"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />
      <TemasCienciaInnovacion temas={temas} />
      <ProyectoSection imageSrc="/img/agricultura.webp" />
      <ClubProyectosSection imageSrc="/img/conferencia.webp" />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
