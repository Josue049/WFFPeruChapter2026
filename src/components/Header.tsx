import { TopBar } from "./Header/TopBar";
import { NavBar } from "./Header/NavBar";
import HeroCarousel from "./Header/HeroCarousel";

type HeaderProps = {
  variant?: "carousel" | "static";
  title?: string;
  subtitle?: string;
  label?: string;
  backgroundImage?: string;
  backgroundAlign?: "center" | "top";
};

export function Header({
  variant = "carousel",
  title,
  subtitle,
  label,
  backgroundImage,
  backgroundAlign = "center",
}: HeaderProps) {
  return (
    <div className="bg-light">
      <TopBar />
      <NavBar />

      {variant === "carousel" ? (
        <HeroCarousel />
      ) : (
        <div
          className="container-fluid cabecera-other"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .5)), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition:
              backgroundAlign === "top" ? "center top" : "center center",
          }}
        >
          <div className="container">
            <div
              className="d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              {label && (
                <div className="d-inline-flex text-white">
                  <p className="m-0 text-uppercase">
                    <span className="text-white">{label}</span>
                  </p>
                </div>
              )}

              <h3 className="display-4 text-white text-uppercase text-center">
                {title}
              </h3>

              {subtitle && (
                <div className="d-inline-flex text-white">
                  <p className="m-0 text-uppercase">
                    <span>{subtitle}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
