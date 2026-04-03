# Capturas y demos - Monte Sion App

Este archivo define qué capturar, cómo capturarlo y qué texto acompañará cada evidencia visual del portafolio.

## Reglas antes de capturar

1. Usa la misma resolución para todo el set, idealmente 1440x900 o 1920x1080.
2. Oculta correos reales, tokens, IDs internos y datos de producción.
3. Captura con el mismo tema visual en toda la serie, salvo que muestres claro y oscuro como comparación.
4. Nombra los archivos con un prefijo consistente, por ejemplo `01-landing.png`, `02-login.png`, `03-admin.png`.
5. Si la vista depende de datos, prepara un entorno con contenido de prueba estable.

## 1. Landing

### Qué capturar

1. Abre la ruta pública principal.
2. Verifica que se vea el hero, navegación y CTA.
3. Haz una captura de escritorio.
4. Baja un poco la página si quieres mostrar secciones secundarias.

### Mini demo o GIF

1. Graba 8 a 12 segundos.
2. Muestra entrada a la landing, scroll corto y clic en el CTA principal.
3. Cierra el clip con una transición hacia login o registro.

### Títulos y descripciones

- Título: `Landing pública de Monte Sion App`
- Descripción: `Vista de entrada con navegación, propuesta de valor y acceso rápido a las funciones principales.`
- Título: `Home responsive y orientada a conversión`
- Descripción: `La pantalla principal resume la propuesta del producto y guía al usuario hacia autenticación o contenido clave.`

## 2. Login

### Qué capturar

1. Entra a la página de inicio de sesión.
2. Completa email y contraseña de prueba.
3. Captura el formulario en estado antes de enviar.
4. Captura la vista de éxito después del acceso, si el flujo redirige correctamente.

### Mini demo o GIF

1. Graba la escritura de credenciales de ejemplo.
2. Envía el formulario y deja visible la redirección o estado de sesión.
3. Si existe error de validación, muestra un intento inválido breve.

### Títulos y descripciones

- Título: `Autenticación segura con Supabase`
- Descripción: `Formulario de acceso con validación y control de sesión para usuarios registrados.`
- Título: `Ingreso exitoso al sistema`
- Descripción: `Flujo de login con redirección al área autenticada después de validar credenciales.`

## 3. Panel admin

### Qué capturar

1. Abre el panel administrativo con un usuario de rol admin.
2. Captura el dashboard principal con métricas y navegación lateral.
3. Captura la gestión de usuarios.
4. Captura el módulo de auditoría o peticiones, si aporta más contexto.

### Mini demo o GIF

1. Abre el panel principal.
2. Cambia entre usuarios, auditoría y contenido en una sola grabación.
3. Muestra una acción de administración, por ejemplo cambio de estado o filtro.

### Títulos y descripciones

- Título: `Panel administrativo con control operativo`
- Descripción: `Dashboard para gestionar usuarios, revisar actividad y administrar módulos internos.`
- Título: `Gestión de usuarios y permisos`
- Descripción: `Vista centrada en roles, acceso y administración de cuentas.`

## 4. Chat

### Qué capturar

1. Entra al chat autenticado.
2. Envía una pregunta breve y esperas la respuesta.
3. Captura el historial y el mensaje más reciente.
4. Si la interfaz muestra advertencia de uso, inclúyela.

### Mini demo o GIF

1. Graba 10 a 15 segundos.
2. Escribe una pregunta realista.
3. Deja que aparezca la respuesta y el historial actualizado.
4. Si el flujo usa IA, muestra una interacción simple y natural.

### Títulos y descripciones

- Título: `Chat asistido en tiempo real`
- Descripción: `Interfaz conversacional con historial y respuesta contextual para la comunidad.`
- Título: `Asistente digital de Monte Sion`
- Descripción: `Canal de conversación para soporte espiritual y orientación dentro de la plataforma.`

## 5. Peticiones de oración

### Qué capturar

1. Abre el formulario de petición.
2. Llena nombre, correo y contenido de la solicitud.
3. Captura el formulario antes de enviar.
4. Captura el mensaje de confirmación o el estado generado.

### Mini demo o GIF

1. Graba el llenado del formulario en tiempo real.
2. Muestra validación si un campo obligatorio falta.
3. Envía la petición y deja visible el resultado final.

### Títulos y descripciones

- Título: `Formulario de petición de oración`
- Descripción: `Flujo validado para compartir necesidades espirituales de forma clara y ordenada.`
- Título: `Registro y seguimiento de peticiones`
- Descripción: `La experiencia permite enviar, revisar y dar seguimiento a solicitudes con seguridad.`

## 6. Cómo armar el paquete final

1. Selecciona una captura principal por funcionalidad.
2. Añade un GIF o video corto por flujo crítico.
3. Escribe una frase de contexto por imagen.
4. Revisa que todas las capturas usen el mismo estilo visual.
5. Sube los archivos a `docs/screenshots/` o `public/screenshots/` y enlázalos desde el README.

## Formato sugerido para el README

```md
![Landing pública](./docs/screenshots/01-landing.png)
![Login exitoso](./docs/screenshots/02-login.png)
![Panel admin](./docs/screenshots/03-admin.png)
```

## Herramientas recomendadas

- Captura rápida en Windows: Snipping Tool o Greenshot.
- Grabación de demo: OBS Studio, Loom o ScreenToGif.
- Edición ligera: Figma, Excalidraw o Draw.io.
- Compresión: TinyPNG o Squoosh.

## Nota final

Prioriza capturas que demuestren valor funcional, no solo estética. Una buena evidencia visual muestra una acción completa, el resultado esperado y el nivel de calidad del producto.
