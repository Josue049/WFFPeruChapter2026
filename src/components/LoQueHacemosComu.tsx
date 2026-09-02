import type { FC } from "react";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Copy = {
  title: string;
  sections: Array<{ title: string; items: string[] }>;
};

const COPY: Record<Language, Copy> = {
  es: {
    title: "Lo que hacemos:",
    sections: [
      { title: "1. Estrategia de contenido", items: ["Narrativa clara", "Plan editorial"] },
      { title: "2. Redes sociales", items: ["Gestión y diseño", "Imagen visual del Capítulo"] },
      { title: "3. Comunicación interna y medios", items: ["Flujo interno", "Relaciones públicas"] },
      { title: "4. Difusión de eventos", items: ["Promoción", "Campañas y llamados a la acción"] },
    ],
  },
  en: {
    title: "What we do:",
    sections: [
      { title: "1. Content strategy", items: ["Clear narrative", "Editorial plan"] },
      { title: "2. Social media", items: ["Management and design", "Chapter visual identity"] },
      { title: "3. Internal communications and media", items: ["Internal information flow", "Public relations"] },
      { title: "4. Event outreach", items: ["Promotion", "Campaigns and calls to action"] },
    ],
  },
  it: {
    title: "Cosa facciamo:",
    sections: [
      { title: "1. Strategia dei contenuti", items: ["Narrazione chiara", "Piano editoriale"] },
      { title: "2. Social media", items: ["Gestione e design", "Identità visiva del Capitolo"] },
      { title: "3. Comunicazione interna e media", items: ["Flusso informativo interno", "Relazioni pubbliche"] },
      { title: "4. Promozione degli eventi", items: ["Promozione", "Campagne e inviti all'azione"] },
    ],
  },
  pt: {
    title: "O que fazemos:",
    sections: [
      { title: "1. Estratégia de conteúdo", items: ["Narrativa clara", "Plano editorial"] },
      { title: "2. Redes sociais", items: ["Gestão e design", "Identidade visual do Capítulo"] },
      { title: "3. Comunicação interna e mídia", items: ["Fluxo interno de informação", "Relações públicas"] },
      { title: "4. Divulgação de eventos", items: ["Promoção", "Campanhas e chamadas para ação"] },
    ],
  },
};

const LoQueHacemos: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row">
          <div className="cuadro-completo">
            <div className="cuadro-flotante shadow bg-white">
              <div className="cuadro">
                <div className="imagen">
                  <img src="img/comu1.webp" className="img-fluid decor-img-comu" alt="" />
                </div>
                <div className="cuadro-text">
                  <h2>{copy.title}</h2>
                  {copy.sections.map((section) => (
                    <div key={section.title}>
                      <h4>{section.title}</h4>
                      <ul>
                        {section.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoQueHacemos;
