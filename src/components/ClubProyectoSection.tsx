import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

type ClubProyectosSectionProps = { imageSrc: string };

const COPY: Record<Language, { eyebrow: string; title: string; paragraphs: string[]; final: string }> = {
  es: { eyebrow: "Lo que hacemos en ...", title: "CLUB DE PROYECTOS", paragraphs: ["Espacio juvenil que impulsa la creación y desarrollo de proyectos agroalimentarios mediante formación en habilidades blandas, innovación y trabajo colaborativo. Reúne a jóvenes con perfiles técnicos diversos —programación, agricultura, IA, robótica, física, GIS y más— para acompañarlos en el proceso de formular, mejorar y presentar soluciones que transformen los sistemas agroalimentarios del país.", "Convocatoria permanente para jóvenes con ideas o interés en sumarse a un equipo. Ejecución del Ciclo de Pitch, con talleres clave y sesiones de networking “Forma tu equipo”, que conectan a jóvenes con habilidades complementarias."], final: "Conexión con cursos de FAO Academy con certificación vinculados con agricultura sostenible e innovación." },
  en: { eyebrow: "What we do in ...", title: "PROJECT CLUB", paragraphs: ["A youth space that promotes the creation and development of agrifood projects through soft-skills training, innovation and collaborative work. It brings together young people with diverse technical profiles —programming, agriculture, AI, robotics, physics, GIS and more— and supports them in formulating, improving and presenting solutions that transform the country's agrifood systems.", "There is an ongoing call for young people with ideas or an interest in joining a team. The Pitch Cycle includes key workshops and 'Build your team' networking sessions that connect complementary skills."], final: "Connection with certified FAO Academy courses related to sustainable agriculture and innovation." },
  it: { eyebrow: "Cosa facciamo in ...", title: "CLUB DEI PROGETTI", paragraphs: ["Uno spazio giovanile che promuove la creazione e lo sviluppo di progetti agroalimentari attraverso formazione sulle competenze trasversali, innovazione e lavoro collaborativo. Riunisce giovani con profili tecnici diversi —programmazione, agricoltura, IA, robotica, fisica, GIS e altro— e li accompagna nella formulazione, nel miglioramento e nella presentazione di soluzioni per trasformare i sistemi agroalimentari del Paese.", "È aperta una convocazione permanente per giovani con idee o interessati a entrare in un team. Il Ciclo di Pitch include workshop chiave e sessioni di networking 'Crea il tuo team' che collegano competenze complementari."], final: "Collegamento con corsi certificati della FAO Academy su agricoltura sostenibile e innovazione." },
  pt: { eyebrow: "O que fazemos em ...", title: "CLUBE DE PROJETOS", paragraphs: ["Um espaço juvenil que impulsiona a criação e o desenvolvimento de projetos agroalimentares por meio de formação em habilidades socioemocionais, inovação e trabalho colaborativo. Reúne jovens com perfis técnicos diversos —programação, agricultura, IA, robótica, física, GIS e muito mais— para apoiá-los na formulação, melhoria e apresentação de soluções que transformem os sistemas agroalimentares do país.", "Há uma chamada permanente para jovens com ideias ou interesse em participar de uma equipe. O Ciclo de Pitch inclui oficinas-chave e sessões de networking 'Monte sua equipe', conectando habilidades complementares."], final: "Conexão com cursos certificados da FAO Academy relacionados à agricultura sustentável e à inovação." },
};

export function ClubProyectosSection({ imageSrc }: ClubProyectosSectionProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100"><img className="position-absolute w-100 h-100" src={imageSrc} alt={copy.title} style={{ objectFit: "cover" }} /></div>
          </div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>{copy.eyebrow}</h6>
              <h1 className="mb-3">{copy.title}</h1>
              {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p><b>{copy.final}</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
