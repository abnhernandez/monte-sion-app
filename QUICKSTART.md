# 📖 Guía de Inicio Rápido

Una guía paso a paso para poner en marcha Monte Sion App rápidamente.

## ⚡ Inicio Rápido en 5 Minutos

### 1️⃣ Prerrequisitos

Asegúrate de tener instalado:
- Node.js 18+ ([Descargar](https://nodejs.org/))
- npm, yarn o pnpm
- Git ([Descargar](https://git-scm.com/))
- Cuenta de Supabase ([Crear gratis](https://supabase.com/))

### 2️⃣ Clonar el Repositorio

```bash
git clone https://github.com/montesion/monte-sion-app.git
cd monte-sion-app
```

### 3️⃣ Instalar Dependencias

```bash
npm install
```

### 4️⃣ Configurar Supabase

1. Ve a [supabase.com](https://supabase.com/) y crea un nuevo proyecto
2. Copia la URL y las claves de API:
   - Settings → API → URL
   - Settings → API → anon/public key
   - Settings → API → service_role key (PRIVADA)

### 5️⃣ Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y añade tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

### 6️⃣ Configurar la Base de Datos

En el SQL Editor de Supabase, ejecuta los scripts en este orden:

```bash
# En la interfaz de Supabase (SQL Editor):
1. supabase/hero.sql
2. supabase/features.sql
3. supabase/lessons.sql
4. supabase/community-groups.sql
# ... y los demás scripts necesarios
```

### 7️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎯 Siguientes Pasos

### Crear un Usuario Administrador

1. Regístrate en la app (http://localhost:3000/registro)
2. En Supabase Dashboard → Authentication → Users
3. Encuentra tu usuario y copia su ID
4. En SQL Editor, ejecuta:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'tu-user-id-aqui';
```

5. Recarga la página y accede a /admin

### Configurar OpenAI (Opcional)

Para el chat con IA:

1. Obtén una API key en [platform.openai.com](https://platform.openai.com/)
2. Añádela a `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

### Personalizar la App

1. **Logo y Nombre**: Edita `app/layout.tsx`
2. **Colores**: Modifica `app/globals.css`
3. **Contenido**: Actualiza las lecciones y avisos desde el panel de admin

---

## 🐛 Solución de Problemas Comunes

### Error: "Supabase client error"

**Problema**: Las credenciales de Supabase son incorrectas.

**Solución**: 
- Verifica que `.env.local` tiene las claves correctas
- Reinicia el servidor (`Ctrl+C` y `npm run dev`)

### Error: "Module not found"

**Problema**: Dependencias no instaladas correctamente.

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database error"

**Problema**: Tablas no creadas en Supabase.

**Solución**:
- Ve al SQL Editor en Supabase
- Ejecuta todos los scripts de la carpeta `supabase/`
- Verifica que las tablas existen en Table Editor

### La app no carga en localhost:3000

**Problema**: Puerto ocupado.

**Solución**:
```bash
# Cambiar puerto
PORT=3001 npm run dev
```

### Estilos no se cargan correctamente

**Problema**: Cache del navegador.

**Solución**:
- Limpia la cache del navegador (Ctrl+Shift+Delete)
- Recarga con Ctrl+F5

---

## 📚 Recursos Útiles

- [Documentación Completa](./README.md)
- [Arquitectura del Proyecto](./ARCHITECTURE.md)
- [Guía de Contribución](./CONTRIBUTING.md)
- [Roadmap](./ROADMAP.md)

## 🆘 ¿Necesitas Ayuda?

- � Reportar un Bug: Abre un issue en GitHub
- 💡 Sugerir una Funcionalidad: Abre un issue en GitHub
- 📧 Email: rootmontesion@gmail.com

---

¡Listo! Ya tienes Monte Sion App funcionando localmente. 🚀

**Próximos pasos recomendados**:
1. Explorar el código en `/app` y `/components`
2. Leer la [Guía de Contribución](./CONTRIBUTING.md)
3. Familiarizarte con la [Arquitectura](./ARCHITECTURE.md)
4. Hacer tu primera contribución 🎉
