import type { MouseEvent } from "react";

export interface HeroSlideViewProps {
  image: string;
  subtitle: string;
  title: string;
  buttonText: string;
  link: string;
  /** 0-80: opacidad de la capa oscura. */
  overlay?: number;
  /** En la vista previa del admin el botón no navega. */
  preview?: boolean;
}

/** Diapositiva del banner principal; la usan el sitio público y la vista previa del admin. */
export function HeroSlideView({ image, subtitle, title, buttonText, link, overlay = 50, preview = false }: HeroSlideViewProps) {
  const stop = preview ? (event: MouseEvent) => event.preventDefault() : undefined;

  return (
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
        src={image}
        alt={title}
        style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: `rgba(0, 0, 0, ${Math.min(80, Math.max(0, overlay)) / 100})`,
          zIndex: 1,
        }}
      />

      {(subtitle || title || (buttonText && link)) && (
        <div style={{ maxWidth: 900, zIndex: 2, padding: "0 20px", position: "absolute", textAlign: "center" }}>
          {subtitle && <h3 className="hero-subtitle">{subtitle.toUpperCase()}</h3>}
          {title && <h1 className="hero-title">{title}</h1>}
          {buttonText && link && (
            <a href={link} onClick={stop} {...(/^https?:/i.test(link) ? { rel: "noopener noreferrer" } : {})}>
              <button className="slider-btn" type="button">{buttonText.toUpperCase()}</button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
