import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useLanguage } from "../../i18n/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    subtitleKey: "home.slide1.subtitle" as const,
    titleKey: "home.slide1.title" as const,
    buttonKey: "home.slide1.button" as const,
    img: "img/comite.webp",
    link: "https://www.fao.org/peru/noticias/detail-events/en/c/1742822/",
  },
  {
    id: 2,
    subtitleKey: "home.slide2.subtitle" as const,
    titleKey: "home.slide2.title" as const,
    buttonKey: "home.slide2.button" as const,
    img: "img/Inauguracion.webp",
    link: "https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl",
  },
];

const HeroCarousel = () => {
  const { t } = useLanguage();

  return (
    <div className="hero-carousel" style={{ width: "100%" }}>
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 5000 }}
        loop={true}
        slidesPerView={1}
        spaceBetween={0}
        style={{ width: "100%", height: "auto" }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "auto",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                textAlign: "center",
              }}
            >
              <img
                src={slide.img}
                alt={t(slide.titleKey)}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  maxWidth: 900,
                  zIndex: 2,
                  padding: "0 20px",
                  position: "absolute",
                  textAlign: "center",
                }}
              >
                <h3 className="hero-subtitle">{t(slide.subtitleKey).toUpperCase()}</h3>
                <h1 className="hero-title">{t(slide.titleKey)}</h1>
                <a href={slide.link}>
                  <button className="slider-btn">{t(slide.buttonKey).toUpperCase()}</button>
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
