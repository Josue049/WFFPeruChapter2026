import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

interface ArticleViewsSummary {
  article_id: number;
  views: number;
}

/** Lecturas de todos los artículos publicados (una sola petición). */
export function useArticleViews(): Map<number, number> {
  const [views, setViews] = useState<Map<number, number>>(() => new Map());

  useEffect(() => {
    let active = true;

    apiRequest<ArticleViewsSummary[]>("/article-views")
      .then((rows) => {
        if (active) setViews(new Map(rows.map((row) => [row.article_id, row.views])));
      })
      .catch(() => {
        // Sin el resumen la web funciona igual: solo se omiten los contadores.
      });

    return () => {
      active = false;
    };
  }, []);

  return views;
}
