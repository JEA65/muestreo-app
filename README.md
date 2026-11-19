# Muestreo · ADA

Primera versión local, 19 de noviembre de 2026. Aplicación separada de SEBA F1. No modifica ni envía datos al servicio de aforos.

## Abrir en esta PC

Con Node.js instalado, ejecutar `npm start` dentro de esta carpeta y abrir **http://127.0.0.1:4173**. También se puede abrir `Iniciar app.cmd` con doble clic y mantener esa ventana abierta. Usar siempre la misma dirección: localhost y 127.0.0.1 tienen almacenamientos distintos.

No abrir index.html con doble clic: los módulos, el almacenamiento y el modo sin conexión necesitan un servidor web.

## Implementado

- Formulario adaptable al celular en cinco pasos: sitio, mediciones, ambiente, fotos y revisión.
- pH, conductividad, SDT, turbiedad y oxígeno disuelto. Unidades seleccionables y estados sin completar, medido, no medido y equipo no disponible. Acepta coma decimal.
- Secciones ambientales basadas en las dos fichas de referencia. No se completan opciones automáticamente como «No».
- GPS con captura de coordenadas, precisión y momento de captura; alternativa manual.
- Hasta dos imágenes, optimizadas a JPEG de hasta 1600 px y guardadas con el registro. No se conserva el original completo en la app; permanece en la galería si ya existía allí.
- IndexedDB para registros, fotos y un borrador activo; identificadores únicos y revisiones para posteriores sincronizaciones.
- Nuevo punto conserva campaña, observadores y equipo, pero no arrastra mediciones ni ubicación del punto anterior.
- Historial, búsqueda, edición y respaldo JSON de registros guardados, incluyendo fotos.
- Vista de ficha con identificación, mediciones, fotografías y solo los campos ambientales completados; impresión o guardado PDF mediante el diálogo del navegador.
- Service worker con recursos locales para reabrir y operar sin acceso al servidor después de la primera carga completa.

## Estado y límites

**Google Sheets, Drive, envío automático y generación de PDF en la nube todavía no están conectados.** La interfaz lo indica; ningún registro se etiqueta como sincronizado.

Esta es una base de desarrollo, no una versión lista para campaña real. Se debe descargar respaldo antes de limpiar datos del navegador. El respaldo es JSON; la restauración desde la interfaz aún no está implementada. El borrador se conserva localmente, pero no se incluye en el respaldo de registros guardados.

La PWA debe publicarse en HTTPS para instalarla y usar GPS en un celular. Esta dirección local solo sirve en esta PC. La instalación, permisos GPS, cámara y almacenamiento deben verificarse en los teléfonos reales antes de la campaña. En iPhone el acceso a cámara/galería depende de la interfaz del sistema. No se garantiza sincronización con la app cerrada.

El PDF actual se guarda manualmente desde el navegador. La paginación final debe validarse con registros completos y fotos del sitio; no es todavía una plantilla institucional aprobada. Se incorporó el logo de ADA proporcionado por el usuario. No se incorporaron clasificaciones de calidad de agua.

## Próxima etapa: Google

1. Definir cuenta propietaria y carpeta de campañas en Drive, planilla de datos y personas con acceso de lectura.
2. Implementar un servicio autenticado de recepción. No usar una URL pública sin autorización para escribir en Drive. No poner credenciales privadas en el código del navegador.
3. Sincronizar por `id` y `revision`, conservar copia local y confirmar datos, fotos y PDF antes de marcar la revisión como sincronizada.
4. Si se corta la conexión, reintentar solo revisiones sin confirmación. El servidor debe deduplicar cada identificador y revisión y responder los enlaces verificados de los archivos.
5. Si se edita un registro durante un envío, confirmar únicamente la revisión enviada; la nueva debe seguir pendiente. Resolver conflictos entre dispositivos explícitamente.
6. Generar una ficha PDF con formato fijo en Drive y una fila con enlaces en Sheets. Dirección verá únicamente las revisiones que terminaron de subir, con hora del relevamiento y hora de sincronización diferenciadas.

Apps Script es una opción compatible con el proyecto anterior, pero su implementación no está en aquel repositorio y se debe configurar un servicio separado. La autenticación y los permisos de Google se completan con la cuenta elegida por el usuario.

## Archivos

- `core.js`: esquema ambiental, parámetros, validación e identidad de registros.
- `db.js`: persistencia en IndexedDB.
- `app.js`: formularios, fotos, GPS, historial, respaldo y ficha imprimible.
- `style.css`: interfaz móvil y formato de impresión A4.
- `sw.js` / `manifest.webmanifest`: base de funcionamiento offline e instalación.
- `server.mjs`: servidor de prueba limitado a los archivos de la app, solo en loopback.

## Verificación

`npm run check` verifica sintaxis. `npm test` ejecuta pruebas con Node, sin instalar dependencias.

Se verificaron en navegador dos registros independientes, cinco valores con coma decimal, dos fotos, recuperación al recargar y creación del segundo punto con el servidor detenido. La prueba con servidor detenido comprueba la caché de la app y el guardado local; no sustituye la prueba de modo avión en un teléfono. Datos de demostración identificados como DEMO-01 y DEMO-02, sin datos de campaña reales.

## Ajustes de identidad y lectura de campo

Nombre de instalación: Muestreo. Logo ADA original en encabezado, ficha e íconos PNG. Fondo blanco, texto oscuro y controles con bordes marcados. La caracterización omite filas y secciones vacías y conserva respuestas explícitas como No y No observado. Se eliminó el salto de página obligatorio de esa sección. Nueve pruebas de lógica aprobadas y revisión visual a 390 px. La legibilidad bajo sol y la apariencia del lanzador se deben comprobar en el teléfono real.

