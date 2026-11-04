# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema Solar Interactivo! 🚀

Este documento proporciona pautas y recursos para ayudarte a contribuir de manera efectiva.

## 📋 Código de Conducta

Este proyecto y todos los que participan en él se rigen por el [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Al participar, se espera que mantengas este código. Por favor, reporta comportamiento inaceptable a [tu@email.com].

## 🎯 ¿Cómo Puedo Contribuir?

### 🐛 Reportar Bugs

Antes de crear un issue de bug:

1. Verifica que el bug no haya sido reportado anteriormente en [Issues](https://github.com/tu-usuario/sistema-solar-interactivo/issues)
2. Usa la plantilla de bug report
3. Incluye:
   - Descripción clara y detallada
   - Pasos para reproducir el problema
   - Comportamiento esperado vs actual
   - Capturas de pantalla si es posible
   - Información del sistema (navegador, versión, SO)

### 💡 Sugerir Mejoras

Las sugerencias de mejoras son bienvenidas:

1. Verifica que la mejora no haya sido sugerida anteriormente
2. Usa la plantilla de feature request
3. Describe claramente la mejora
4. Explica por qué sería útil
5. Proporciona ejemplos o mockups si es posible

### 📝 Mejorar Documentación

La documentación puede mejorarse siempre:

- Corregir errores tipográficos
- Aclarar secciones confusas
- Agregar ejemplos
- Traducir a otros idiomas
- Crear tutoriales

### 💻 Contribuir Código

#### Proceso de Desarrollo

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/sistema-solar-interactivo.git
   cd sistema-solar-interactivo
   ```
3. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```
4. **Instala dependencias**:
   ```bash
   npm install
   ```
5. **Haz tus cambios** y asegúrate de que:
   - El código sigue el estilo del proyecto
   - No hay errores de TypeScript
   - La aplicación compila sin errores
   - Las nuevas features están documentadas
6. **Commit** tus cambios:
   ```bash
   git commit -m "feat: descripción clara del cambio"
   ```
7. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
8. **Abre un Pull Request**

#### Estilo de Código

- **TypeScript**: Usa tipado estricto
- **React**: Componentes funcionales con hooks
- **Nombres**: Descriptivos y en inglés para código, español para UI
- **Comentarios**: En español para documentación, inglés para código complejo
- **Formato**: Usa Prettier (configuración por defecto)

#### Estructura de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, punto y coma, etc (sin cambio de código)
refactor: refactorización de código
test: agregar o corregir tests
chore: cambios en build, herramientas, etc
```

Ejemplos:
```
feat: agregar calculadora de peso en otros planetas
fix: corregir error de renderizado en Safari
docs: actualizar README con nuevas características
refactor: optimizar renderizado de canvas
```

#### Pull Requests

1. **Título descriptivo**: Resume claramente el cambio
2. **Descripción detallada**:
   - ¿Qué problema resuelve?
   - ¿Cómo lo resuelve?
   - Capturas de pantalla si hay cambios visuales
3. **Referencia issues**: Usa `Closes #123` o `Fixes #456`
4. **Mantén actualizado**: Rebase con la rama principal si es necesario
5. **Tests**: Asegúrate de que todo funciona correctamente

### 🎨 Contribuciones de Diseño

Si eres diseñador:

- Mejora la UI/UX
- Crea mockups para nuevas features
- Sugiere paletas de colores
- Diseña iconos o ilustraciones
- Mejora la accesibilidad

### 🌍 Traducciones

Ayuda a traducir la aplicación:

1. Crea un archivo en `src/locales/[idioma].json`
2. Traduce todas las cadenas de texto
3. Agrega el idioma al selector
4. Documenta el proceso en README

### 📊 Datos y Contenido

Contribuye con:

- Datos científicos actualizados
- Nuevas misiones espaciales
- Datos curiosos verificados
- Preguntas para el quiz
- Información educativa

## 🔧 Configuración del Entorno de Desarrollo

### Requisitos

- Node.js 18+
- npm 9+ o yarn 1.22+
- Git
- Editor de código (VS Code recomendado)

### Extensiones Recomendadas para VS Code

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens

### Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Ejecutar linter
npm run type-check   # Verificar tipos TypeScript
```

## 📚 Recursos Útiles

### Documentación del Proyecto

- [README.md](README.md) - Descripción general
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guía de Estilo](#estilo-de-código)

### Recursos Externos

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [NASA Planetary Data](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

## 🏗️ Estructura del Proyecto

```
src/
├── App.tsx              # Componente principal con toda la lógica
├── data/
│   └── planets.ts       # Datos de planetas, misiones, quiz
├── index.css            # Estilos globales y animaciones
└── main.tsx             # Punto de entrada de React
```

### Convenciones de Código

#### Componentes

```typescript
// ✅ Bueno: Componente funcional con TypeScript
interface PlanetInfoProps {
  planet: Planet;
  onClose: () => void;
}

function PlanetInfo({ planet, onClose }: PlanetInfoProps) {
  // Lógica del componente
  return <div>...</div>;
}

// ❌ Evitar: Componentes de clase o sin tipos
```

#### Datos

```typescript
// ✅ Bueno: Interfaces claras y tipadas
interface Planet {
  id: string;
  name: string;
  nameEs: string;
  // ... más campos
}

// ✅ Bueno: Datos exportados y tipados
export const PLANETS_DATA: Planet[] = [
  // ... datos
];
```

#### Estilos

```typescript
// ✅ Bueno: Tailwind utility classes
<div className="flex items-center gap-2 p-4 bg-indigo-900/20 rounded-lg">
  ...
</div>

// ❌ Evitar: Estilos inline excesivos
<div style={{ display: 'flex', alignItems: 'center' }}>
  ...
</div>
```

## 🐛 Debugging

### Problemas Comunes

1. **Canvas no se renderiza**
   - Verifica que el contenedor tenga dimensiones
   - Revisa la consola del navegador
   - Asegúrate de que `useEffect` se ejecuta correctamente

2. **Animaciones lentas**
   - Reduce el número de partículas
   - Optimiza el loop de animación
   - Usa `requestAnimationFrame`

3. **Errores de TypeScript**
   - Ejecuta `npm run type-check`
   - Verifica las interfaces
   - Asegúrate de que todos los tipos están definidos

## 📝 Checklist para Pull Requests

Antes de enviar tu PR:

- [ ] El código compila sin errores
- [ ] No hay warnings de TypeScript
- [ ] La aplicación funciona correctamente
- [ ] Las nuevas features están documentadas
- [ ] El código sigue el estilo del proyecto
- [ ] Los commits son claros y descriptivos
- [ ] El PR tiene título y descripción claros
- [ ] Se referencian los issues relacionados
- [ ] Las capturas de pantalla están incluidas (si aplica)

## 🤔 ¿Necesitas Ayuda?

Si tienes preguntas:

1. Revisa la [documentación existente](README.md)
2. Busca en [Issues cerrados](https://github.com/tu-usuario/sistema-solar-interactivo/issues?q=is%3Aissue+is%3Aclosed)
3. Abre un [nuevo issue](https://github.com/tu-usuario/sistema-solar-interactivo/issues/new) con la etiqueta "question"
4. Contacta directamente: [tu@email.com]

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en:

- La sección de contribuidores en README
- Los commits del proyecto
- Las notas de versión

¡Gracias por contribuir! 🚀

---

**¿Listo para contribuir? ¡Adelante!** 🌟
