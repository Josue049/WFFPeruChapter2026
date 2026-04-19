import React from "react";
import { Header } from "../components/Header";
import ImageCardsBlock from "../components/ImageCardsBlock";
import AccordionCards from "../components/AccordionCards";
import type { AccordionItem } from "../components/AccordionCards";
import AreasGrid from "../components/AreasGrid";
import CommiteSection from "../components/ComiteSection";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";

const wffItems: AccordionItem[] = [
  {
    id: 1,
    title: "¿Qué es el WFF?",
    color: "#FFC107",
    content:
      "El Foro Mundial de la Alimentación (WFF) es una plataforma global cuya misión es impulsar la transformación de los sistemas agroalimentarios a través del liderazgo juvenil.",
  },
  {
    id: 2,
    title: "Visión",
    color: "#5A9BD5",
    content:
      "Ser una red juvenil nacional líder capaz de transformar los sistemas agroalimentarios mediante innovación, cooperación y participación inclusiva, conectando a jóvenes de todas las regiones.",
  },
  {
    id: 3,
    title: "Misión",
    color: "#FF8A8A",
    content:
      "Fortalecer al Capítulo Nacional de Juventudes como una red interdisciplinaria y descentralizada, promoviendo alianzas estratégicas y acciones con impacto tangible.",
  },
];

export const Inicio: React.FC = () => {
  return (
    <>
      <Header />

      <ImageCardsBlock
        eyebrow="CONÓCENOS"
        title="¿Qué es un Capítulo Nacional?"
        description="Es una plataforma independiente liderada por juventudes y organizaciones civiles. Su función es movilizar acción local alineada al WFF y en coordinación con FAO."        
        mainImage="/img/BloquesONU.webp"
        cards={[
          { image: "/img/tarjetas1.webp", alt: "Actividad WFF 1" },
          { image: "/img/tarjetas2.webp", alt: "Actividad WFF 2" },
        ]}
      />

      <AccordionCards items={wffItems} />

      <AreasGrid />

      <CommiteSection />
      <Footer />

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
