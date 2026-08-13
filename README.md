# Frontend WFF Perú

React + TypeScript + Vite preparado para Vercel.

## Configuración

```bash
cp .env.example .env.local
npm ci
npm run dev
```

```env
VITE_API_URL=https://api.wffperuchapter.page
```

## Rutas nuevas

- `/hitos`
- `/hitos/:slug`
- `/voluntarios-destacados`
- `/voluntarios-destacados/:slug`

## Administración

`/admin` muestra únicamente los módulos autorizados por la API. Las imágenes pueden subirse desde cada editor y se alojan en la VPS. La función `mediaUrl` convierte las rutas `/uploads/...` en URLs del dominio de la API.

## Verificación

```bash
npm run check
```

Vercel utiliza `vercel.json` para devolver la aplicación SPA en rutas profundas.
