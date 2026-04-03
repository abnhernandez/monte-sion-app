# Seguridad

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en Monte Sion App, por favor **NO** la reportes públicamente en los issues de GitHub.

### Proceso de Reporte

1. **Envía un email** a: rootmontesion@gmail.com
2. **Incluye**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Posible impacto de la vulnerabilidad
   - Sugerencias de solución (si las tienes)

### Respuesta Esperada

- Confirmaremos la recepción de tu reporte en **48 horas**
- Investigaremos el problema y te mantendremos informado
- Trabajaremos en un fix y lo desplegaremos lo antes posible
- Te acreditaremos públicamente (si lo deseas) una vez solucionado

## Buenas Prácticas de Seguridad

### Variables de Entorno

- **NUNCA** compartas tus claves de API o secrets
- Usa `.env.local` para desarrollo (está en `.gitignore`)
- En producción, usa las variables de entorno de tu plataforma de hosting

### Autenticación

- Las contraseñas se manejan de forma segura con Supabase Auth
- Se implementa autenticación de dos factores cuando es posible
- Las sesiones expiran automáticamente

### Base de Datos

- Usa Row Level Security (RLS) de Supabase
- Nunca expongas la `SUPABASE_SERVICE_ROLE_KEY` al cliente
- Valida y sanitiza todas las entradas de usuario

### API Routes

- Valida todos los inputs con Zod
- Implementa rate limiting cuando sea necesario
- Usa middleware para proteger rutas administrativas

## Dependencias

Revisamos regularmente nuestras dependencias en busca de vulnerabilidades conocidas:

```bash
npm audit
```

Si encuentras una vulnerabilidad en una dependencia, actualízala y abre un PR.

## Políticas

- **Actualizaciones de seguridad**: Se publican de forma prioritaria
- **Notificaciones**: Los usuarios afectados serán notificados
- **Divulgación**: Seguimos el principio de divulgación responsable

---

Gracias por ayudarnos a mantener Monte Sion App seguro. 🔒
