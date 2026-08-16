import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { Cultura } from "../components/Cultura";
import { Educacion } from "../components/Educacion";
import { Proyectos } from "../components/Proyectos";

export const Inicio: FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área Estratégica"
        title="EDUCACIÓN Y CULTURA"
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
