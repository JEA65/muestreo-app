# Muestreo · ADA

Aplicación de campo para registrar identificación del sitio, mediciones, caracterización ambiental y hasta dos fotos. Publicación: https://jea65.github.io/muestreo-app/

## Versión 0.4

Identificación por cuenca y sitio de muestreo único, cuerpo/curso de agua, localidad/partido, observadores, fecha y hora. Los campos retirados se conservan en los registros históricos.

Las fotos incorporan una franja inferior con ADA · Depto. Preservación y los datos disponibles al adjuntarlas. Si se corrigen esos datos, volver a adjuntar la foto. La imagen original no queda tapada.

La ficha PDF usa el contenido de la vista previa, con logo, fotos sin deformación y solo las observaciones ambientales completadas. El generador se incluye en la caché para trabajar sin conexión.

Los registros se guardan en IndexedDB. La sincronización con la app abierta envía datos, fotos y PDF a Apps Script, Drive y Sheets. Cada equipo se activa con su QR privado. Nunca publicar las claves de los equipos ni incluirlas en el repositorio.

Carpetas: Cuenca · Sitio, con campaña anterior como alternativa para registros históricos. La identidad interna y el equipo propietario se conservan para reintentos sin duplicados.

## Desarrollo y publicación

Node.js 24. Ejecutar `npm ci`, `npm run check`, `npm test` y `node build.mjs`. `npm start` abre el servidor en http://127.0.0.1:4173. El flujo de GitHub Actions publica `dist/` cuando se actualiza `main`.

Apps Script: concatenar `google/Code.gs` y `google/Schema.gs` en Código.gs, guardar y actualizar la implementación existente con una nueva versión, conservando URL y permisos. `actualizarNombresCarpetas` migra los nombres históricos sin cambiar enlaces.

## Uso en campo

Abrir la app con conexión antes de salir y verificar el aviso de disponibilidad sin conexión. Descargar respaldos JSON antes de limpiar el navegador. Los permisos de GPS, cámara y funcionamiento en modo avión deben comprobarse en los teléfonos reales. No se garantiza sincronización con la app cerrada.

En Mis registros, «Quitar del dispositivo» elimina solo la copia local después de confirmar datos, fotos y PDF de la última revisión. Drive y Sheets se conservan. Los registros pendientes y aquellos con un borrador asociado no se pueden quitar. La comprobación se repite en una transacción antes de borrar, para proteger cambios de otras pestañas.
