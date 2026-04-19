import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { QueHacemos } from "../components/QueHacemos";
import { PlanAccionSection } from "../components/PlanAccionSection";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área Estratégica"
        title="POLÍTICAS Y GOBERNANZA"
        subtitle="Lizet Mejía y Kristel Leiva"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      <QueHacemos
        titulo="¿QUÉ HACEMOS EN POLÍTICAS Y GOBERNANZA?"
        linkText="INFORMACIÓN"
        descripcion="Incorpora activamente a las y los jóvenes en la formulación de políticas públicas y en la creación de espacios de gobernanza agroalimentaria. Facilita la canalización de propuestas, manifiestos y procesos de diálogo que fortalecen la participación juvenil y promueven acciones sostenibles, inclusivas y con enfoque territorial."
        imgSrc="/img/mujeres.webp"
        bloques={[
          { texto: "Participación juvenil", color: "Rosa" },
          { texto: "Articulación", color: "Amarillo" },
          { texto: "Gobernanza agroalimentaria", color: "Verde" },
        ]}
      />

      <PlanAccionSection
        title=""
        blocks={[
          {
            title: "Diagnóstico Nacional sobre incidencia en políticas públicas dentro de los SS.AA.",
            items: [
              "Objetivo: Generar evidencia territorial y voces juveniles",
              "Producto: Reporte sobre el conocimiento y participación en SA",
            ],
          },
          {
            title: "Programa de Formación e Incidencia Juvenil",
            items: [
              "Objetivo: Fortalecer competencias para la incidencia y la gobernanza del SA.",
              "Producto: Programa Formativo Nacional en Gobernanza del SA"
            ],
          },
          {
            title: "Agenda Juvenil Descentralizada",
            items: [
              "Objetivo: Convertir evidencia + capacidades en propuestas políticas regionales.",
              "Producto: Agenda Juvenil Descentralizada del Sistema Agroalimentario"
            ],
          },
        ]}
      />

      <Footer />

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
