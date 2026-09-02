import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { Cultura } from "../components/Cultura";
import { Educacion } from "../components/Educacion";
import { Proyectos } from "../components/Proyectos";
import { useLanguage } from "../i18n/LanguageContext";

export const Inicio: FC = () => {
  const { t } = useLanguage();
  return (
    <>
      <Header
        variant="static"
        label={t("area.strategic")}
        title={t("nav.education").toUpperCase()}
        subtitle="Ana Paula Guillen y Ronal Guevara"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />
      <Cultura />
      <Educacion />
      <Proyectos />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
