import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    subtitle: "Capítulo nacional del WFF",
    title: "Comite de coordinación 2026",
    btnText: "Ver Info",
    img: "img/comite.jpg",
    link: "https://www.fao.org/peru/noticias/detail-events/en/c/1742822/",
  },
  {
    id: 2,
    subtitle: "Jóvenes peruanos por los sistemas agroalimentarios",
    title: "Únete al Capítulo Nacional",
    btnText: "UNIRME",
    img: "img/Inauguración.jpg",
    link: "https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl",
  },
];

const HeroCarousel = () => {
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
                alt={slide.title}
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
                <h3 className="hero-subtitle">
                  {slide.subtitle.toUpperCase()}
                </h3>

                <h1 className="hero-title">{slide.title}</h1>

                <a href={slide.link}>
                  <button className="slider-btn">
                    {slide.btnText.toUpperCase()}
                  </button>
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