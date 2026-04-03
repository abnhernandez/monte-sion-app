# ❓ Preguntas Frecuentes (FAQ)

Respuestas a las preguntas más comunes sobre Monte Sion App.

## 📋 General

### ¿Qué es Monte Sion App?

Monte Sion App es una plataforma web moderna diseñada para comunidades cristianas. Ofrece herramientas para el estudio bíblico, oración comunitaria, gestión de eventos, y mucho más.

### ¿Es gratuito?

Sí, Montesión App es completamente gratuito y de código abierto bajo licencia Apache 2.0. Puedes usarlo, modificarlo y distribuirlo libremente bajo los términos de la licencia.

### ¿Necesito conocimientos técnicos para usarlo?

- **Para usuarios**: No, la interfaz es intuitiva y fácil de usar.
- **Para administradores**: Se recomienda conocimiento básico de tecnología.
- **Para desarrolladores**: Se requiere conocimiento de JavaScript/TypeScript y React.

## 🛠️ Instalación y Configuración

### ¿Qué necesito para instalar Montesión App?

- Node.js 18 o superior
- Una cuenta gratuita de Supabase
- (Opcional) API key de OpenAI para funcionalidades de IA

Consulta la [Guía de Inicio Rápido](QUICKSTART.md) para instrucciones detalladas.

### ¿Cuánto cuesta el hosting?

- **Desarrollo local**: Gratis
- **Vercel**: Plan gratuito disponible (suficiente para proyectos pequeños)
- **Supabase**: Plan gratuito incluye 500MB de base de datos y 1GB de almacenamiento
- **Producción**: Puede variar según tráfico, típicamente $0-50/mes para comunidades pequeñas

### ¿Puedo usar otra base de datos en lugar de Supabase?

Actualmente, la app está optimizada para Supabase. Migrar a otro backend requeriría cambios significativos en el código.

### ¿Cómo actualizo a la última versión?

```bash
git pull origin main
npm install
npm run build
```

Revisa el [CHANGELOG.md](CHANGELOG.md) para cambios importantes.

## 🔐 Seguridad y Privacidad

### ¿Es segura la aplicación?

Sí, implementamos las mejores prácticas de seguridad:
- Autenticación segura con Supabase
- Row Level Security en la base de datos
- Validación de inputs
- Protección contra XSS y CSRF
- Conexión HTTPS

### ¿Dónde se almacenan los datos?

Los datos se almacenan en Supabase (PostgreSQL) en servidores seguros. Puedes elegir la región de tu proyecto Supabase.

### ¿Puedo exportar mis datos?

Sí, el panel de administración incluye herramientas de exportación a Excel, CSV y PDF.

### ¿Cómo manejo información sensible?

Nunca compartas las claves de API en el código. Usa variables de entorno y `.env.local` (que está en `.gitignore`).

## 👥 Usuarios y Roles

### ¿Qué roles existen?

- **Usuario**: Acceso a lecciones, chat, peticiones
- **Administrador**: Acceso completo, gestión de usuarios y contenido

### ¿Cómo creo un administrador?

Ejecuta este SQL en Supabase después de que el usuario se registre:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-id-aqui';
```

### ¿Puedo tener múltiples administradores?

Sí, puedes asignar el rol de admin a tantos usuarios como necesites.

## 📖 Contenido

### ¿Cómo añado lecciones bíblicas?

Desde el panel de administración:
1. Ve a Admin → Bible → Lessons
2. Clic en "Nueva Lección"
3. Completa el formulario
4. Publica la lección

### ¿Puedo importar contenido de otra plataforma?

Actualmente no hay importación automática, pero puedes:
- Copiar y pegar contenido
- Usar la API para importación programática
- Contactarnos para asistencia

### ¿Soporta contenido multimedia?

Sí:
- Imágenes (PNG, JPG, GIF)
- Videos (YouTube, Vimeo embeds)
- Audio (integración con Spotify)
- PDFs (descargables)

## 💬 Chat y Comunicación

### ¿El chat es en tiempo real?

Sí, usa Supabase Realtime para mensajes instantáneos.

### ¿Cómo funciona el chat con IA?

Integra OpenAI GPT para responder preguntas sobre la Biblia y fe cristiana. Requiere una API key de OpenAI.

### ¿Puedo moderar el chat?

Sí, los administradores pueden:
- Eliminar mensajes
- Ver logs de chat
- Silenciar usuarios (funcionalidad futura)

## 📱 Móvil y PWA

### ¿Hay una app móvil nativa?

No, pero la aplicación es una PWA (Progressive Web App) que funciona como app nativa:
- Instalable en iOS y Android
- Funciona offline
- Notificaciones push
- Icono en pantalla de inicio

### ¿Cómo instalo la PWA?

**En Chrome (Android/Desktop)**:
1. Abre la app en el navegador
2. Menú → "Instalar app" o "Agregar a pantalla de inicio"

**En Safari (iOS)**:
1. Abre la app en Safari
2. Botón Compartir → "Agregar a pantalla de inicio"

## 🐛 Problemas Comunes

### La app no carga después de actualizar

```bash
# Limpia cache y reinstala dependencias
npm run clean
npm install
npm run dev
```

### "Error de Supabase" al hacer login

Verifica que:
- Las credenciales en `.env.local` son correctas
- El proyecto de Supabase está activo
- Has ejecutado todos los scripts SQL

### Las lecciones no se muestran

1. Verifica que las tablas existen en Supabase
2. Revisa que hay contenido en la tabla `lessons`
3. Comprueba los permisos RLS

### El modo oscuro no funciona

Limpia el localStorage del navegador:
```javascript
// En la consola del navegador
localStorage.clear()
location.reload()
```

## 🤝 Contribución

### ¿Cómo puedo contribuir?

Lee nuestra [Guía de Contribución](CONTRIBUTING.md). Puedes:
- Reportar bugs
- Sugerir funcionalidades
- Mejorar documentación
- Enviar código

### ¿Necesito ser cristiano para contribuir?

No, todos son bienvenidos a contribuir. Solo pedimos respeto por el propósito del proyecto.

### ¿Hay un Discord o Slack?

Contacta por email a rootmontesion@gmail.com para más información.

## 🚀 Despliegue

### ¿Dónde puedo hospedar la app?

Opciones recomendadas:
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- Servidor propio con Docker

### ¿Cómo despliego en Vercel?

1. Conecta tu repo de GitHub a Vercel
2. Configura las variables de entorno
3. Deploy automático

[Guía detallada de despliegue](https://vercel.com/docs)

### ¿Necesito un dominio personalizado?

No, Vercel y otros servicios proveen subdominios gratuitos. Un dominio propio es opcional.

## 📊 Performance

### ¿Cuántos usuarios puede manejar?

Depende de tu plan de hosting:
- **Supabase Free**: ~500 usuarios activos
- **Vercel Free**: Ilimitado (con límites de requests)
- **Producción**: Escala según necesidades

### ¿Cómo optimizo el rendimiento?

- Usa ISR para páginas estáticas
- Implementa caché agresiva
- Optimiza imágenes
- Usa CDN para assets
- Monitorea con Vercel Analytics

## 💰 Monetización

### ¿Puedo cobrar por usar esta plataforma?

Sí, la licencia Apache 2.0 lo permite. Puedes:
- Ofrecer hosting como servicio
- Cobrar por soporte
- Añadir funcionalidades premium
- Usar en proyectos comerciales

### ¿Debo dar crédito al proyecto original?

No es obligatorio, pero se aprecia. Un enlace o mención ayuda al proyecto.

## 🔄 Actualizaciones

### ¿Con qué frecuencia se actualiza?

Seguimos desarrollo activo. Revisa:
- [CHANGELOG.md](CHANGELOG.md) para historial
- [ROADMAP.md](ROADMAP.md) para planes futuros
- [Releases](https://github.com/tu-usuario/montesion-app/releases) para versiones

### ¿Cómo me entero de nuevas versiones?

- Haz "Watch" al repositorio en GitHub
- Suscríbete a [Releases](https://github.com/tu-usuario/montesion-app/releases)
- Únete a las [Discussions](https://github.com/tu-usuario/montesion-app/discussions)

## 📞 Soporte

### ¿Dónde obtengo ayuda?

1. Revisa esta FAQ
2. Lee la [documentación](README.md)
3. Busca en [Issues existentes](https://github.com/tu-usuario/montesion-app/issues)
4. Abre un [nuevo Issue](https://github.com/tu-usuario/montesion-app/issues/new)
5. Usa [Discussions](https://github.com/tu-usuario/montesion-app/discussions)

### ¿Ofrecen soporte personalizado?

Para soporte personalizado o consultorías, contacta: rootmontesion@gmail.com

---

## ❓ ¿No encontraste tu respuesta?

Contacta por email a rootmontesion@gmail.com o abre un issue en GitHub.

---

**Última actualización**: Febrero 2026
