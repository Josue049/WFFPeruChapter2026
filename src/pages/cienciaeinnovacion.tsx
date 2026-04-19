import React from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { ScrollTopButton } from "../components/ScrollTopButton";
// import ContentSelector from "../components/ContentSelector";
import { TemasCienciaInnovacion } from "../components/TemasCienciaInnovacion";
import { ProyectoSection } from "../components/ProyectosSection";
import { ClubProyectosSection } from "../components/ClubProyectoSection";

export const Inicio: React.FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="Área Estratégica"
        title="CIENCIA E INNOVACIÓN"
        subtitle="Isabella Chancahuana y Josué Gutiérrez"
        backgroundImage="/img/FondoFAO4.webp"
        backgroundAlign="top"
      />

      <TemasCienciaInnovacion
        temas={[
          { texto: "Producción sostenible", color: "Azul" },
          { texto: "Inclusión social, género y equidad", color: "Amarillo" },
          { texto: "Seguridad alimentaria y nutrición", color: "Rosa" },
          { texto: "Transformación digital y ciencia", color: "Verde" },
          { texto: "Comercialización y economía rural", color: "Azul" },
          { texto: "Ambiente y cambio climático", color: "Verde" },
          { texto: "Recursos hídricos y agua segura", color: "Azul" },
          { texto: "Gobernanza y políticas públicas", color: "Amarillo" },
          { texto: "Cultura alimentaria y educación", color: "Rosa" },
          { texto: "Pérdidas y desperdicios de alimentos", color: "Verde" },
        ]}
      />

      <ProyectoSection imageSrc="/img/agricultura.webp" />

      <ClubProyectosSection imageSrc="/img/conferencia.webp" />

      {/* <ContentSelector /> */}

      {/* <Footer /> */}

      <ScrollTopButton />
    </>
  );
};

export default Inicio;
