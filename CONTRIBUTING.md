# Guía de Contribución

¡Gracias por tu interés en contribuir a Monte Sion App! 🙏

Esta guía te ayudará a entender cómo puedes contribuir al proyecto de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Estructura de Commits](#estructura-de-commits)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto y todos los que participan en él se rigen por nuestro compromiso de mantener un ambiente respetuoso y colaborativo. Al participar, se espera que mantengas este código.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## 🤝 ¿Cómo Puedo Contribuir?

### Reportar Bugs

Si encuentras un bug, crea un issue con:

1. **Título descriptivo**: Resume el problema en una línea
2. **Descripción detallada**: Explica el bug claramente
3. **Pasos para reproducir**:
   - Paso 1...
   - Paso 2...
   - Resultado esperado vs. resultado actual
4. **Entorno**: Navegador, versión de Node.js, SO
5. **Capturas de pantalla**: Si aplica
6. **Posible solución**: Si tienes una idea

Ejemplo:
```markdown
**Descripción**: El botón de "Guardar" no funciona en el formulario de peticiones

**Pasos para reproducir**:
1. Ir a `/peticion`
2. Llenar el formulario
3. Hacer clic en "Guardar"
4. No se guarda la petición

**Entorno**: Chrome 120, Windows 11, Node 20.x

**Captura**: [adjuntar imagen]
```

### Sugerir Mejoras

Para sugerir nuevas características:

1. **Verifica** que no exista ya un issue similar
2. **Describe** la funcionalidad propuesta claramente
3. **Explica** por qué sería útil para el proyecto
4. **Proporciona** ejemplos de uso si es posible

### Contribuir con Código

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-caracteristica
   ```
3. **Desarrolla** tu funcionalidad
4. **Prueba** tus cambios localmente
5. **Commit** siguiendo nuestras convenciones
6. **Push** a tu fork
7. **Abre** un Pull Request

## 🔧 Proceso de Desarrollo

### Configuración del Entorno

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/montesion-app.git
cd montesion-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia y configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Ejecuta el proyecto en modo desarrollo:
```bash
npm run dev
```

### Ejecutar Tests

```bash
# Cuando se implementen tests
npm test
```

### Build de Producción

```bash
npm run build
npm run start
```

## 📝 Guías de Estilo

### Código TypeScript/React

- **ESLint**: El proyecto usa ESLint. Ejecuta `npm run lint` antes de commitear
- **Formato**: Mantén consistencia con el código existente
- **TypeScript**: Usa tipado fuerte, evita `any`
- **Componentes**: Usa componentes funcionales con hooks
- **Nomenclatura**:
  - Componentes: PascalCase (`UserProfile.tsx`)
  - Funciones: camelCase (`getUserData`)
  - Constantes: UPPER_SNAKE_CASE (`API_URL`)
  - Archivos: kebab-case para utilidades (`auth-helpers.ts`)

### Ejemplo de Componente

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MiComponenteProps {
  titulo: string;
  onGuardar: (data: string) => void;
}

export function MiComponente({ titulo, onGuardar }: MiComponenteProps) {
  const [valor, setValor] = useState("");

  const handleClick = () => {
    onGuardar(valor);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{titulo}</h2>
      <Button onClick={handleClick}>Guardar</Button>
    </div>
  );
}
```

### Estructura de Archivos

- **Componentes de página**: En la carpeta `app/`
- **Componentes reutilizables**: En `components/`
- **Lógica de servidor**: En `lib/` con sufijo `-actions.ts`
- **Tipos**: En `types/`
- **Utilidades**: En `lib/utils.ts`

## 📌 Estructura de Commits

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (espacios, comas, etc.)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Añadir o modificar tests
- **chore**: Tareas de mantenimiento
- **ci**: Cambios en CI/CD

### Ejemplos

```bash
feat(auth): agregar autenticación con Google
fix(peticiones): corregir guardado de peticiones
docs(readme): actualizar instrucciones de instalación
refactor(components): simplificar lógica del menú
style(button): ajustar espaciado de botones
```

## 🔄 Pull Requests

### Checklist antes de abrir un PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] El linter pasa sin errores (`npm run lint`)
- [ ] Los tests pasan (cuando se implementen)
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación si es necesario
- [ ] Los commits siguen la convención
- [ ] He descrito claramente los cambios en el PR

### Plantilla de Pull Request

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] He revisado mi propio código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings

## Capturas de pantalla
Si aplica, añade capturas
```

### Proceso de Revisión

1. Un mantenedor revisará tu PR
2. Puede solicitar cambios o mejoras
3. Una vez aprobado, se hará merge a `main`
4. Tu contribución será parte del proyecto 🎉

## 🆘 ¿Necesitas Ayuda?

- **Documentación**: Consulta el [README.md](README.md)
- **Issues**: Busca en los issues existentes
- **Contacto**: rootmontesion@gmail.com

## 🙏 Reconocimiento

Todos los contribuidores serán reconocidos en el proyecto. ¡Tu ayuda es invaluable!

---

¡Gracias por contribuir a Monte Sion App! 🙏✨
