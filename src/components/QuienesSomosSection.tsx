import type { FC } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";
import styles from "./QuienesSomosSection.module.css";

const COPY: Record<Language, string[]> = {
  es: [
    "El Capítulo Nacional de la Juventud del Perú forma parte del World Food Forum (WFF), una iniciativa global impulsada por la juventud y facilitada por la Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO), que busca transformar los sistemas agroalimentarios a través del liderazgo juvenil, la innovación y la acción colectiva.",
    "El WFF nació como una plataforma mundial para conectar a jóvenes de distintos países comprometidos con el futuro de la alimentación, la sostenibilidad y el desarrollo rural. A partir de esta visión global, se han creado capítulos nacionales en diferentes partes del mundo para adaptar esta misión a los desafíos y oportunidades de cada contexto local.",
    "En este marco, el Capítulo Nacional de la Juventud del WFF Perú fue lanzado el 8 de abril en Lima como un espacio de participación, incidencia y articulación para jóvenes interesados en contribuir a la transformación sostenible de los sistemas agroalimentarios del país.",
    "Perú es uno de los países con mayor biodiversidad del mundo, con ecosistemas que abarcan la Amazonía, los Andes y la costa del Pacífico. Esta riqueza natural y cultural sostiene sistemas agroalimentarios diversos y fundamentales para millones de personas. Sin embargo, el país también enfrenta desafíos relacionados con el cambio climático, la seguridad alimentaria, la urbanización y las desigualdades territoriales.",
    "Frente a este contexto, el Capítulo busca empoderar a las juventudes peruanas como agentes de cambio, promoviendo iniciativas en políticas públicas, innovación, educación, comunicación, sostenibilidad y participación comunitaria. Su trabajo se alinea con la Política Nacional de Juventud 2021–2030 y cuenta con aliados estratégicos como FAO Perú, MIDAGRI y SENAJU.",
    "A través de espacios de diálogo, capacitación, incidencia y colaboración, el Capítulo Nacional de la Juventud del WFF Perú trabaja para construir sistemas agroalimentarios más inclusivos, sostenibles y resilientes, colocando a las juventudes en el centro de la transformación.",
  ],
  en: [
    "The Peru National Youth Chapter is part of the World Food Forum (WFF), a global youth-led initiative facilitated by the Food and Agriculture Organization of the United Nations (FAO) that seeks to transform agrifood systems through youth leadership, innovation and collective action.",
    "The WFF was created as a global platform connecting young people from different countries who are committed to the future of food, sustainability and rural development. From this global vision, national chapters have been created around the world to adapt the mission to the challenges and opportunities of each local context.",
    "Within this framework, the WFF Peru National Youth Chapter was launched on April 8 in Lima as a space for participation, advocacy and coordination for young people interested in contributing to the sustainable transformation of the country's agrifood systems.",
    "Peru is one of the world's most biodiverse countries, with ecosystems spanning the Amazon, the Andes and the Pacific coast. This natural and cultural wealth supports diverse agrifood systems that are essential to millions of people, while the country also faces challenges related to climate change, food security, urbanization and territorial inequality.",
    "In this context, the Chapter seeks to empower Peruvian youth as agents of change by promoting initiatives in public policy, innovation, education, communication, sustainability and community participation. Its work is aligned with Peru's National Youth Policy 2021–2030 and is supported by strategic partners such as FAO Peru, MIDAGRI and SENAJU.",
    "Through dialogue, training, advocacy and collaboration, the WFF Peru National Youth Chapter works to build more inclusive, sustainable and resilient agrifood systems, placing young people at the center of transformation.",
  ],
  it: [
    "Il Capitolo Nazionale dei Giovani del Perù fa parte del World Food Forum (WFF), un'iniziativa globale guidata dai giovani e facilitata dall'Organizzazione delle Nazioni Unite per l'Alimentazione e l'Agricoltura (FAO), che mira a trasformare i sistemi agroalimentari attraverso leadership giovanile, innovazione e azione collettiva.",
    "Il WFF è nato come piattaforma mondiale per collegare giovani di diversi Paesi impegnati nel futuro dell'alimentazione, della sostenibilità e dello sviluppo rurale. Da questa visione globale sono nati capitoli nazionali in varie parti del mondo per adattare la missione alle sfide e alle opportunità di ogni contesto locale.",
    "In questo quadro, il Capitolo Nazionale dei Giovani WFF Perù è stato lanciato l'8 aprile a Lima come spazio di partecipazione, advocacy e coordinamento per i giovani interessati a contribuire alla trasformazione sostenibile dei sistemi agroalimentari del Paese.",
    "Il Perù è uno dei Paesi con maggiore biodiversità al mondo, con ecosistemi che comprendono l'Amazzonia, le Ande e la costa del Pacifico. Questa ricchezza naturale e culturale sostiene sistemi agroalimentari diversi e fondamentali per milioni di persone, mentre il Paese affronta anche sfide legate al cambiamento climatico, alla sicurezza alimentare, all'urbanizzazione e alle disuguaglianze territoriali.",
    "In questo contesto, il Capitolo mira a rafforzare il ruolo dei giovani peruviani come agenti di cambiamento, promuovendo iniziative in politiche pubbliche, innovazione, educazione, comunicazione, sostenibilità e partecipazione comunitaria. Il lavoro è allineato alla Politica Nazionale della Gioventù 2021–2030 e conta su partner strategici come FAO Perù, MIDAGRI e SENAJU.",
    "Attraverso dialogo, formazione, advocacy e collaborazione, il Capitolo Nazionale dei Giovani WFF Perù lavora per costruire sistemi agroalimentari più inclusivi, sostenibili e resilienti, mettendo i giovani al centro della trasformazione.",
  ],
  pt: [
    "O Capítulo Nacional da Juventude do Peru faz parte do World Food Forum (WFF), uma iniciativa global liderada por jovens e facilitada pela Organização das Nações Unidas para a Alimentação e a Agricultura (FAO), que busca transformar os sistemas agroalimentares por meio da liderança juvenil, inovação e ação coletiva.",
    "O WFF nasceu como uma plataforma mundial para conectar jovens de diferentes países comprometidos com o futuro da alimentação, a sustentabilidade e o desenvolvimento rural. A partir dessa visão global, foram criados capítulos nacionais em diferentes partes do mundo para adaptar a missão aos desafios e oportunidades de cada contexto local.",
    "Nesse contexto, o Capítulo Nacional da Juventude do WFF Peru foi lançado em 8 de abril, em Lima, como um espaço de participação, incidência e articulação para jovens interessados em contribuir para a transformação sustentável dos sistemas agroalimentares do país.",
    "O Peru é um dos países com maior biodiversidade do mundo, com ecossistemas que abrangem a Amazônia, os Andes e a costa do Pacífico. Essa riqueza natural e cultural sustenta sistemas agroalimentares diversos e fundamentais para milhões de pessoas, ao mesmo tempo em que o país enfrenta desafios relacionados às mudanças climáticas, segurança alimentar, urbanização e desigualdades territoriais.",
    "Diante desse contexto, o Capítulo busca fortalecer os jovens peruanos como agentes de mudança, promovendo iniciativas em políticas públicas, inovação, educação, comunicação, sustentabilidade e participação comunitária. Seu trabalho está alinhado à Política Nacional da Juventude 2021–2030 e conta com aliados estratégicos como FAO Peru, MIDAGRI e SENAJU.",
    "Por meio de espaços de diálogo, capacitação, incidência e colaboração, o Capítulo Nacional da Juventude do WFF Peru trabalha para construir sistemas agroalimentares mais inclusivos, sustentáveis e resilientes, colocando os jovens no centro da transformação.",
  ],
};

const QuienesSomosSection: FC = () => {
  const { language, t } = useLanguage();
  const paragraphs = COPY[language];

  return (
    <section className={styles.section} aria-labelledby="quienes-somos-title">
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 id="quienes-somos-title" className={styles.title}>{t("about.who")}</h2>
          <p className={styles.lead}>{t("about.lead")}</p>
          <div className={styles.content}>
            <p>{paragraphs[0]}</p>
            <div className={styles.imageWrapper}>
              <img
                src="img/InauguracionWFFPERU.webp"
                alt="WFF Peru National Youth Chapter"
                className={styles.image}
              />
            </div>
            {paragraphs.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomosSection;
