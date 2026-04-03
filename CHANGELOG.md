# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [No publicado]

### Añadido
- Sin cambios todavía.

## [1.0.0] - 2026-04-02

### Añadido
- Publicación inicial estable de la plataforma comunitaria.
- Documentación base del repositorio (arquitectura, seguridad, contribución y guías).
- Configuración inicial de CI/CD y plantillas para issues/pull requests.

### Cambiado
- Versión del proyecto actualizada para primer lanzamiento público en `package.json`.
- README.md mejorado con información detallada del proyecto.
- .gitignore optimizado con más patrones de exclusión.

### Características Principales
- ✅ Autenticación segura con Supabase
- ✅ Gestión de usuarios y roles
- ✅ Contenido bíblico interactivo
- ✅ Comunidad y chat en tiempo real
- ✅ Panel administrativo completo
- ✅ Exportación de datos (Excel, CSV, PDF)
- ✅ Sistema de auditoría
- ✅ Notificaciones push (PWA)

## [0.0.0] - 2026-02-02

### Añadido
- Configuración inicial del proyecto con Next.js 16
- Integración con Supabase para autenticación y base de datos
- Sistema de lecciones bíblicas
- Chat comunitario con IA
- Panel de administración completo
- Sistema de peticiones de oración
- Biblia en línea
- Sistema de avisos y notificaciones
- Dashboard de usuario
- Diseño responsivo con Tailwind CSS
- Modo oscuro/claro
- Componentes UI con Radix UI

## Política de Versionado (SemVer)
- `patch`: `1.0.1` (arreglos sin cambiar comportamiento principal)
- `minor`: `1.1.0` (nuevas funciones compatibles)
- `major`: `2.0.0` (cambios que rompen compatibilidad)

### Comandos de Versionado
```bash
npm version patch
npm version minor
npm version major
```

Si necesitas actualizar versión sin crear commit/tag automático:

```bash
npm version patch --no-git-tag-version
```

### Checklist Pre-Lanzamiento
```bash
npm run type-check
npm run test
npm run build
```

---

## Tipos de Cambios

- **Añadido**: Para nuevas características
- **Cambiado**: Para cambios en funcionalidades existentes
- **Obsoleto**: Para características que serán eliminadas
- **Eliminado**: Para características eliminadas
- **Corregido**: Para corrección de bugs
- **Seguridad**: Para vulnerabilidades

## Formato de Versiones

```
[MAYOR.MENOR.PARCHE]

MAYOR: Cambios incompatibles con versiones anteriores
MENOR: Nuevas funcionalidades compatibles
PARCHE: Correcciones de bugs compatibles
```

---

Para ver el historial completo de cambios, visita el repositorio en GitHub.
