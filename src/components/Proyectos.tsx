import type { FC } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

interface Proyecto { img: string; descripcion: string }

const PROJECTS: Record<Language, Proyecto[]> = {
  es: [
    { img: "/img/CineEcologico.webp", descripcion: "Evento cultural que promueve la conciencia ambiental mediante cine y diálogo juvenil. Incluye proyección de cortometrajes sobre cambio climático, sostenibilidad y economía circular. Culmina con un conversatorio de jóvenes líderes y un llamado a la acción por el planeta en la región Amazonas." },
    { img: "/img/FestiFAO.webp", descripcion: "Festi FAO es un festival juvenil que celebra la cultura peruana y la creatividad para transformar los sistemas alimentarios. Incluye cocina con insumos locales, cine, arte, música y apoyo a emprendimientos regionales." },
    { img: "/img/SemillasDeFuerza.webp", descripcion: "Trabajaremos con colegios públicos cercanos, aliados especializados y una metodología propia para desarrollar cuatro talleres educativos en inicial. También se elaborarán materiales didácticos y se mapearán organizaciones de apoyo." },
    { img: "/img/ProyectosJovenes.webp", descripcion: "Implementaremos un encuentro y taller con agricultores de Campo Alegre, con apoyo de MIDAGRI y actores locales, para documentar saberes sostenibles y difundirlos mediante contenido audiovisual." },
  ],
  en: [
    { img: "/img/CineEcologico.webp", descripcion: "A cultural event that promotes environmental awareness through film and youth dialogue. It includes short films on climate change, sustainability and the circular economy, followed by a conversation with young leaders and a call to action for the planet in the Amazonas region." },
    { img: "/img/FestiFAO.webp", descripcion: "Festi FAO is a youth festival celebrating Peruvian culture and creativity to transform food systems. It includes cooking with local ingredients, film, art, music and support for regional entrepreneurship." },
    { img: "/img/SemillasDeFuerza.webp", descripcion: "We will work with nearby public schools, specialized partners and our own methodology to deliver four early-education workshops. Educational materials will also be developed and support organizations will be mapped." },
    { img: "/img/ProyectosJovenes.webp", descripcion: "We will hold a meeting and workshop with farmers from Campo Alegre, supported by MIDAGRI and local actors, to document sustainable knowledge and share it through audiovisual content." },
  ],
  it: [
    { img: "/img/CineEcologico.webp", descripcion: "Un evento culturale che promuove la consapevolezza ambientale attraverso cinema e dialogo giovanile. Include cortometraggi su cambiamento climatico, sostenibilità ed economia circolare, seguiti da un confronto con giovani leader e da un invito all'azione nella regione Amazonas." },
    { img: "/img/FestiFAO.webp", descripcion: "Festi FAO è un festival giovanile che celebra la cultura peruviana e la creatività per trasformare i sistemi alimentari. Comprende cucina con ingredienti locali, cinema, arte, musica e sostegno all'imprenditoria regionale." },
    { img: "/img/SemillasDeFuerza.webp", descripcion: "Lavoreremo con scuole pubbliche vicine, partner specializzati e una metodologia propria per realizzare quattro laboratori educativi per la prima infanzia. Saranno inoltre creati materiali didattici e mappate organizzazioni di supporto." },
    { img: "/img/ProyectosJovenes.webp", descripcion: "Realizzeremo un incontro e laboratorio con gli agricoltori di Campo Alegre, con il supporto di MIDAGRI e attori locali, per documentare conoscenze sostenibili e diffonderle attraverso contenuti audiovisivi." },
  ],
  pt: [
    { img: "/img/CineEcologico.webp", descripcion: "Evento cultural que promove a consciência ambiental por meio do cinema e do diálogo juvenil. Inclui curtas-metragens sobre mudanças climáticas, sustentabilidade e economia circular, seguidos por uma conversa com jovens líderes e um chamado à ação na região Amazonas." },
    { img: "/img/FestiFAO.webp", descripcion: "Festi FAO é um festival juvenil que celebra a cultura peruana e a criatividade para transformar os sistemas alimentares. Inclui culinária com ingredientes locais, cinema, arte, música e apoio ao empreendedorismo regional." },
    { img: "/img/SemillasDeFuerza.webp", descripcion: "Trabalharemos com escolas públicas próximas, parceiros especializados e uma metodologia própria para realizar quatro oficinas educativas na primeira infância. Também serão produzidos materiais didáticos e mapeadas organizações de apoio." },
    { img: "/img/ProyectosJovenes.webp", descripcion: "Realizaremos um encontro e oficina com agricultores de Campo Alegre, com apoio do MIDAGRI e atores locais, para documentar conhecimentos sustentáveis e divulgá-los por meio de conteúdo audiovisual." },
  ],
};

const HEADINGS: Record<Language, { eyebrow: string; title: string }> = {
  es: { eyebrow: "Conoce más sobre", title: "Nuestros Proyectos" },
  en: { eyebrow: "Learn more about", title: "Our Projects" },
  it: { eyebrow: "Scopri di più sui", title: "I Nostri Progetti" },
  pt: { eyebrow: "Conheça mais sobre", title: "Nossos Projetos" },
};

export const Proyectos: FC = () => {
  const { language } = useLanguage();
  const projects = PROJECTS[language];
  const heading = HEADINGS[language];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>{heading.eyebrow}</h6>
          <h1>{heading.title}</h1>
        </div>
        <div className="row">
          {projects.map((project, index) => (
            <div className="col-lg-4 col-md-6 mb-4" key={`${project.img}-${index}`}>
              <div className="bloque-info bg-white mb-2">
                <img className="img-fluid" src={project.img} alt="" />
                <div className="p-4"><div className="border-top pt-4"><span>{project.descripcion}</span></div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
