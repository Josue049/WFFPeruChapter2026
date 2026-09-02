import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import RelacionamientoGestion from "../components/RelacionamientoGestion";
import { useLanguage } from "../i18n/LanguageContext";

export const Inicio: FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Header
        variant="static"
        label={t("area.support")}
        title={t("nav.relations")}
        subtitle="Piero Contreras y GianMarco Quintanilla"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      <RelacionamientoGestion />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
