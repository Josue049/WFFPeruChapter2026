import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
import Informacion from "../components/Informacion";
import LoQueHacemos from "../components/LoQueHacemosComu";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área de Soporte"
        title="Gestión de las Comunicaciones"
        subtitle="Olga Lopez y María Paz Ferrand"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      
      <Informacion />
      <LoQueHacemos />

      {/* <Footer /> */}

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
