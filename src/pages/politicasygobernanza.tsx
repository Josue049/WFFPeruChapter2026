import type { FC } from "react";
import { Header } from "../components/Header";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { QueHacemos } from "../components/QueHacemos";
import { PlanAccionSection } from "../components/PlanAccionSection";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const COPY: Record<Language, { info: string; title: string; description: string; tags: string[]; blocks: Array<{ title: string; items: string[] }> }> = {
  es: {
    info: "INFORMACIÓN", title: "¿QUÉ HACEMOS EN POLÍTICAS Y GOBERNANZA?",
    description: "Incorpora activamente a las y los jóvenes en la formulación de políticas públicas y en la creación de espacios de gobernanza agroalimentaria. Facilita la canalización de propuestas, manifiestos y procesos de diálogo que fortalecen la participación juvenil y promueven acciones sostenibles, inclusivas y con enfoque territorial.",
    tags: ["Participación juvenil", "Articulación", "Gobernanza agroalimentaria"],
    blocks: [
      { title: "Diagnóstico Nacional sobre incidencia en políticas públicas dentro de los SS.AA.", items: ["Objetivo: Generar evidencia territorial y voces juveniles", "Producto: Reporte sobre el conocimiento y participación en SA"] },
      { title: "Programa de Formación e Incidencia Juvenil", items: ["Objetivo: Fortalecer competencias para la incidencia y la gobernanza del SA.", "Producto: Programa Formativo Nacional en Gobernanza del SA"] },
      { title: "Agenda Juvenil Descentralizada", items: ["Objetivo: Convertir evidencia + capacidades en propuestas políticas regionales.", "Producto: Agenda Juvenil Descentralizada del Sistema Agroalimentario"] },
    ],
  },
  en: {
    info: "INFORMATION", title: "WHAT DO WE DO IN POLICY AND GOVERNANCE?",
    description: "We actively involve young people in public policy development and in creating spaces for agrifood governance. We channel proposals, manifestos and dialogue processes that strengthen youth participation and promote sustainable, inclusive and territorially grounded action.",
    tags: ["Youth participation", "Coordination", "Agrifood governance"],
    blocks: [
      { title: "National diagnosis of public-policy engagement in agrifood systems", items: ["Objective: Generate territorial evidence and youth voices", "Output: Report on knowledge and participation in agrifood systems"] },
      { title: "Youth Training and Advocacy Program", items: ["Objective: Strengthen skills for advocacy and agrifood-system governance.", "Output: National Training Program on Agrifood-System Governance"] },
      { title: "Decentralized Youth Agenda", items: ["Objective: Turn evidence and capacities into regional policy proposals.", "Output: Decentralized Youth Agenda for the Agrifood System"] },
    ],
  },
  it: {
    info: "INFORMAZIONI", title: "COSA FACCIAMO IN POLITICHE E GOVERNANCE?",
    description: "Coinvolgiamo attivamente i giovani nella formulazione delle politiche pubbliche e nella creazione di spazi di governance agroalimentare. Facilitiamo proposte, manifesti e processi di dialogo che rafforzano la partecipazione giovanile e promuovono azioni sostenibili, inclusive e legate ai territori.",
    tags: ["Partecipazione giovanile", "Coordinamento", "Governance agroalimentare"],
    blocks: [
      { title: "Diagnosi nazionale sull'incidenza nelle politiche pubbliche dei sistemi agroalimentari", items: ["Obiettivo: Generare evidenze territoriali e voci giovanili", "Prodotto: Rapporto su conoscenza e partecipazione nei sistemi agroalimentari"] },
      { title: "Programma di Formazione e Advocacy Giovanile", items: ["Obiettivo: Rafforzare le competenze per l'advocacy e la governance dei sistemi agroalimentari.", "Prodotto: Programma Nazionale di Formazione sulla Governance Agroalimentare"] },
      { title: "Agenda Giovanile Decentralizzata", items: ["Obiettivo: Trasformare evidenze e capacità in proposte politiche regionali.", "Prodotto: Agenda Giovanile Decentralizzata del Sistema Agroalimentare"] },
    ],
  },
  pt: {
    info: "INFORMAÇÃO", title: "O QUE FAZEMOS EM POLÍTICAS E GOVERNANÇA?",
    description: "Envolvemos ativamente os jovens na formulação de políticas públicas e na criação de espaços de governança agroalimentar. Facilitamos propostas, manifestos e processos de diálogo que fortalecem a participação juvenil e promovem ações sustentáveis, inclusivas e com enfoque territorial.",
    tags: ["Participação juvenil", "Articulação", "Governança agroalimentar"],
    blocks: [
      { title: "Diagnóstico nacional sobre incidência em políticas públicas nos sistemas agroalimentares", items: ["Objetivo: Gerar evidências territoriais e vozes juvenis", "Produto: Relatório sobre conhecimento e participação nos sistemas agroalimentares"] },
      { title: "Programa de Formação e Incidência Juvenil", items: ["Objetivo: Fortalecer competências para incidência e governança dos sistemas agroalimentares.", "Produto: Programa Nacional de Formação em Governança Agroalimentar"] },
      { title: "Agenda Juvenil Descentralizada", items: ["Objetivo: Transformar evidências e capacidades em propostas políticas regionais.", "Produto: Agenda Juvenil Descentralizada do Sistema Agroalimentar"] },
    ],
  },
};

export const Inicio: FC = () => {
  const { t, language } = useLanguage();
  const copy = COPY[language];
  const colors = ["Rosa", "Amarillo", "Verde"] as const;

  return (
    <>
      <Header variant="static" label={t("area.strategic")} title={t("nav.policies").toUpperCase()} subtitle="Lizet Mejía y Kristel Leiva" backgroundImage="/img/FondoFAO4.webp" backgroundAlign="top" />
      <QueHacemos titulo={copy.title} linkText={copy.info} descripcion={copy.description} imgSrc="/img/mujeres.webp" bloques={copy.tags.map((texto, index) => ({ texto, color: colors[index] }))} />
      <PlanAccionSection title="" blocks={copy.blocks} />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
