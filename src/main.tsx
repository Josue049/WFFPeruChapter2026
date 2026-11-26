import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SiteSectionsProvider } from "./components/SiteSectionsProvider";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <SiteSectionsProvider>
        <App />
      </SiteSectionsProvider>
      <Analytics />
    </LanguageProvider>
  </StrictMode>,
);