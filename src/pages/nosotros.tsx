import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { EstructuraSection } from "../components/EstructuraSection";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        title="ESTRUCTURA CAPÍTULO NACIONAL 2026"
        subtitle="Conoce nuestra estructura interna"
        backgroundImage="/img/mesacomite.webp"
          backgroundAlign="center"
      />

      <EstructuraSection />

      <Footer />

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
