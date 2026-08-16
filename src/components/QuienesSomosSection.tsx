import type { FC } from "react";
import styles from "./QuienesSomosSection.module.css";

const QuienesSomosSection: FC = () => {
  return (
    <section className={styles.section} aria-labelledby="quienes-somos-title">
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 id="quienes-somos-title" className={styles.title}>
            ¿Quiénes somos?
          </h2>

          <p className={styles.lead}>
            Sobre el Capítulo Nacional de la Juventud del WFF Perú
          </p>

          <div className={styles.content}>
            <p>
              El Capítulo Nacional de la Juventud del Perú forma parte del World
              Food Forum (WFF), una iniciativa global impulsada por la juventud
              y facilitada por la Food and Agriculture Organization of the
              United Nations, que busca transformar los sistemas
              agroalimentarios a través del <strong>liderazgo juvenil</strong>,
              la <strong>innovación</strong> y la{" "}
              <strong>acción colectiva</strong>.
            </p>

            <div className={styles.imageWrapper}>
              <img
                src="img/InauguracionWFFPERU.webp"
                alt="Jóvenes del Capítulo Nacional WFF Perú"
                className={styles.image}
              />
            </div>

            <p>
              El WFF nació como una <strong>plataforma mundial</strong> para
              conectar a jóvenes de distintos países comprometidos con el futuro
              de la alimentación, la sostenibilidad y el desarrollo rural. A
              partir de esta visión global, se han creado{" "}
              <strong>capítulos nacionales</strong> en diferentes partes del
              mundo, con el objetivo de adaptar esta misión a los{" "}
              <strong>desafíos y oportunidades</strong> de cada contexto local.
            </p>

            <p>
              En este marco, el Capítulo Nacional de la Juventud del WFF Perú
              fue lanzado el 8 de abril en Lima, como un espacio de{" "}
              <strong>participación, incidencia y articulación</strong> para
              jóvenes interesados en contribuir a la transformación sostenible
              de los sistemas agroalimentarios del país.
            </p>

            <p>
              Perú es uno de los países con mayor <strong>biodiversidad</strong>{" "}
              del mundo, con ecosistemas que abarcan la Amazonía, los Andes y la
              costa del Pacífico. Esta riqueza natural y cultural sostiene
              sistemas agroalimentarios diversos y fundamentales para millones
              de personas. Sin embargo, el país también enfrenta importantes
              desafíos relacionados con el cambio climático, la seguridad
              alimentaria, la urbanización y las desigualdades territoriales.
            </p>

            <p>
              Frente a este contexto, el Capítulo busca{" "}
              <strong>empoderar a las juventudes peruanas</strong> como agentes
              de cambio, promoviendo iniciativas en áreas como{" "}
              <strong>políticas públicas</strong>, <strong>innovación</strong>,
              educación, comunicación, sostenibilidad y participación
              comunitaria. Asimismo, el trabajo del Capítulo se encuentra
              alineado con la{" "}
              <strong>Política Nacional de Juventud 2021–2030</strong> y cuenta
              con el apoyo de aliados estratégicos como la{" "}
              <strong>FAO Perú, el Ministerio de Desarrollo Agrario y
              Riego (MIDAGRI) y la Secretaría Nacional de la Juventud (SENAJU).</strong>
            </p>

            <p>
              A través de espacios de diálogo, capacitación, incidencia y
              colaboración, el Capítulo Nacional de la Juventud del WFF Perú
              trabaja para construir sistemas agroalimentarios más{" "}
              <strong>inclusivos, sostenibles y resilientes</strong>, colocando
              a las <strong>juventudes en el centro</strong> de la
              transformación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomosSection;
