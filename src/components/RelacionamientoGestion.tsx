import type { FC } from "react";
import { SectionTextImg } from "../components/SectionTextImg";
import { ReverseSectionTextImg } from "../components/ReverseSectionTextImg";
import type { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";

type Block = { badge: string; title: string; description: string };

const COPY: Record<Language, [Block, Block, Block]> = {
  es: [
    {
      badge: "Una gran responsabilidad",
      title: "¿QUÉ HACEMOS?",
      description: "El Área de Relacionamiento y Gestión de Recursos es responsable de fortalecer la sostenibilidad institucional, ampliar el impacto del Capítulo y consolidar alianzas estratégicas que contribuyan a la transformación de los sistemas agroalimentarios desde una mirada juvenil, inclusiva y territorial. Su labor se centra en movilizar recursos financieros, técnicos y estratégicos, así como en articular relaciones de largo plazo con actores clave del sector público, la academia, el sector privado, organizaciones juveniles, sociedad civil y agencias de cooperación internacional, en coherencia con los lineamientos del WFF y la FAO.",
    },
    {
      badge: "Estrategia y gestión integral",
      title: "PRINCIPALES FUNCIONES",
      description: "Entre sus principales funciones se encuentran el diseño e implementación de la estrategia de sostenibilidad financiera del Capítulo, la identificación y diversificación de fuentes de financiamiento, y la definición de mecanismos claros y transparentes para el ingreso, gestión y seguimiento de recursos. Asimismo, el área lidera la gestión integral de alianzas, desde la definición de criterios y tipologías, hasta el acompañamiento, monitoreo y sistematización de resultados. También cumple un rol clave en el posicionamiento institucional del Capítulo y promueve el relacionamiento con otros capítulos del WFF a nivel regional y global.",
    },
    {
      badge: "Nuestras bases",
      title: "IMPACTO Y CONTRIBUCIÓN",
      description: "En conjunto, el Área de Relacionamiento y Gestión de Recursos trabaja para asegurar que el Capítulo cuente con bases sólidas, alianzas estratégicas y recursos sostenibles, que permitan potenciar el liderazgo juvenil y generar impactos duraderos en favor de sistemas agroalimentarios más justos, resilientes y sostenibles.",
    },
  ],
  en: [
    {
      badge: "A major responsibility",
      title: "WHAT DO WE DO?",
      description: "The Partnerships and Resource Management Area strengthens institutional sustainability, expands the Chapter's impact and builds strategic partnerships that contribute to agrifood systems transformation from a youth-led, inclusive and territorial perspective. Its work focuses on mobilizing financial, technical and strategic resources and building long-term relationships with key actors from the public sector, academia, the private sector, youth organizations, civil society and international cooperation agencies, in line with WFF and FAO guidance.",
    },
    {
      badge: "Strategy and comprehensive management",
      title: "MAIN FUNCTIONS",
      description: "Its main functions include designing and implementing the Chapter's financial sustainability strategy, identifying and diversifying funding sources, and defining clear and transparent mechanisms for receiving, managing and monitoring resources. The area also leads partnership management, from criteria and partner types to follow-up, monitoring and results systematization. It plays a key role in the Chapter's institutional positioning and promotes collaboration with other WFF chapters at regional and global levels.",
    },
    {
      badge: "Our foundations",
      title: "IMPACT AND CONTRIBUTION",
      description: "Together, the Partnerships and Resource Management Area works to ensure that the Chapter has strong foundations, strategic partnerships and sustainable resources to strengthen youth leadership and create lasting impact for fairer, more resilient and sustainable agrifood systems.",
    },
  ],
  it: [
    {
      badge: "Una grande responsabilità",
      title: "COSA FACCIAMO?",
      description: "L'Area Relazioni e Gestione delle Risorse rafforza la sostenibilità istituzionale, amplia l'impatto del Capitolo e consolida partnership strategiche che contribuiscono alla trasformazione dei sistemi agroalimentari da una prospettiva giovanile, inclusiva e territoriale. Il suo lavoro si concentra sulla mobilitazione di risorse finanziarie, tecniche e strategiche e sulla costruzione di relazioni di lungo periodo con attori chiave del settore pubblico, dell'accademia, del settore privato, delle organizzazioni giovanili, della società civile e della cooperazione internazionale, in linea con WFF e FAO.",
    },
    {
      badge: "Strategia e gestione integrata",
      title: "FUNZIONI PRINCIPALI",
      description: "Le funzioni principali includono la progettazione e l'attuazione della strategia di sostenibilità finanziaria del Capitolo, l'identificazione e la diversificazione delle fonti di finanziamento e la definizione di meccanismi chiari e trasparenti per ricevere, gestire e monitorare le risorse. L'area guida inoltre la gestione delle partnership, contribuisce al posizionamento istituzionale del Capitolo e promuove la collaborazione con altri capitoli WFF a livello regionale e globale.",
    },
    {
      badge: "Le nostre basi",
      title: "IMPATTO E CONTRIBUTO",
      description: "Nel complesso, l'Area Relazioni e Gestione delle Risorse lavora affinché il Capitolo disponga di solide basi, partnership strategiche e risorse sostenibili, capaci di rafforzare la leadership giovanile e generare un impatto duraturo a favore di sistemi agroalimentari più equi, resilienti e sostenibili.",
    },
  ],
  pt: [
    {
      badge: "Uma grande responsabilidade",
      title: "O QUE FAZEMOS?",
      description: "A Área de Relacionamento e Gestão de Recursos fortalece a sustentabilidade institucional, amplia o impacto do Capítulo e consolida parcerias estratégicas que contribuem para a transformação dos sistemas agroalimentares a partir de uma perspectiva jovem, inclusiva e territorial. Seu trabalho se concentra na mobilização de recursos financeiros, técnicos e estratégicos e na construção de relações de longo prazo com atores-chave do setor público, academia, setor privado, organizações juvenis, sociedade civil e agências de cooperação internacional, em consonância com o WFF e a FAO.",
    },
    {
      badge: "Estratégia e gestão integrada",
      title: "PRINCIPAIS FUNÇÕES",
      description: "Entre suas principais funções estão o desenho e a implementação da estratégia de sustentabilidade financeira do Capítulo, a identificação e diversificação de fontes de financiamento e a definição de mecanismos claros e transparentes para o recebimento, a gestão e o acompanhamento de recursos. A área também lidera a gestão de parcerias, contribui para o posicionamento institucional do Capítulo e promove a cooperação com outros capítulos do WFF em nível regional e global.",
    },
    {
      badge: "Nossas bases",
      title: "IMPACTO E CONTRIBUIÇÃO",
      description: "Em conjunto, a Área de Relacionamento e Gestão de Recursos trabalha para garantir que o Capítulo conte com bases sólidas, parcerias estratégicas e recursos sustentáveis, capazes de fortalecer a liderança juvenil e gerar impactos duradouros em favor de sistemas agroalimentares mais justos, resilientes e sustentáveis.",
    },
  ],
};

const RelacionamientoGestion: FC = () => {
  const { language } = useLanguage();
  const [first, second, third] = COPY[language];

  return (
    <>
      <SectionTextImg imageSrc="/img/Piero-Imagen.webp" {...first} />
      <ReverseSectionTextImg imageSrc="/img/GianMarco-Relacionamiento.webp" {...second} />
      <SectionTextImg imageSrc="/img/relacionamiento.webp" {...third} />
    </>
  );
};

export default RelacionamientoGestion;
