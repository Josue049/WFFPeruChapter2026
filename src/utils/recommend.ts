import type { Article } from "../types/article";

export interface Recommendation {
  article: Article;
  score: number;
}

const STOPWORDS = new Set(
  (
    // es
    "para como pero este esta estos estas entre sobre desde hasta cuando donde porque tambien mas muy sus los las una uno unos unas del que con por han hay ser son fue era todo todos todas ademas cada puede pueden tiene tienen nuestro nuestra nuestros nuestras hacer parte forma otros otras mismo misma asi aqui alli luego antes despues durante esto eso estas esos ellos ellas ante bajo sin sido siendo cual cuales quien quienes " +
    // en
    "the and for with that this from have has had are was were been will would could should their there about into over under more most than then them they what which when where while also such these those your you our not but can all any each other some " +
    // it
    "che con per una uno gli del della dei delle nel nella sono come anche questo questa questi queste essere stato hanno loro tutti tutte piu ogni altri altre " +
    // pt
    "para como mas isso esta este esses essas uma uns umas dos das nos nas com por foram ser sao tem tambem muito mais sobre entre ate quando onde porque cada outros outras mesmo"
  ).split(" "),
);

const stripHtml = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ");

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word) && !/^\d+$/.test(word))
    // Normalización mínima de plurales para que "jovenes" ~ "joven".
    .map((word) => (word.length > 5 && word.endsWith("es") ? word.slice(0, -2) : word.endsWith("s") ? word.slice(0, -1) : word));
}

/** Frecuencia de términos ponderada: título x3, resumen x2, cuerpo x1. */
function termFrequencies(article: Article): Map<string, number> {
  const weights: Array<[string, number]> = [
    [article.title ?? "", 3],
    [article.subtitle ?? "", 2],
    [stripHtml(article.body ?? ""), 1],
  ];
  const frequencies = new Map<string, number>();
  for (const [text, weight] of weights) {
    for (const token of tokenize(text)) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + weight);
    }
  }
  return frequencies;
}

function buildVectors(articles: Article[]) {
  const documents = articles.map(termFrequencies);
  const documentFrequency = new Map<string, number>();
  for (const frequencies of documents) {
    for (const term of frequencies.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const total = articles.length;
  return documents.map((frequencies) => {
    const vector = new Map<string, number>();
    let norm = 0;
    for (const [term, count] of frequencies) {
      const idf = Math.log((total + 1) / ((documentFrequency.get(term) ?? 0) + 1)) + 1;
      const weight = (1 + Math.log(count)) * idf;
      vector.set(term, weight);
      norm += weight * weight;
    }
    return { vector, norm: Math.sqrt(norm) || 1 };
  });
}

function cosine(
  a: { vector: Map<string, number>; norm: number },
  b: { vector: Map<string, number>; norm: number },
) {
  const [small, large] = a.vector.size <= b.vector.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, weight] of small.vector) {
    const other = large.vector.get(term);
    if (other) dot += weight * other;
  }
  return dot / (a.norm * b.norm);
}

const authorKey = (article: Article) =>
  `${article.author_name} ${article.author_lastname}`.trim().toLowerCase();

/**
 * Recomienda artículos combinando: similitud de contenido (TF-IDF), mismo
 * tema (etiqueta), mismo autor, popularidad (lecturas) y frescura.
 */
export function recommendArticles(
  current: Article,
  all: Article[],
  views: Map<number, number>,
  limit = 3,
): Recommendation[] {
  const pool = all.filter((article) => article.id !== current.id);
  if (pool.length === 0) return [];

  const corpus = [current, ...pool];
  const vectors = buildVectors(corpus);
  const currentVector = vectors[0];

  const maxViews = Math.max(1, ...pool.map((article) => views.get(article.id) ?? 0));
  const now = Date.now();

  const scored = pool.map((article, index) => {
    const similarity = cosine(currentVector, vectors[index + 1]);
    const sameTag = current.tag_id !== null && article.tag_id === current.tag_id;
    const sameAuthor = authorKey(article) === authorKey(current);
    const popularity = Math.log(1 + (views.get(article.id) ?? 0)) / Math.log(1 + maxViews);
    const ageDays = Math.max(0, (now - new Date(article.date).getTime()) / 86_400_000);
    const freshness = Math.exp(-ageDays / 180);

    const parts = {
      related: similarity * 6,
      topic: sameTag ? 2 : 0,
      author: sameAuthor ? 0.8 : 0,
      popular: popularity * 0.8,
      fresh: freshness * 0.6,
    };
    const score = parts.related + parts.topic + parts.author + parts.popular + parts.fresh;

    return { article, score };
  });

  // Selección voraz: penaliza repetir el mismo autor para dar variedad.
  const picked: Recommendation[] = [];
  const remaining = [...scored];
  while (picked.length < limit && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    remaining.forEach((candidate, index) => {
      const repeats = picked.filter(
        (item) => authorKey(item.article) === authorKey(candidate.article),
      ).length;
      const adjusted = candidate.score - repeats * 0.6;
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIndex = index;
      }
    });
    picked.push(remaining.splice(bestIndex, 1)[0]);
  }

  return picked;
}
