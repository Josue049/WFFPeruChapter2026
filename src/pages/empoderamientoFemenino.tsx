import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { PlanAccionSection } from "../components/PlanAccionSection";
import NuestroCompromiso from "../components/NuestroCompromiso";
import VisibilidadHitos from "../components/VisibilidadHitos";

export const empoderamientoFemenino: FC = () => {
  return (
    <>
      <Header
        variant="static"
        label="EJE TRANSVERSAL"
        title="Empoderamiento de las mujeres Jóvenes"
        subtitle="Puntos focales: Kristel Leiva y Ana Paula Guillen"
        backgroundImage="/img/womenIlustration.webp"
        backgroundAlign="center"
      />

      <NuestroCompromiso />

      <PlanAccionSection
        title="Nuestro Plan de acción 2025-2026"
        blocks={[
          {
            title: "Empoderamiento económico",
            items: [
              'Programa "Mujeres Rurales Innovan" – Mentorías en liderazgo y agroemprendimiento',
              "Talleres de agricultura digital y cambio climático",
              "Capacitación en alfabetización financiera y microcréditos",
            ],
            allies: "FAO Perú, MIDAGRI Joven, COFIDE, universidades agrarias",
          },
          {
            title: "Educación transformadora",
            items: [
              "Plataforma Educativa Juvenil: Blog y pódcast trilingüe (español/quechua/aymara)",
              "Historias inspiradoras de jóvenes rurales",
              "Recursos técnicos accesibles",
            ],
            allies: "WFF, FAO LAC",
          },
        ]}
      />

      <VisibilidadHitos />


      <ScrollTopButton />
    </>
  );
};

export default empoderamientoFemenino;
