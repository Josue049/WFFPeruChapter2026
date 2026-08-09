# Frontend - Auditoría y postulaciones de Voces

## Público
- `/voces` incluye el botón **Envía tu artículo**.
- `/voces/enviar` permite cargar fotografía, datos del autor y el artículo.
- La foto se envía a `POST /article-submissions/media`.
- La postulación se envía a `POST /article-submissions` y queda pendiente de revisión.

## Administración / Voces
La sección Voces ahora tiene dos vistas:
- **Artículos**: editor existente.
- **Postulaciones**: lista, filtros, corrección editorial, notas internas, rechazo y **Aprobar y publicar**.

## Administración / Actividad
Las cuentas con `manage_users=true` ven una sección **Actividad** que consume `GET /audit-logs` y muestra usuario, fecha, acción, módulo y los snapshots antes/después.
