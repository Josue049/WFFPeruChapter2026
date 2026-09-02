import type { FC } from "react";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Goal = { title: string; text: string; image: string; alt: string };
type Copy = { title: string; subtitle: string; goals: Goal[] };

const COPY: Record<Language, Copy> = {
  es: {
    title: "Nuestro compromiso",
    subtitle: "Empoderar a las mujeres en los Sistemas Agroalimentarios",
    goals: [
      { title: "Educación de calidad:", text: "Desarrollar habilidades técnicas y digitales para el trabajo decente en el sector agroalimentario.", image: "img/ODS4.webp", alt: "ODS 4" },
      { title: "Igualdad de género:", text: "Promover la economía del cuidado y eliminar barreras de género en las zonas rurales.", image: "img/ODS5.webp", alt: "ODS 5" },
      { title: "Trabajo decente:", text: "Impulsar el emprendimiento juvenil y el empleo digno en comunidades agrícolas.", image: "img/ODS8.webp", alt: "ODS 8" },
    ],
  },
  en: {
    title: "Our commitment",
    subtitle: "Empowering women in agrifood systems",
    goals: [
      { title: "Quality education:", text: "Develop technical and digital skills for decent work in the agrifood sector.", image: "img/ODS4.webp", alt: "SDG 4" },
      { title: "Gender equality:", text: "Promote the care economy and remove gender barriers in rural areas.", image: "img/ODS5.webp", alt: "SDG 5" },
      { title: "Decent work:", text: "Promote youth entrepreneurship and decent employment in agricultural communities.", image: "img/ODS8.webp", alt: "SDG 8" },
    ],
  },
  it: {
    title: "Il nostro impegno",
    subtitle: "Rafforzare il ruolo delle donne nei sistemi agroalimentari",
    goals: [
      { title: "Istruzione di qualità:", text: "Sviluppare competenze tecniche e digitali per un lavoro dignitoso nel settore agroalimentare.", image: "img/ODS4.webp", alt: "SDG 4" },
      { title: "Parità di genere:", text: "Promuovere l'economia della cura ed eliminare le barriere di genere nelle aree rurali.", image: "img/ODS5.webp", alt: "SDG 5" },
      { title: "Lavoro dignitoso:", text: "Promuovere l'imprenditoria giovanile e l'occupazione dignitosa nelle comunità agricole.", image: "img/ODS8.webp", alt: "SDG 8" },
    ],
  },
  pt: {
    title: "Nosso compromisso",
    subtitle: "Empoderar as mulheres nos sistemas agroalimentares",
    goals: [
      { title: "Educação de qualidade:", text: "Desenvolver competências técnicas e digitais para o trabalho decente no setor agroalimentar.", image: "img/ODS4.webp", alt: "ODS 4" },
      { title: "Igualdade de gênero:", text: "Promover a economia do cuidado e eliminar barreiras de gênero nas áreas rurais.", image: "img/ODS5.webp", alt: "ODS 5" },
      { title: "Trabalho decente:", text: "Impulsionar o empreendedorismo juvenil e o emprego digno em comunidades agrícolas.", image: "img/ODS8.webp", alt: "ODS 8" },
    ],
  },
};

const NuestroCompromiso: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1 className="text-pink text-uppercase">{copy.title}</h1>
          <h6 className="text-uppercase" style={{ letterSpacing: "5px" }}>{copy.subtitle}</h6>
        </div>

        <div className="row">
          {copy.goals.map((goal) => (
            <div className="col-lg-4 col-md-6 mb-4" key={goal.title}>
              <div className="bloque-info bg-white mb-2">
                <img className="img-fluid" src={goal.image} alt={goal.alt} />
                <div className="p-4">
                  <div className="border-top pt-4">
                    <span>
                      <b className="text-uppercase">{goal.title}</b>
                      <br />
                      {goal.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NuestroCompromiso;
