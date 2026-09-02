import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

type StructureCopy = {
  structure: string;
  strategic: string;
  support: string;
  communications: string;
  relations: string;
  advisory: string;
  advisoryText1: string;
  advisoryText2: string;
  governance: string;
  nationalCommittee: string;
  nationalCommitteeText: string;
  composition: string;
  composition1: string;
  composition2: string;
  leadership: string;
  leadership1: string;
  leadership2: string;
  functions: string;
  functionsList: string[];
};

const COPY: Record<Language, StructureCopy> = {
  es: {
    structure: "ESTRUCTURA",
    strategic: "03 Áreas Estratégicas (Enfoque Táctico):",
    support: "02 Áreas de Soporte (Operacionales):",
    communications: "Gestión de las Comunicaciones: Responsable de la visibilidad, contenidos y vocerías.",
    relations: "Relacionamiento y Gestión de Recursos: Enfocada en alianzas, sostenibilidad y cooperación técnica y financiera.",
    advisory: "Comité Asesor:",
    advisoryText1: "Instancia consultiva que brinda orientación técnica, metodológica y estratégica al Comité de Coordinación Nacional.",
    advisoryText2: "Integrado por entidades clave como la Secretaría Nacional de Juventud (SENAJU) del Ministerio de Educación del Perú y la FAO Perú.",
    governance: "MODELO DE GESTIÓN Y GOBERNANZA",
    nationalCommittee: "Comité de Coordinación Nacional (CCN):",
    nationalCommitteeText: "La instancia de más alto nivel del Capítulo Nacional.",
    composition: "Composición:",
    composition1: "Integrado por un/a Coordinador/a General y los Titulares de las 05 Áreas (3 estratégicas y 2 de soporte).",
    composition2: "Los miembros del Comité fueron instalados oficialmente el 22 de septiembre de 2025.",
    leadership: "Liderazgo por Área:",
    leadership1: "Cada una de las 05 áreas está liderada por un dúo de Titular y Alterno.",
    leadership2: "Esto asegura la continuidad de la gestión y el soporte operativo.",
    functions: "Funciones Clave:",
    functionsList: [
      "Definir la dirección estratégica del Capítulo.",
      "Emitir lineamientos nacionales para su funcionamiento articulado.",
      "Aprobar alianzas clave y rutas de intervención.",
      "Supervisar el desempeño e impacto de las intervenciones.",
    ],
  },
  en: {
    structure: "STRUCTURE",
    strategic: "03 Strategic Areas (Tactical Focus):",
    support: "02 Support Areas (Operational):",
    communications: "Communications Management: Responsible for visibility, content and spokesperson coordination.",
    relations: "Partnerships and Resource Management: Focused on partnerships, sustainability, and technical and financial cooperation.",
    advisory: "Advisory Committee:",
    advisoryText1: "A consultative body providing technical, methodological and strategic guidance to the National Coordination Committee.",
    advisoryText2: "It includes key institutions such as Peru's National Youth Secretariat (SENAJU) and FAO Peru.",
    governance: "MANAGEMENT AND GOVERNANCE MODEL",
    nationalCommittee: "National Coordination Committee (NCC):",
    nationalCommitteeText: "The highest-level body of the National Chapter.",
    composition: "Composition:",
    composition1: "Made up of a General Coordinator and the leads of the five areas (3 strategic and 2 support areas).",
    composition2: "Committee members were officially installed on September 22, 2025.",
    leadership: "Area Leadership:",
    leadership1: "Each of the five areas is led by a Lead and an Alternate representative.",
    leadership2: "This ensures management continuity and operational support.",
    functions: "Key Functions:",
    functionsList: [
      "Define the Chapter's strategic direction.",
      "Issue national guidelines for coordinated operations.",
      "Approve key partnerships and intervention pathways.",
      "Oversee the performance and impact of interventions.",
    ],
  },
  it: {
    structure: "STRUTTURA",
    strategic: "03 Aree Strategiche (Approccio Tattico):",
    support: "02 Aree di Supporto (Operative):",
    communications: "Gestione delle Comunicazioni: responsabile di visibilità, contenuti e portavoce.",
    relations: "Relazioni e Gestione delle Risorse: focalizzata su partnership, sostenibilità e cooperazione tecnica e finanziaria.",
    advisory: "Comitato Consultivo:",
    advisoryText1: "Organo consultivo che fornisce orientamento tecnico, metodologico e strategico al Comitato di Coordinamento Nazionale.",
    advisoryText2: "Comprende enti chiave come la Segreteria Nazionale della Gioventù del Perù (SENAJU) e FAO Perù.",
    governance: "MODELLO DI GESTIONE E GOVERNANCE",
    nationalCommittee: "Comitato di Coordinamento Nazionale (CCN):",
    nationalCommitteeText: "L'organo di massimo livello del Capitolo Nazionale.",
    composition: "Composizione:",
    composition1: "Formato da un Coordinatore Generale e dai responsabili delle cinque aree (3 strategiche e 2 di supporto).",
    composition2: "I membri del Comitato sono stati insediati ufficialmente il 22 settembre 2025.",
    leadership: "Leadership per Area:",
    leadership1: "Ognuna delle cinque aree è guidata da un Responsabile e da un Alterno.",
    leadership2: "Questo garantisce continuità gestionale e supporto operativo.",
    functions: "Funzioni Chiave:",
    functionsList: [
      "Definire la direzione strategica del Capitolo.",
      "Definire linee guida nazionali per un funzionamento coordinato.",
      "Approvare partnership chiave e percorsi di intervento.",
      "Supervisionare prestazioni e impatto degli interventi.",
    ],
  },
  pt: {
    structure: "ESTRUTURA",
    strategic: "03 Áreas Estratégicas (Foco Tático):",
    support: "02 Áreas de Apoio (Operacionais):",
    communications: "Gestão das Comunicações: responsável pela visibilidade, conteúdos e porta-vozes.",
    relations: "Relacionamento e Gestão de Recursos: focada em parcerias, sustentabilidade e cooperação técnica e financeira.",
    advisory: "Comitê Consultivo:",
    advisoryText1: "Instância consultiva que oferece orientação técnica, metodológica e estratégica ao Comitê de Coordenação Nacional.",
    advisoryText2: "Integrado por entidades-chave como a Secretaria Nacional da Juventude do Peru (SENAJU) e a FAO Peru.",
    governance: "MODELO DE GESTÃO E GOVERNANÇA",
    nationalCommittee: "Comitê de Coordenação Nacional (CCN):",
    nationalCommitteeText: "A instância de mais alto nível do Capítulo Nacional.",
    composition: "Composição:",
    composition1: "Integrado por um Coordenador Geral e pelos titulares das cinco áreas (3 estratégicas e 2 de apoio).",
    composition2: "Os membros do Comitê foram oficialmente instalados em 22 de setembro de 2025.",
    leadership: "Liderança por Área:",
    leadership1: "Cada uma das cinco áreas é liderada por um Titular e um Alterno.",
    leadership2: "Isso garante continuidade da gestão e apoio operacional.",
    functions: "Funções Principais:",
    functionsList: [
      "Definir a direção estratégica do Capítulo.",
      "Emitir diretrizes nacionais para seu funcionamento articulado.",
      "Aprovar parcerias-chave e rotas de intervenção.",
      "Supervisionar o desempenho e o impacto das intervenções.",
    ],
  },
};

export function EstructuraSection() {
  const { language, t } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row">
          <div>
            <div className="pb-3">
              <div className="mb-3 clearfix" style={{ padding: 30 }}>
                <div className="marcado Rosa">{copy.structure}</div>
                <ol>
                  <li>
                    <b>{copy.strategic}</b>
                    <ul>
                      <li>{t("nav.science")}</li>
                      <li>{t("nav.education")}</li>
                      <li>{t("nav.policies")}</li>
                    </ul>
                  </li>
                  <li>
                    <b>{copy.support}</b>
                    <ul>
                      <li>{copy.communications}</li>
                      <li>{copy.relations}</li>
                    </ul>
                  </li>
                  <li>
                    <b>{copy.advisory}</b>
                    <ul><li>{copy.advisoryText1}</li><li>{copy.advisoryText2}</li></ul>
                  </li>
                </ol>

                <div className="marcado VerdeLimon">{copy.governance}</div>
                <ol>
                  <li><b>{copy.nationalCommittee}</b><ul><li>{copy.nationalCommitteeText}</li></ul></li>
                  <li><b>{copy.composition}</b><ul><li>{copy.composition1}</li><li>{copy.composition2}</li></ul></li>
                  <li><b>{copy.leadership}</b><ul><li>{copy.leadership1}</li><li>{copy.leadership2}</li></ul></li>
                  <li><b>{copy.functions}</b><ul>{copy.functionsList.map((item) => <li key={item}>{item}</li>)}</ul></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
