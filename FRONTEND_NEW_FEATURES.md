# Frontend - Auditoría y postulaciones de Voces

## Público
- `/voces` incluye el botón **Envía tu artículo**.
- `/voces/enviar` permite cargar fotografía, datos del autor y el artículo.
- La postulación completa se envía a `POST /article-submissions` como `multipart/form-data`.
- La fotografía del autor y las imágenes insertadas en el editor se optimizan en el navegador y se envían junto con la metadata en una sola operación.
- La postulación queda en estado `pending` hasta la revisión editorial.

## Administración / Voces
La sección Voces ahora tiene dos vistas:
- **Artículos**: editor existente.
- **Postulaciones**: lista, filtros, corrección editorial, notas internas, rechazo y **Aprobar y publicar**.

## Administración / Actividad
Las cuentas con `manage_users=true` ven una sección **Actividad** que consume `GET /audit-logs` y muestra usuario, fecha, acción, módulo y los snapshots antes/después.

- Las postulaciones ahora registran si el autor declara ser miembro del capítulo y validan foto cuadrada de máximo 640 × 640 px.
- La línea de tiempo de Hitos se ordena por fecha del evento, del más reciente al más antiguo.
