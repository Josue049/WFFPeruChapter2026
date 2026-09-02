import type { FC } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const COPY: Record<Language, { eyebrow: string; title: string; text: string }> = {
  es: { eyebrow: "Lo que hacemos en ...", title: "EDUCACIÓN", text: "La educación en sistemas alimentarios es clave para construir un futuro más saludable y sostenible. El Programa de educación juvenil del WFF busca cerrar brechas territoriales y educativas, brindando herramientas, recursos y oportunidades para que jóvenes, educadores y profesionales lideren el cambio a nivel local y global." },
  en: { eyebrow: "What we do in ...", title: "EDUCATION", text: "Education on food systems is essential to building a healthier and more sustainable future. The WFF youth education program seeks to close territorial and educational gaps by providing tools, resources and opportunities for young people, educators and professionals to lead change locally and globally." },
  it: { eyebrow: "Cosa facciamo in ...", title: "EDUCAZIONE", text: "L'educazione sui sistemi alimentari è fondamentale per costruire un futuro più sano e sostenibile. Il programma educativo giovanile del WFF mira a ridurre i divari territoriali ed educativi offrendo strumenti, risorse e opportunità affinché giovani, educatori e professionisti guidino il cambiamento a livello locale e globale." },
  pt: { eyebrow: "O que fazemos em ...", title: "EDUCAÇÃO", text: "A educação sobre sistemas alimentares é fundamental para construir um futuro mais saudável e sustentável. O programa de educação juvenil do WFF busca reduzir lacunas territoriais e educacionais, oferecendo ferramentas, recursos e oportunidades para que jovens, educadores e profissionais liderem mudanças em nível local e global." },
};

export const Educacion: FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language];
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row">
          <div className="col-lg-6" style={{ minHeight: "500px" }}><div className="position-relative h-100"><img className="position-absolute w-100 h-100" src="/img/AboutEducacion.webp" style={{ objectFit: "cover" }} alt={copy.title} /></div></div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>{copy.eyebrow}</h6>
              <h1 className="mb-3">{copy.title}</h1>
              <p>{copy.text}</p>
              <div className="row mb-4">
                <div className="col-6"><img className="img-fluid" src="/img/SemillasDeFuerza.webp" alt="Semillas de Fuerza" /></div>
                <div className="col-6"><img className="img-fluid" src="/img/ProyectosJovenes.webp" alt="Youth projects" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
