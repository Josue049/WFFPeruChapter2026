import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import Informacion from "../components/Informacion";
import LoQueHacemos from "../components/LoQueHacemosComu";
import { useLanguage } from "../i18n/LanguageContext";

export const Inicio: FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Header
        variant="static"
        label={t("area.support")}
        title={t("nav.communications")}
        subtitle="Olga Lopez y María Paz Ferrand"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      <Informacion />
      <LoQueHacemos />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
