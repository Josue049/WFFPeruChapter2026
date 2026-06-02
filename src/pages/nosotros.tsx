import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import QuienesSomosSection from "../components/QuienesSomosSection";
import SplitHeroSection from "../components/SplitHeroSection";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { EstructuraSection } from "../components/EstructuraSection";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        title="CONOCE AL CAPÍTULO NACIONAL 2026"
        subtitle="Nosotros y nuestra estructura interna"
        backgroundImage="/img/mesacomite.webp"
        backgroundAlign="center"
      />

      <QuienesSomosSection />

      <hr />

      <SplitHeroSection />

      <EstructuraSection />

      {/* <Footer /> */}

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
