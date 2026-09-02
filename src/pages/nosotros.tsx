import type { FC } from "react";
import { Header } from "../components/Header";
import QuienesSomosSection from "../components/QuienesSomosSection";
import SplitHeroSection from "../components/SplitHeroSection";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { EstructuraSection } from "../components/EstructuraSection";
import { useLanguage } from "../i18n/LanguageContext";

export const Inicio: FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Header
        variant="static"
        title={t("about.heroTitle")}
        subtitle={t("about.heroSubtitle")}
        backgroundImage="/img/mesacomite.webp"
        backgroundAlign="center"
      />
      <QuienesSomosSection />
      <hr />
      <SplitHeroSection title={t("about.structureModel")} />
      <EstructuraSection />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
