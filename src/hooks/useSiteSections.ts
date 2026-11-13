import { useContext } from "react";
import { SiteSectionsContext } from "../config/siteSections";

export function useSiteSections() {
  return useContext(SiteSectionsContext);
}
