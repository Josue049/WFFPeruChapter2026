import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useLanguage } from "../../i18n/LanguageContext";
import { apiRequest } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import type { HeroSlide } from "../../types";
import { HeroSlideView } from "./HeroSlideView";

import "swiper/css";
import "swiper/css/navigation";

// Banners predeterminados: se usan solo mientras el admin no haya creado ninguno.
const DEFAULT_SLIDES = [
  {
    id: 1,
    subtitleKey: "home.slide1.subtitle" as const,
    titleKey: "home.slide1.title" as const,
    buttonKey: "home.slide1.button" as const,
    img: "/img/comite.webp",
    link: "https://www.fao.org/peru/noticias/detail-events/en/c/1742822/",
  },
  {
    id: 2,
    subtitleKey: "home.slide2.subtitle" as const,
    titleKey: "home.slide2.title" as const,
    buttonKey: "home.slide2.button" as const,
    img: "/img/Inauguracion.webp",
    link: "https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl",
  },
];

const CACHE_KEY = "wff.heroSlides.v1";

function readCache(): HeroSlide[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as HeroSlide[]) : null;
  } catch {
    return null;
  }
}

function writeCache(slides: HeroSlide[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(slides));
  } catch {
    // El almacenamiento puede estar bloqueado; el banner sigue funcionando.
  }
}

const HeroCarousel = () => {
  const { t, language } = useLanguage();
  // `null` = todavía no se sabe qué banners hay (evita parpadeo del predeterminado).
  const [slides, setSlides] = useState<HeroSlide[] | null>(() => readCache());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<HeroSlide[]>("/hero-slides")
      .then((result) => {
        if (!active) return;
        setSlides(result);
        writeCache(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const custom = useMemo(() => (slides && slides.length > 0 ? slides : null), [slides]);
  const useDefaults = !custom && (slides !== null || failed);
  const count = custom ? custom.length : DEFAULT_SLIDES.length;
  const many = count > 1;

  if (!custom && !useDefaults) {
    // Reserva el espacio del banner (proporción de las imágenes actuales).
    return <div className="hero-carousel" style={{ width: "100%", aspectRatio: "2048 / 1155", background: "#1f1f1f" }} aria-hidden="true" />;
  }

  const english = language === "en";

  return (
    <div className="hero-carousel" style={{ width: "100%" }}>
      <Swiper
        key={custom ? custom.map((slide) => `${slide.id}-${slide.updated_at}`).join("|") : "default"}
        modules={[Navigation, Autoplay]}
        navigation={many}
        autoplay={many ? { delay: 5000 } : false}
        loop={many}
        allowTouchMove={many}
        slidesPerView={1}
        spaceBetween={0}
        style={{ width: "100%", height: "auto" }}
      >
        {custom
          ? custom.map((slide) => (
              <SwiperSlide key={slide.id}>
                <HeroSlideView
                  image={mediaUrl(slide.image)}
                  subtitle={(english && slide.subtitle_en) || slide.subtitle}
                  title={(english && slide.title_en) || slide.title}
                  buttonText={(english && slide.button_text_en) || slide.button_text}
                  link={slide.link_url}
                  overlay={slide.overlay}
                />
              </SwiperSlide>
            ))
          : DEFAULT_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <HeroSlideView
                  image={slide.img}
                  subtitle={t(slide.subtitleKey)}
                  title={t(slide.titleKey)}
                  buttonText={t(slide.buttonKey)}
                  link={slide.link}
                />
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
