import type { FC } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const COPY: Record<Language, { eyebrow: string; title: string; text: string }> = {
  es: { eyebrow: "Lo que hacemos en ...", title: "CULTURA", text: "Impulsamos a la gastronomía, cine, música y arte como lenguajes universales para movilizar a la juventud y acelerar la transformación de los sistemas agroalimentarios hacia un futuro más sostenible." },
  en: { eyebrow: "What we do in ...", title: "CULTURE", text: "We promote gastronomy, film, music and art as universal languages that mobilize young people and accelerate the transformation of agrifood systems toward a more sustainable future." },
  it: { eyebrow: "Cosa facciamo in ...", title: "CULTURA", text: "Promuoviamo gastronomia, cinema, musica e arte come linguaggi universali per mobilitare i giovani e accelerare la trasformazione dei sistemi agroalimentari verso un futuro più sostenibile." },
  pt: { eyebrow: "O que fazemos em ...", title: "CULTURA", text: "Promovemos gastronomia, cinema, música e arte como linguagens universais para mobilizar os jovens e acelerar a transformação dos sistemas agroalimentares rumo a um futuro mais sustentável." },
};

export const Cultura: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row nuevo">
          <div className="col-lg-6" style={{ minHeight: "500px" }}><div className="position-relative h-100"><img className="position-absolute w-100 h-100" src="/img/AboutCultura.webp" style={{ objectFit: "cover" }} alt={copy.title} /></div></div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>{copy.eyebrow}</h6>
              <h1 className="mb-3">{copy.title}</h1>
              <p>{copy.text}</p>
              <div className="row mb-4">
                <div className="col-6"><img className="img-fluid" src="/img/CineEcologico.webp" alt="Eco cinema" /></div>
                <div className="col-6"><img className="img-fluid" src="/img/FestiFAO.webp" alt="Festi FAO" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
