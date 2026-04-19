import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
import RelacionamientoGestion from "../components/RelacionamientoGestion";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área de Soporte"
        title="Relacionamiento y Gestión de Recursos"
        subtitle="Piero Contreras y GianMarco Quintanilla"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      <RelacionamientoGestion />

      {/* <Footer /> */}

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
