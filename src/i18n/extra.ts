import type { Language } from "./translations";

/*
 * Textos de las funciones de Voces (lecturas, compartir, cuenta regresiva,
 * borrador y peso del envío). Se mantienen aparte del diccionario principal.
 */
export interface ExtraStrings {
  readOne: string;
  readMany: string;
  minRead: string;
  share: string;
  copyLink: string;
  copied: string;
  nativeShare: string;
  reasonTopic: string;
  reasonAuthor: string;
  reasonPopular: string;
  reasonRelated: string;
  opensIn: string;
  closesIn: string;
  openNow: string;
  lastDay: string;
  closesOn: string;
  opensOn: string;
  days: string;
  hours: string;
  minutes: string;
  draftRestored: string;
  draftImagesRemoved: string;
  draftDiscard: string;
  weightTitle: string;
  weightOf: string;
  weightOk: string;
  weightHigh: string;
  weightOver: string;
}

export const EXTRA: Record<Language, ExtraStrings> = {
  es: {
    readOne: "lectura",
    readMany: "lecturas",
    minRead: "{n} min de lectura",
    share: "Comparte este artículo",
    copyLink: "Copiar enlace",
    copied: "¡Enlace copiado!",
    nativeShare: "Compartir…",
    reasonTopic: "Mismo tema",
    reasonAuthor: "Mismo autor",
    reasonPopular: "Muy leído",
    reasonRelated: "Relacionado",
    opensIn: "La convocatoria abre en",
    closesIn: "La convocatoria cierra en",
    openNow: "Convocatoria abierta",
    lastDay: "¡Último día para enviar tu artículo!",
    closesOn: "Cierra el",
    opensOn: "Abre el",
    days: "días",
    hours: "horas",
    minutes: "min",
    draftRestored: "Recuperamos tu borrador guardado en este navegador.",
    draftImagesRemoved:
      "Por seguridad las imágenes y la fotografía no se guardan en el borrador: vuelve a subirlas ({n} en el texto).",
    draftDiscard: "Descartar borrador",
    weightTitle: "Peso estimado del envío",
    weightOf: "de",
    weightOk: "Tu envío está dentro del límite.",
    weightHigh:
      "Estás cerca del límite. Evita agregar más imágenes o usa imágenes más livianas (JPG o WebP).",
    weightOver:
      "Superas el límite. Elimina algunas imágenes o reduce su tamaño antes de enviar (squoosh.app, TinyPNG).",
  },
  en: {
    readOne: "read",
    readMany: "reads",
    minRead: "{n} min read",
    share: "Share this article",
    copyLink: "Copy link",
    copied: "Link copied!",
    nativeShare: "Share…",
    reasonTopic: "Same topic",
    reasonAuthor: "Same author",
    reasonPopular: "Most read",
    reasonRelated: "Related",
    opensIn: "The call opens in",
    closesIn: "The call closes in",
    openNow: "Call open",
    lastDay: "Last day to submit your article!",
    closesOn: "Closes on",
    opensOn: "Opens on",
    days: "days",
    hours: "hours",
    minutes: "min",
    draftRestored: "We recovered your draft saved in this browser.",
    draftImagesRemoved:
      "For safety, images and the photo are not saved in the draft: upload them again ({n} in the text).",
    draftDiscard: "Discard draft",
    weightTitle: "Estimated submission size",
    weightOf: "of",
    weightOk: "Your submission is within the limit.",
    weightHigh:
      "You are close to the limit. Avoid adding more images or use lighter ones (JPG or WebP).",
    weightOver:
      "You are over the limit. Remove some images or reduce their size before sending (squoosh.app, TinyPNG).",
  },
  it: {
    readOne: "lettura",
    readMany: "letture",
    minRead: "{n} min di lettura",
    share: "Condividi questo articolo",
    copyLink: "Copia il link",
    copied: "Link copiato!",
    nativeShare: "Condividi…",
    reasonTopic: "Stesso tema",
    reasonAuthor: "Stesso autore",
    reasonPopular: "Più letto",
    reasonRelated: "Correlato",
    opensIn: "La candidatura apre tra",
    closesIn: "La candidatura chiude tra",
    openNow: "Candidature aperte",
    lastDay: "Ultimo giorno per inviare il tuo articolo!",
    closesOn: "Chiude il",
    opensOn: "Apre il",
    days: "giorni",
    hours: "ore",
    minutes: "min",
    draftRestored: "Abbiamo recuperato la bozza salvata in questo browser.",
    draftImagesRemoved:
      "Per sicurezza immagini e foto non vengono salvate nella bozza: caricale di nuovo ({n} nel testo).",
    draftDiscard: "Elimina bozza",
    weightTitle: "Peso stimato dell'invio",
    weightOf: "di",
    weightOk: "Il tuo invio rientra nel limite.",
    weightHigh:
      "Sei vicino al limite. Evita di aggiungere altre immagini o usa immagini più leggere (JPG o WebP).",
    weightOver:
      "Hai superato il limite. Rimuovi alcune immagini o riducine le dimensioni prima di inviare (squoosh.app, TinyPNG).",
  },
  pt: {
    readOne: "leitura",
    readMany: "leituras",
    minRead: "{n} min de leitura",
    share: "Compartilhe este artigo",
    copyLink: "Copiar link",
    copied: "Link copiado!",
    nativeShare: "Compartilhar…",
    reasonTopic: "Mesmo tema",
    reasonAuthor: "Mesmo autor",
    reasonPopular: "Mais lido",
    reasonRelated: "Relacionado",
    opensIn: "A chamada abre em",
    closesIn: "A chamada fecha em",
    openNow: "Chamada aberta",
    lastDay: "Último dia para enviar seu artigo!",
    closesOn: "Fecha em",
    opensOn: "Abre em",
    days: "dias",
    hours: "horas",
    minutes: "min",
    draftRestored: "Recuperamos seu rascunho salvo neste navegador.",
    draftImagesRemoved:
      "Por segurança, imagens e foto não são salvas no rascunho: envie-as novamente ({n} no texto).",
    draftDiscard: "Descartar rascunho",
    weightTitle: "Peso estimado do envio",
    weightOf: "de",
    weightOk: "Seu envio está dentro do limite.",
    weightHigh:
      "Você está perto do limite. Evite adicionar mais imagens ou use imagens mais leves (JPG ou WebP).",
    weightOver:
      "Você ultrapassou o limite. Remova algumas imagens ou reduza o tamanho antes de enviar (squoosh.app, TinyPNG).",
  },
};
