# Estado de la refactorización de validación de auth

Este documento aclara el estado real del módulo de autenticación y evita confundir el diseño documentado con código ya presente.

## Estado actual en el repositorio

Los archivos que sí existen hoy en `src/services/auth/` son:

- `input-security.ts`
- `auth-api.ts`

Además, existe documentación de diseño y análisis que describe una refactorización enterprise-grade, pero los módulos nuevos todavía no están materializados como archivos en disco.

## Qué está documentado

- Análisis de vulnerabilidades en `input-security.ts`
- Propuesta de validación con Zod
- Reglas de password fuerte
- Detección de homoglyphs e invisible characters
- Esquema de errores discriminados
- Idea de middleware con rate limiting

## Qué no existe todavía como implementación real

- `src/services/auth/types.ts`
- `src/services/auth/validation.schema.ts`
- `src/services/auth/sanitization.ts`
- `src/services/auth/input-security.refactored.ts`
- `src/services/auth/middleware.ts`
- `tests/unit/services/auth/input-security.refactored.test.ts`

Si alguno de esos archivos aparece en documentación anterior, debe interpretarse como propuesta o guía, no como implementación confirmada.

## Cómo está construido hoy el flujo real

1. `input-security.ts` normaliza email, aplica regex básica y bloquea algunos patrones sospechosos.
2. `auth-api.ts` llama a `validateLoginInput()` antes de enviar la petición al backend.
3. El backend real sigue siendo responsable de la validación final.

## Recomendación de migración

1. Mantener `input-security.ts` como base temporal hasta tener la implementación nueva en el árbol real.
2. Crear los módulos refactorizados uno por uno.
3. Migrar `auth-api.ts` al nuevo validador únicamente cuando el módulo esté presente y probado.
4. Añadir pruebas unitarias e integración para el flujo nuevo antes de deprecar el archivo antiguo.

## Comandos útiles

- `npm run type-check`
- `npm run test:unit`
- `npm run test:integration`

## Nota importante

La documentación anterior del refactor debe leerse como diseño y guía de implementación. Este archivo es la referencia para distinguir entre lo ya implementado y lo que sigue siendo trabajo pendiente.