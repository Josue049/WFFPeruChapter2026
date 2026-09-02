import type { FC } from "react";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Copy = {
  title: string;
  milestones: Array<{ title: string; text: string }>;
};

const COPY: Record<Language, Copy> = {
  es: {
    title: "Visibilidad y próximos hitos",
    milestones: [
      { title: "CSW 70 - ONU Mujeres · Marzo 2026, Nueva York", text: "Presentación de experiencia piloto peruana sobre empoderamiento económico de jóvenes rurales." },
      { title: "Año Internacional de la Mujer Agricultora", text: "Publicación del informe regional “From Policy to Action – Latin America” con participación activa del Capítulo Perú." },
    ],
  },
  en: {
    title: "Visibility and upcoming milestones",
    milestones: [
      { title: "CSW 70 - UN Women · March 2026, New York", text: "Presentation of the Peruvian pilot experience on the economic empowerment of rural youth." },
      { title: "International Year of the Woman Farmer", text: "Publication of the regional report “From Policy to Action – Latin America” with active participation from the Peru Chapter." },
    ],
  },
  it: {
    title: "Visibilità e prossime tappe",
    milestones: [
      { title: "CSW 70 - UN Women · Marzo 2026, New York", text: "Presentazione dell'esperienza pilota peruviana sull'empowerment economico dei giovani rurali." },
      { title: "Anno Internazionale della Donna Agricoltrice", text: "Pubblicazione del rapporto regionale “From Policy to Action – Latin America” con la partecipazione attiva del Capitolo Perù." },
    ],
  },
  pt: {
    title: "Visibilidade e próximos marcos",
    milestones: [
      { title: "CSW 70 - ONU Mulheres · Março de 2026, Nova York", text: "Apresentação da experiência-piloto peruana sobre empoderamento econômico de jovens rurais." },
      { title: "Ano Internacional da Mulher Agricultora", text: "Publicação do relatório regional “From Policy to Action – Latin America” com participação ativa do Capítulo Peru." },
    ],
  },
};

const VisibilidadHitos: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1 className="text-pink text-uppercase">{copy.title}</h1>
        </div>

        <div className="row bloque-dual">
          {copy.milestones.map((milestone) => (
            <div className="col-lg-4 col-md-6 mb-4" key={milestone.title}>
              <div className="hitos bg-white mb-2">
                <h4>{milestone.title}</h4>
                <div className="p-4">
                  <div className="border-top pt-4"><span>{milestone.text}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisibilidadHitos;
