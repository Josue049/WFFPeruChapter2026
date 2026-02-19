import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    id: 1,
    subtitle: "Capítulo nacional del WFF",
    title: "Comite de coordinación 2026",
    btnText: "Ver Info",
    img: "img/comite.jpg",
  },
  {
    id: 2,
    subtitle: "Jóvenes peruanos por los sistemas agroalimentarios",
    title: "Únete al Capítulo Nacional",
    btnText: "UNIRME",
    img: "img/Inauguración.jpg",
  },
];

const HeroCarousel = () => {
  return (
    <div className="hero-carousel" style={{ width: "100%" }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={true}
        slidesPerView={1} // solo un slide visible
        spaceBetween={0} // sin espacio entre slides
        style={{ width: "100%", height: "auto" }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "auto",
                overflow: "hidden", // oculta cualquier desborde
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
                  width: "100%", // ocupa todo el ancho del contenedor
                  height: "auto", // mantiene proporción
                  objectFit: "contain",
                  display: "block",
                }}
              />

              {/* Overlay */}
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

              {/* Contenido */}
              <div
                style={{
                  maxWidth: 900,
                  zIndex: 2,
                  padding: "0 20px",
                  position: "absolute",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "300",
                    marginBottom: "30px",
                  }}
                >
                  {slide.subtitle.toUpperCase()}
                </h3>
                <h1 style={{ fontSize: "4.5rem", margin: "0 0 10px 0" }}>
                  {slide.title}
                </h1>
                <button
                  style={{
                    padding: "12px 24px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    backgroundColor: "#ff9a2b",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    transition: "background 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e88821")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ff9a2b")
                  }
                >
                  {slide.btnText.toUpperCase()}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
