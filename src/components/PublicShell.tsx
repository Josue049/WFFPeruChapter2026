import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { NavBarFixed } from "./Header/NavBarFixed";
import { ScrollToTop } from "./ScrollToTop";
import styles from "./PublicShell.module.css";

export function PublicShell() {
  const [showFixedNavigation, setShowFixedNavigation] = useState(false);

  useEffect(() => {
    const container = document.getElementById("main-scroll");
    if (!container) return;

    const handleScroll = () => {
      setShowFixedNavigation(container.scrollTop > 150);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ScrollToTop />
      <div
        className={`${styles.fixedNavigation} ${showFixedNavigation ? styles.visible : ""}`}
      >
        <NavBarFixed />
      </div>
      <Layout />
    </>
  );
}
