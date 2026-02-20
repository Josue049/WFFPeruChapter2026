import fs from "fs";
import fetch from "node-fetch";
import { parse } from "csv-parse/sync";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT9HrLDoonMRE6eOhkfFqGQjyWrx20IOutUg-DfSW1iLpsxt69TNauW2snwBGuhMyUyLToVN3gUciiP/pub?gid=1779952858&single=true&output=csv";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function parseDate(value) {
  if (!value) return new Date().toISOString();

  // Formato típico Google Sheets: dd/mm/yyyy
  const parts = value.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const isoDate = new Date(`${year}-${month}-${day}`);
    return isNaN(isoDate) ? new Date().toISOString() : isoDate.toISOString();
  }

  const date = new Date(value);
  return isNaN(date) ? new Date().toISOString() : date.toISOString();
}

async function generate() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    const articles = records.map((row, index) => {
      const title = row["Nombre del Articulo"] || "sin-titulo";

      const rawDate =
        row[
          "Fecha de publicación | (Poner la fecha de hoy) para marcar el día en que se sube"
        ];

      return {
        id: index + 1,
        title,
        slug: slugify(title),

        subtitle: row["Frase subtitulo del Articulo"] || "",

        date: parseDate(rawDate),

        author: {
          name:
            row["Nombre y Apellido del autor del articulo"] || "",
          role:
            row["Cargo o descripción del autor del articulo"] || "",
          photo:
            row["Subir foto del autor del articulo"] || "",
        },

        content: row["Articulo Completo"] || "",
      };
    });

    fs.mkdirSync("./public/data", { recursive: true });

    fs.writeFileSync(
      "./public/data/voces.json",
      JSON.stringify(articles, null, 2)
    );

    console.log("voces.json generado correctamente");
  } catch (error) {
    console.error("Error generando voces.json:", error);
  }
}

generate();
