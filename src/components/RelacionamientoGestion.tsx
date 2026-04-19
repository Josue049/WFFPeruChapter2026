// src/components/RelacionamientoGestion.tsx
import React from "react";
import { SectionTextImg } from "../components/SectionTextImg";
import { ReverseSectionTextImg } from "../components/ReverseSectionTextImg";

const RelacionamientoGestion: React.FC = () => {
  return (
    <>
      <SectionTextImg
        imageSrc="/img/Piero-Imagen.webp"
        badge="Una gran responsabilidad"
        title="¿QUE HACEMOS?"
        description="El Área de Relacionamiento y Gestión de Recursos es responsable de fortalecer la sostenibilidad institucional, ampliar el impacto del Capítulo y consolidar alianzas estratégicas que contribuyan a la transformación de los sistemas agroalimentarios desde una mirada juvenil, inclusiva y territorial. Su labor se centra en movilizar recursos financieros, técnicos y estratégicos, así como en articular relaciones de largo plazo con actores clave del sector público, la academia, el sector privado, organizaciones juveniles, sociedad civil y agencias de cooperación internacional, en coherencia con los lineamientos del WFF y la FAO."
      />

      <ReverseSectionTextImg
        imageSrc="/img/GianMarco-Relacionamiento.webp"
        badge="Estrategia y gestión integral"
        title="PRINCIPALES FUNCIONES"
        description="Entre sus principales funciones se encuentran el diseño e implementación de la estrategia de sostenibilidad financiera del Capítulo, la identificación y diversificación de fuentes de financiamiento, y la definición de mecanismos claros y transparentes para el ingreso, gestión y seguimiento de recursos. Asimismo, el área lidera la gestión integral de alianzas, desde la definición de criterios y tipologías, hasta el acompañamiento, monitoreo y sistematización de resultados. El área también cumple un rol clave en el posicionamiento institucional del Capítulo, mediante el desarrollo de portafolios, presentaciones y materiales estratégicos que visibilizan el trabajo, los logros y las oportunidades de colaboración. De manera complementaria, promueve el relacionamiento con otros capítulos del WFF a nivel regional y global, fomentando el intercambio de aprendizajes, la cooperación intercapítulos y el impulso de iniciativas conjuntas."
      />

      
      <SectionTextImg
        imageSrc="/img/relacionamiento.webp"
        badge="Nuestras bases"
        title="IMPACTO Y CONTRIBUCIÓN"
        description= "En conjunto, el Área de Relacionamiento y Gestión de Recursos trabaja para asegurar que el Capítulo cuente con bases sólidas, alianzas estratégicas y recursos sostenibles, que permitan potenciar el liderazgo juvenil y generar impactos duraderos en favor de sistemas agroalimentarios más justos, resilientes y sostenibles."
      />
    </>
  );
};

export default RelacionamientoGestion;
