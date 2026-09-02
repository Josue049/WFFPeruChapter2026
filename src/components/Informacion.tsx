import type { FC } from "react";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Copy = {
  information: string;
  who: string;
  whoItems: string[];
  objective: string;
  objectiveItems: string[];
  alt: string;
};

const COPY: Record<Language, Copy> = {
  es: {
    information: "INFORMACIÓN",
    who: "¿QUIÉNES SOMOS?",
    whoItems: [
      "Somos la voz y el puente visual del Capítulo Juvenil.",
      "Conectamos juventud, alimentación, agricultura y clima.",
      "Informamos, inspiramos y movilizamos.",
      "Amplificamos el impacto de todas las áreas.",
    ],
    objective: "NUESTRO OBJETIVO",
    objectiveItems: [
      "Dar coherencia y claridad al mensaje del Capítulo.",
      "Posicionar al WFF Perú en redes y medios.",
      "Contar historias que inspiren acción juvenil.",
      "Visibilizar proyectos, alianzas y logros.",
    ],
    alt: "Jóvenes del capítulo",
  },
  en: {
    information: "INFORMATION",
    who: "WHO ARE WE?",
    whoItems: [
      "We are the voice and visual bridge of the Youth Chapter.",
      "We connect youth, food, agriculture and climate.",
      "We inform, inspire and mobilize.",
      "We amplify the impact of every area of the Chapter.",
    ],
    objective: "OUR OBJECTIVE",
    objectiveItems: [
      "Give coherence and clarity to the Chapter's message.",
      "Position WFF Peru across social media and the press.",
      "Tell stories that inspire youth action.",
      "Showcase projects, partnerships and achievements.",
    ],
    alt: "Young people from the chapter",
  },
  it: {
    information: "INFORMAZIONI",
    who: "CHI SIAMO?",
    whoItems: [
      "Siamo la voce e il ponte visivo del Capitolo Giovanile.",
      "Colleghiamo giovani, alimentazione, agricoltura e clima.",
      "Informiamo, ispiriamo e mobilitiamo.",
      "Amplifichiamo l'impatto di tutte le aree del Capitolo.",
    ],
    objective: "IL NOSTRO OBIETTIVO",
    objectiveItems: [
      "Dare coerenza e chiarezza al messaggio del Capitolo.",
      "Posizionare WFF Perù sui social media e nei mezzi di comunicazione.",
      "Raccontare storie che ispirino l'azione dei giovani.",
      "Dare visibilità a progetti, partnership e risultati.",
    ],
    alt: "Giovani del capitolo",
  },
  pt: {
    information: "INFORMAÇÕES",
    who: "QUEM SOMOS?",
    whoItems: [
      "Somos a voz e a ponte visual do Capítulo Juvenil.",
      "Conectamos juventude, alimentação, agricultura e clima.",
      "Informamos, inspiramos e mobilizamos.",
      "Ampliamos o impacto de todas as áreas do Capítulo.",
    ],
    objective: "NOSSO OBJETIVO",
    objectiveItems: [
      "Dar coerência e clareza à mensagem do Capítulo.",
      "Posicionar o WFF Peru nas redes sociais e na mídia.",
      "Contar histórias que inspirem a ação juvenil.",
      "Dar visibilidade a projetos, parcerias e conquistas.",
    ],
    alt: "Jovens do capítulo",
  },
};

const Informacion: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="row">
          <div className="bloque-completo">
            <div className="pb-3" style={{ width: "100%" }}>
              <div className="bg-white sombreadoBloque mb-3 clearfix" style={{ padding: "30px" }}>
                <div className="d-flex mb-3">
                  <span className="text-primary text-uppercase text-decoration-none">
                    {copy.information}
                  </span>
                </div>
                <img
                  className="img-fluid img-w float-right mr-4 mb-2"
                  src="img/comu2.webp"
                  alt={copy.alt}
                />
                <h2 className="mb-3">{copy.who}</h2>
                <ul>
                  {copy.whoItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <h2 className="mb-3">{copy.objective}</h2>
                <ul>
                  {copy.objectiveItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informacion;
