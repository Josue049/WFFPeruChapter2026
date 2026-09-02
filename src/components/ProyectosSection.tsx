import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

type ProyectoSectionProps = { imageSrc: string };

const COPY: Record<Language, { eyebrow: string; problem: string; problemText: string; project: string; projectText: string }> = {
  es: {
    eyebrow: "Proyecto en marcha",
    problem: "PROBLEMÁTICA IDENTIFICADA:",
    problemText: "La agricultura peruana enfrenta un riesgo estructural: la adopción tecnológica avanza, pero lo hace de manera profundamente desigual. Aunque la agricultura familiar representa el 97 % de las unidades agropecuarias del país y concentra más del 83 % de la fuerza laboral agrícola.",
    project: "PROYECTO:",
    projectText: "La propuesta plantea desarrollar un modelo de Agricultura 5.0 inclusiva. El proyecto inicia con la recolección de información directa en territorio —sensores, observación de campo y decisiones técnicas humanas— para entrenar modelos de IA ligeros y replicables, enfocados principalmente en la optimización del riego. Una vez validados, estos modelos se integrarán en una plataforma accesible y se transferirán mediante procesos de capacitación a agricultores y jóvenes locales.",
  },
  en: {
    eyebrow: "Project in progress",
    problem: "IDENTIFIED CHALLENGE:",
    problemText: "Peruvian agriculture faces a structural risk: technology adoption is advancing, but in a deeply unequal way. Family farming represents 97% of the country's agricultural units and more than 83% of the agricultural workforce.",
    project: "PROJECT:",
    projectText: "The proposal develops an inclusive Agriculture 5.0 model. It begins by collecting direct field information —sensors, field observation and human technical decisions— to train lightweight, replicable AI models focused mainly on irrigation optimization. Once validated, the models will be integrated into an accessible platform and transferred through training processes for farmers and local youth.",
  },
  it: {
    eyebrow: "Progetto in corso",
    problem: "PROBLEMA IDENTIFICATO:",
    problemText: "L'agricoltura peruviana affronta un rischio strutturale: l'adozione tecnologica avanza, ma in modo profondamente diseguale. L'agricoltura familiare rappresenta il 97% delle unità agricole del Paese e oltre l'83% della forza lavoro agricola.",
    project: "PROGETTO:",
    projectText: "La proposta sviluppa un modello inclusivo di Agricoltura 5.0. Il progetto parte dalla raccolta di informazioni dirette sul territorio —sensori, osservazione sul campo e decisioni tecniche umane— per addestrare modelli di IA leggeri e replicabili, concentrati soprattutto sull'ottimizzazione dell'irrigazione. Una volta validati, saranno integrati in una piattaforma accessibile e trasferiti attraverso percorsi di formazione per agricoltori e giovani locali.",
  },
  pt: {
    eyebrow: "Projeto em andamento",
    problem: "PROBLEMA IDENTIFICADO:",
    problemText: "A agricultura peruana enfrenta um risco estrutural: a adoção tecnológica avança, mas de forma profundamente desigual. A agricultura familiar representa 97% das unidades agropecuárias do país e mais de 83% da força de trabalho agrícola.",
    project: "PROJETO:",
    projectText: "A proposta desenvolve um modelo inclusivo de Agricultura 5.0. O projeto começa com a coleta de informações diretamente no território —sensores, observação de campo e decisões técnicas humanas— para treinar modelos de IA leves e replicáveis, principalmente voltados à otimização da irrigação. Depois de validados, serão integrados a uma plataforma acessível e transferidos por meio de capacitação para agricultores e jovens locais.",
  },
};

export function ProyectoSection({ imageSrc }: ProyectoSectionProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid">
      <div className="container pt-5">
        <div className="row nuevo">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img className="position-absolute w-100 h-100" src={imageSrc} alt="Agriculture 5.0" style={{ objectFit: "cover" }} />
            </div>
          </div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>{copy.eyebrow}</h6>
              <h1 className="mb-3">DATA AGRO 5.0</h1>
              <b>{copy.problem}</b><p>{copy.problemText}</p>
              <b>{copy.project}</b><p>{copy.projectText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
