import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { Cultura } from "../components/Cultura";
import { Educacion } from "../components/Educacion";
import { Proyectos } from "../components/Proyectos";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área Estratégica"
        title="EDUCACIÓN Y CULTURA"
        subtitle="Ana Paula Guillen y Ronal Guevara"
        backgroundImage="/img/FondoFAO4.png"
        backgroundAlign="top"
      />

      <Cultura />
      <Educacion />
      <Proyectos />

      <Footer />

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
