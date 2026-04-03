# Monte Sion App

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

Plataforma web para comunidad cristiana construida con Next.js 16, React 19, TypeScript y Supabase.
Combina contenido público, autenticación, seguimiento de usuarios, peticiones de oración, avisos, chat y administración.

[Instalación](#instalación) • [Tecnologías](#tecnologías) • [Arquitectura](#arquitectura) • [Portafolio](#evidencia-para-portafolio) • [Git](#flujo-de-git)

</div>

---

## Resumen

Este proyecto está orientado a producción y presentación profesional. La base actual prioriza:

- App Router con separación entre UI, server actions y lógica compartida.
- Supabase para autenticación, base de datos, storage y realtime.
- Formularios tipados con React Hook Form y Zod.
- Estructura modular por dominio para facilitar crecimiento y mantenimiento.

## Funcionalidades principales

- Landing pública con navegación y captación de tráfico.
- Autenticación y control por roles.
- Lecciones, Biblia, avisos, eventos, chat y peticiones de oración.
- Panel administrativo para usuarios, contenido y auditoría.
- Persistencia de parámetros de campaña y analítica interna.

## Tecnologías

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase
- React Hook Form
- Zod
- SWR
- Recharts
- ExcelJS

## Arquitectura

La estructura actual está pensada para dividir responsabilidades de esta forma:

- [app/](app) para rutas, layouts, páginas y providers.
- [components/](components) para UI reutilizable y piezas por dominio.
- [lib/](lib) para acciones del servidor, acceso a datos, validación y utilidades.
- [supabase/](supabase) para migraciones, seeds y scripts SQL.
- [docs/](docs) para documentación de portafolio y decisiones técnicas.

Referencias útiles:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/PORTFOLIO.md](docs/PORTFOLIO.md)
- [.env.example](.env.example)

## Instalación

Requisitos:

- Node.js 18 o superior.
- npm 9 o superior.
- Un proyecto activo en Supabase.

Pasos:

1. Clona el repositorio.
2. Instala dependencias con `npm install`.
3. Copia [.env.example](.env.example) a `.env.local` y completa las variables.
4. Aplica los scripts SQL de [supabase/](supabase).
5. Ejecuta `npm run dev`.

Comandos útiles:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
```

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave anónima pública.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privada solo para servidor.
- `OPENAI_API_KEY`: opcional, para flujos asistidos por IA.
- `NEXT_PUBLIC_APP_URL`: URL base de la aplicación.

## Estructura recomendada

```text
app/
components/
docs/
hooks/
lib/
public/
scripts/
supabase/
types/
```

## Rol en el proyecto

Si vas a usar este repo en portafolio, documenta tu aporte con precisión. Un formato útil es:

- Desarrollo full-stack de la aplicación.
- Diseño de arquitectura modular con App Router y Supabase.
- Implementación de formularios, validación y persistencia.
- Endurecimiento de seguridad y control de acceso.
- Documentación técnica y preparación para despliegue.

## Evidencia para portafolio

Incluye capturas, demo y diagramas de estos flujos:

- Landing pública.
- Inicio de sesión y registro.
- Lecciones o contenido principal.
- Panel admin.
- Flujo de peticiones de oración o registro.
- Vista móvil.
- Diagrama de arquitectura.

## Flujo de Git

Usa ramas cortas y commits enfocados:

- `feat:` para funcionalidades nuevas.
- `fix:` para correcciones.
- `refactor:` para cambios internos sin alterar el comportamiento.
- `docs:` para documentación.
- `chore:` para tareas de mantenimiento.

Ejemplo de ramas:

- `feature/portfolio-readme`
- `feature/admin-hardening`
- `fix/supabase-client-init`

## Contribución

Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar cambios.

## Licencia

Apache 2.0. Consulta [LICENSE](LICENSE) para más detalles.

## Documentos legales

- [Términos y Condiciones](docs/legal/terminos-y-condiciones.md)
- [Aviso de Privacidad](docs/legal/aviso-de-privacidad.md)
- [Marcas, logos y propiedad intelectual](docs/legal/marcas-logos-y-propiedad-intelectual.md)
- [Limitación de responsabilidad y garantía](docs/legal/limitacion-de-responsabilidad-y-garantias.md)

- 📖 [Índice de Documentación](DOCS_INDEX.md) - Guía completa de toda la documentación
- ⚡ [Inicio Rápido](QUICKSTART.md) - Configuración en 5 minutos
- 🏗️ [Arquitectura](ARCHITECTURE.md) - Detalles técnicos del proyecto
- ❓ [FAQ](FAQ.md) - Preguntas frecuentes
- 🗺️ [Roadmap](ROADMAP.md) - Planes futuros
- 🤝 [Guía de Contribución](CONTRIBUTING.md) - Cómo contribuir

## 🙏 Agradecimientos

- A la comunidad de Next.js
- Al equipo de Supabase
- A todos los contribuidores del proyecto
- A la comunidad cristiana que inspira este trabajo

## 📞 Contacto

Para preguntas o sugerencias, por favor abre un issue o contacta a través de:
- **Email**: rootmontesion@gmail.com
- **GitHub**: Abre un issue en el repositorio

---

Hecho con ❤️ para la comunidad cristiana
