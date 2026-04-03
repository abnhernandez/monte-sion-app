# Arquitectura del Proyecto

Documento de referencia para entender cómo está organizado Monte Sion App y qué decisiones conviene mantener al preparar el repo para portafolio.

## Vista general

```text
Cliente Next.js 16
  -> App Router / Server Components / Client Components
  -> Server Actions y helpers compartidos en lib/
  -> UI reutilizable en components/
  -> Supabase para auth, base de datos, storage y realtime
  -> APIs externas cuando aplica
```

## Capas

### Presentación

- [app/](app) define rutas, layouts, páginas y providers.
- [components/](components) contiene componentes reutilizables y componentes por dominio.
- [app/components/](app/components) agrupa piezas locales a rutas específicas.

### Dominio y servidor

- [lib/](lib) concentra acciones del servidor, validación, acceso a datos y utilidades.
- Las operaciones de escritura deben validar datos y sesión antes de llegar a Supabase.
- Las lecturas reutilizables conviene exponerlas como helpers puros o fetchers pequeños.

### Persistencia

- [supabase/](supabase) contiene scripts SQL, seeds y migraciones.
- Supabase maneja autenticación, PostgreSQL, storage y realtime.
- RLS debe considerarse parte del diseño de seguridad, no un extra opcional.

## Estructura recomendada

```text
app/
  (auth)/
  (community)/
  (dashboard)/
  (admin)/
  api/
components/
  ui/
  features/
docs/
hooks/
lib/
  server/
  validators/
  types/
public/
supabase/
```

## Flujo de datos

### Lectura

```text
Componente -> fetcher/helper -> Supabase -> datos tipados -> render
```

### Escritura

```text
Formulario -> validación Zod -> server action -> verificación de sesión/rol -> Supabase -> respuesta consistente
```

### Realtime

```text
Supabase realtime -> suscripción -> estado del cliente -> actualización de UI
```

## Reglas de seguridad

- Validar siempre el input antes de guardar.
- No confiar en datos del cliente para permisos.
- Mantener `SUPABASE_SERVICE_ROLE_KEY` solo en servidor.
- Preferir mensajes de error genéricos hacia el usuario y detalles técnicos en logs.
- Limitar el tamaño y formato de archivos si hay uploads.

## Sistema visual

El diseño del proyecto ya usa una base útil para portafolio:

- Tipografía localizable desde [app/layout.tsx](app/layout.tsx).
- Colores extendidos en [tailwind.config.ts](tailwind.config.ts).
- Componentes accesibles con Radix UI.
- Soporte de tema claro/oscuro.

## Decisiones que conviene mantener

- Mantener una separación clara entre UI y lógica de negocio.
- Concentrar acceso a Supabase en helpers reutilizables.
- Evitar que formularios grandes mezclen persistencia, validación y presentación.
- Documentar cambios grandes en [docs/PORTFOLIO.md](docs/PORTFOLIO.md).

- **Local State**: `useState`, `useReducer`
- **Cache**: SWR para data fetching
- **Context**: React Context para temas, auth status

### Cache de Servidor

- **Next.js Cache**: Automático en Server Components
- **Revalidación**: 
  - On-demand con `revalidatePath()`
  - Time-based con `revalidate`
  - Tag-based con `revalidateTag()`

## 🚀 Optimizaciones

### Rendimiento

1. **Code Splitting**: Automático por ruta
2. **Lazy Loading**: Componentes pesados con `dynamic()`
3. **Image Optimization**: `next/image` para todas las imágenes
4. **Font Optimization**: `next/font` para fuentes

### SEO

1. **Metadata API**: Metadatos dinámicos por página
2. **Sitemap**: Generado automáticamente
3. **Robots.txt**: Configurado para bots
4. **Schema.org**: Structured data para contenido

### Build

```bash
# Análisis de bundle
ANALYZE=true npm run build

# Build para producción
npm run build
```

## 📱 PWA (Progressive Web App)

### Service Worker

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  // Manejo de notificaciones push
});
```

### Manifest

```json
{
  "name": "Monte Sion App",
  "short_name": "Monte Sion",
  "icons": [...],
  "theme_color": "#...",
  "background_color": "#...",
  "display": "standalone"
}
```

## 🧪 Testing (Futuro)

### Estructura Propuesta

```
__tests__/
├── unit/                # Tests unitarios
│   ├── components/
│   ├── lib/
│   └── utils/
├── integration/         # Tests de integración
│   ├── auth/
│   └── api/
└── e2e/                # Tests end-to-end
    ├── login.spec.ts
    └── lessons.spec.ts
```

### Stack de Testing

- **Unit**: Jest + React Testing Library
- **Integration**: Jest + MSW (Mock Service Worker)
- **E2E**: Playwright

## 🔧 Herramientas de Desarrollo

### Scripts Útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

### VS Code Extensions Recomendadas

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- GitLens

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Última actualización**: Febrero 2026
