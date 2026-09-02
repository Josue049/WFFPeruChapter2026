import type { FC } from "react";
import { Header } from "../components/Header";
import ImageCardsBlock from "../components/ImageCardsBlock";
import AccordionCards from "../components/AccordionCards";
import type { AccordionItem } from "../components/AccordionCards";
import AreasGrid from "../components/AreasGrid";
import CommiteSection from "../components/ComiteSection";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { useLanguage } from "../i18n/LanguageContext";

export const Inicio: FC = () => {
  const { t } = useLanguage();

  const wffItems: AccordionItem[] = [
    {
      id: 1,
      title: t("home.whatWff"),
      color: "#FFC107",
      content: t("home.whatWffText"),
    },
    {
      id: 2,
      title: t("home.vision"),
      color: "#5A9BD5",
      content: t("home.visionText"),
    },
    {
      id: 3,
      title: t("home.mission"),
      color: "#FF8A8A",
      content: t("home.missionText"),
    },
  ];

  return (
    <>
      <Header />

      <ImageCardsBlock
        eyebrow={t("home.knowUs")}
        title={t("home.whatChapter")}
        description={t("home.chapterDescription")}
        mainImage="/img/BloquesONU.webp"
        cards={[
          { image: "/img/tarjetas1.webp", alt: "WFF activity 1" },
          { image: "/img/tarjetas2.webp", alt: "WFF activity 2" },
        ]}
      />

      <AccordionCards items={wffItems} />
      <AreasGrid />
      <CommiteSection />
      <ScrollTopButton />
    </>
  );
};

export default Inicio;
