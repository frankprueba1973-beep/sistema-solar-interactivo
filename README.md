# 🌌 Sistema Solar Interactivo

Una demostración educativa interactiva del sistema solar construida con React, TypeScript y Canvas API. Explora los 8 planetas, aprende datos fascinantes y diviértete con herramientas interactivas.

![Versión](https://img.shields.io/badge/versión-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

## ✨ Características

### 🔭 Exploración Interactiva
- **8 planetas** con órbitas animadas en tiempo real
- **Sol** con efectos de corona y manchas solares
- **Cinturón de asteroides** entre Marte y Júpiter
- **Estelas orbitales** que muestran la trayectoria de cada planeta
- **Viento solar** con partículas animadas
- **Zona habitable** visualizada (zona Ricitos de Oro)
- **Estrellas fugaces** y fondo estelar con parpadeo
- **Terminador día/noche** en cada planeta

### 🎮 Controles Avanzados
- **Zoom** con rueda del mouse (0.2x a 8x)
- **Paneo** arrastrando el canvas
- **Seguimiento de planetas** con doble-click
- **Velocidad ajustable** de 0.25x a 10x
- **Minimapa** para navegación rápida
- **Atajos de teclado** completos

### 🛠️ Herramientas Educativas
- **Calculadora de peso**: Descubre tu peso en cada planeta
- **Calculadora de viaje**: Estima tiempo de viaje entre planetas
- **Calculadora de edad**: Tu edad en años planetarios
- **Simulador de gravedad**: Calcula caída de objetos en diferentes gravedades

### 📊 Comparación y Análisis
- **Comparador de planetas**: Compara radio, distancia, gravedad, lunas y densidad
- **Gráficos de barras** interactivos
- **Datos detallados** de cada planeta

### 🚀 Misiones Espaciales
- **12 misiones reales** (Voyager, Webb, Perseverance, etc.)
- **Timeline histórica** desde 1957 hasta 2024
- **Estado de misiones** (activas/finalizadas)

### 🧠 Aprendizaje Gamificado
- **Quiz de 15 preguntas** con explicaciones
- **Sistema de logros** (8 logros desbloqueables)
- **Datos curiosos** navegables
- **Progreso de exploración**

## 🚀 Demo en Vivo

Próximamente disponible en: [URL del demo]

## 📸 Capturas de Pantalla

### Vista Principal
![Vista Principal](docs/screenshots/main-view.png)
*Vista del sistema solar con planetas en órbita*

### Panel de Información
![Panel Info](docs/screenshots/planet-info.png)
*Información detallada de cada planeta*

### Herramientas
![Herramientas](docs/screenshots/tools.png)
*Calculadora de peso y simulador de gravedad*

### Quiz
![Quiz](docs/screenshots/quiz.png)
*Quiz interactivo con sistema de puntuación*

## 🛠️ Tecnologías

- **React 18.3** - Framework de UI
- **TypeScript 5.6** - Tipado estático
- **Vite 6.4** - Build tool ultrarrápido
- **Tailwind CSS 3.4** - Estilos utility-first
- **Canvas API** - Renderizado 2D de alta performance

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-solar-interactivo.git

# Entrar al directorio
cd sistema-solar-interactivo

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🎹 Atajos de Teclado

| Tecla | Función |
|-------|---------|
| `Espacio` | Pausar/Reproducir |
| `↑` o `+` | Aumentar velocidad |
| `↓` o `-` | Reducir velocidad |
| `O` | Mostrar/ocultar órbitas |
| `L` | Mostrar/ocultar nombres |
| `T` | Mostrar/ocultar estelas |
| `H` | Mostrar/ocultar zona habitable |
| `M` | Mostrar/ocultar minimapa |
| `R` | Resetear vista |
| `F` | Dejar de seguir planeta |
| `Esc` | Cerrar panel |
| `Scroll` | Zoom in/out |
| `Arrastrar` | Mover la vista |
| `Doble-click` | Seguir planeta |

## 📁 Estructura del Proyecto

```
sistema-solar-interactivo/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── data/
│   │   └── planets.ts       # Datos de planetas, misiones, quiz
│   ├── index.css            # Estilos globales
│   └── main.tsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── docs/                    # Documentación adicional
│   └── screenshots/         # Capturas de pantalla
├── index.html               # HTML base
├── package.json             # Dependencias
├── tsconfig.json            # Configuración TypeScript
├── vite.config.ts           # Configuración Vite
├── tailwind.config.js       # Configuración Tailwind
├── README.md                # Este archivo
├── CONTRIBUTING.md          # Guía de contribución
├── LICENSE                  # Licencia MIT
└── .gitignore              # Archivos ignorados por Git
```

## 🎯 Características Detalladas

### Datos por Planeta
Cada planeta incluye:
- Radio real (km)
- Distancia al Sol (millones de km)
- Período orbital (días y años)
- Período de rotación
- Gravedad superficial
- Temperatura
- Masa
- Velocidad de escape
- Densidad
- Atmósfera
- Número de lunas
- Campo magnético
- Descubridor y año
- Descripción educativa
- 6 datos curiosos

### Sistema de Logros
- 👆 **Primer Contacto**: Haz clic en un planeta
- 🔭 **Explorador**: Visita 4 planetas
- 🎓 **Erudito**: Visita todos los planetas
- 🏆 **Maestro del Quiz**: Obtén 100% en el quiz
- ⚡ **Velocista**: Alcanza 10x velocidad
- 🔍 **Ojo de Águila**: Haz zoom 3x o más
- 🚀 **Fan de Misiones**: Explora la sección de misiones
- 📊 **Comparador**: Compara 3+ planetas

### Misiones Espaciales Incluidas
- Voyager 1 & 2 (1977)
- Cassini-Huygens (1997)
- Juno (2011)
- New Horizons (2006)
- Perseverance (2020)
- James Webb (2021)
- Parker Solar Probe (2018)
- MESSENGER (2004)
- Europa Clipper (2024)
- Mars Express (2003)
- Lucy (2021)

## 🌐 Compatibilidad

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Móviles (responsive)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

### Ideas para Contribuir
- Agregar más planetas enanos (Plutón, Ceres, Eris)
- Implementar modo 3D con Three.js
- Añadir sonidos espaciales
- Traducciones a otros idiomas
- Mejorar accesibilidad
- Agregar más misiones espaciales
- Implementar modo VR/AR

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Datos planetarios de [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- Información de misiones de [NASA](https://www.nasa.gov/missions/)
- Inspiración de [NASA Eyes](https://science.nasa.gov/eyes/) y [Solar System Scope](https://www.solarsystemscope.com/)

## 📧 Contacto

**Tu Nombre** - [@tu_twitter](https://twitter.com/tu_usuario) - tu@email.com

Enlace del proyecto: [https://github.com/tu-usuario/sistema-solar-interactivo](https://github.com/tu-usuario/sistema-solar-interactivo)

## 🌟 Apoya el Proyecto

Si te gusta este proyecto, considera:
- ⭐ Darle una estrella en GitHub
- 🍴 Hacer fork y contribuir
- 📢 Compartirlo con otros
- 💡 Sugerir nuevas características

---

**Hecho con ❤️ y mucho ☕ por [Tu Nombre]**

⭐ ¡Si te gustó este proyecto, no olvides darle una estrella!
