import React from "react";
import styles from "./SplitHeroSection.module.css";

type Props = {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
};

const SplitHeroSection: React.FC<Props> = ({
  title = "Modelo de Estructura del Comité de Coordinación Nacional",
  imageSrc = "/img/Estructura.webp",
  imageAlt = "Panel de jóvenes participando en evento ICARRD+20",
}) => {
  return (
    <section className={styles.section} aria-label="Split hero">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.left}>
            <h1 className={styles.title}>{title}</h1>
          </div>

          <div className={styles.right}>
            <img src={imageSrc} alt={imageAlt} className={styles.image} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitHeroSection;
