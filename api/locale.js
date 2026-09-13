export default function handler(request, response) {
  const rawCountry = request.headers["x-vercel-ip-country"];
  const country = Array.isArray(rawCountry) ? rawCountry[0] : rawCountry;

  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.status(200).json({
    country: typeof country === "string" && country ? country.toUpperCase() : "XX",
  });
}
