import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { PlanAccionSection } from "../components/PlanAccionSection";
import NuestroCompromiso from "../components/NuestroCompromiso";
import VisibilidadHitos from "../components/VisibilidadHitos";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Copy = {
  title: string;
  subtitle: string;
  planTitle: string;
  blocks: Array<{ title: string; items: string[]; allies: string }>;
};

const COPY: Record<Language, Copy> = {
  es: {
    title: "Empoderamiento de las mujeres jóvenes",
    subtitle: "Puntos focales: Kristel Leiva y Ana Paula Guillen",
    planTitle: "Nuestro Plan de acción 2025-2026",
    blocks: [
      {
        title: "Empoderamiento económico",
        items: [
          'Programa "Mujeres Rurales Innovan" – Mentorías en liderazgo y agroemprendimiento',
          "Talleres de agricultura digital y cambio climático",
          "Capacitación en alfabetización financiera y microcréditos",
        ],
        allies: "FAO Perú, MIDAGRI Joven, COFIDE, universidades agrarias",
      },
      {
        title: "Educación transformadora",
        items: [
          "Plataforma Educativa Juvenil: Blog y pódcast trilingüe (español/quechua/aymara)",
          "Historias inspiradoras de jóvenes rurales",
          "Recursos técnicos accesibles",
        ],
        allies: "WFF, FAO LAC",
      },
    ],
  },
  en: {
    title: "Young Women's Empowerment",
    subtitle: "Focal points: Kristel Leiva and Ana Paula Guillen",
    planTitle: "Our 2025-2026 Action Plan",
    blocks: [
      {
        title: "Economic empowerment",
        items: [
          '"Rural Women Innovate" program – Mentoring in leadership and agripreneurship',
          "Digital agriculture and climate change workshops",
          "Financial literacy and microcredit training",
        ],
        allies: "FAO Peru, MIDAGRI Joven, COFIDE, agricultural universities",
      },
      {
        title: "Transformative education",
        items: [
          "Youth Education Platform: trilingual blog and podcast (Spanish/Quechua/Aymara)",
          "Inspiring stories from rural youth",
          "Accessible technical resources",
        ],
        allies: "WFF, FAO LAC",
      },
    ],
  },
  it: {
    title: "Empowerment delle giovani donne",
    subtitle: "Punti focali: Kristel Leiva e Ana Paula Guillen",
    planTitle: "Il nostro Piano d'azione 2025-2026",
    blocks: [
      {
        title: "Empowerment economico",
        items: [
          'Programma "Le donne rurali innovano" – Mentoring su leadership e imprenditoria agricola',
          "Workshop su agricoltura digitale e cambiamento climatico",
          "Formazione su alfabetizzazione finanziaria e microcredito",
        ],
        allies: "FAO Perù, MIDAGRI Joven, COFIDE, università agrarie",
      },
      {
        title: "Educazione trasformativa",
        items: [
          "Piattaforma educativa giovanile: blog e podcast trilingue (spagnolo/quechua/aymara)",
          "Storie ispiratrici di giovani rurali",
          "Risorse tecniche accessibili",
        ],
        allies: "WFF, FAO LAC",
      },
    ],
  },
  pt: {
    title: "Empoderamento das mulheres jovens",
    subtitle: "Pontos focais: Kristel Leiva e Ana Paula Guillen",
    planTitle: "Nosso Plano de Ação 2025-2026",
    blocks: [
      {
        title: "Empoderamento econômico",
        items: [
          'Programa "Mulheres Rurais Inovam" – Mentorias em liderança e agroempreendedorismo',
          "Oficinas de agricultura digital e mudanças climáticas",
          "Capacitação em educação financeira e microcrédito",
        ],
        allies: "FAO Peru, MIDAGRI Joven, COFIDE, universidades agrárias",
      },
      {
        title: "Educação transformadora",
        items: [
          "Plataforma Educativa Juvenil: blog e podcast trilíngue (espanhol/quéchua/aimará)",
          "Histórias inspiradoras de jovens rurais",
          "Recursos técnicos acessíveis",
        ],
        allies: "WFF, FAO LAC",
      },
    ],
  },
};

export const empoderamientoFemenino: FC = () => {
  const { t, language } = useLanguage();
  const copy = COPY[language];

  return (
    <>
      <Header
        variant="static"
        label={t("area.crosscutting")}
        title={copy.title}
        subtitle={copy.subtitle}
        backgroundImage="/img/womenIlustration.webp"
        backgroundAlign="center"
      />

      <NuestroCompromiso />
      <PlanAccionSection title={copy.planTitle} blocks={copy.blocks} />
      <VisibilidadHitos />
      <ScrollTopButton />
    </>
  );
};

export default empoderamientoFemenino;
