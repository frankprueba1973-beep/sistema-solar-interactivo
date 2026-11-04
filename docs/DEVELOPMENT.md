# Guía de Desarrollo

Esta guía te ayudará a configurar tu entorno de desarrollo y entender cómo trabajar con el código.

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sistema-solar-interactivo.git
cd sistema-solar-interactivo
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Código

```
src/
├── App.tsx              # Componente principal (2000+ líneas)
├── data/
│   └── planets.ts       # Datos estáticos (planetas, misiones, quiz)
├── index.css            # Estilos globales y animaciones
└── main.tsx             # Punto de entrada de React
```

### App.tsx - Componente Principal

El archivo `App.tsx` contiene toda la lógica de la aplicación. Está organizado en secciones:

#### 1. Interfaces y Tipos (líneas 1-50)
```typescript
type ViewMode = 'explore' | 'quiz' | 'compare' | 'facts' | 'missions' | 'tools';
type ToolMode = 'weight' | 'travel' | 'age' | 'gravity';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}
```

#### 2. Estado y Referencias (líneas 50-150)
```typescript
// Estado de React
const [isPlaying, setIsPlaying] = useState(true);
const [speed, setSpeed] = useState(1);
// ... más estado

// Referencias para rendimiento
const canvasRef = useRef<HTMLCanvasElement>(null);
const planetsRef = useRef<Planet[]>([]);
// ... más refs
```

#### 3. Inicialización (líneas 150-250)
```typescript
// Inicializar planetas con posiciones aleatorias
useEffect(() => {
  planetsRef.current = PLANETS_DATA.map((p) => ({
    ...p,
    angle: Math.random() * Math.PI * 2,
    rotationAngle: 0,
  }));
  
  // Inicializar asteroides, estrellas, etc.
}, []);
```

#### 4. Manejadores de Eventos (líneas 250-400)
```typescript
// Click en canvas
const handleClick = useCallback((e: React.MouseEvent) => {
  // Convertir coordenadas
  // Detectar planetas
  // Actualizar selección
}, []);

// Zoom con rueda
const handleWheel = useCallback((e: React.WheelEvent) => {
  // Calcular nuevo zoom
  // Aplicar límites
}, []);
```

#### 5. Función de Dibujo (líneas 400-700)
```typescript
const draw = useCallback((ctx, width, height, time) => {
  // 1. Limpiar canvas
  // 2. Dibujar fondo (nebulosas, estrellas)
  // 3. Dibujar órbitas
  // 4. Dibujar asteroides
  // 5. Dibujar sol
  // 6. Dibujar planetas
  // 7. Dibujar etiquetas
}, [dependencies]);
```

#### 6. Loop de Animación (líneas 700-800)
```typescript
useEffect(() => {
  const animate = (time: number) => {
    // Calcular delta time
    // Actualizar posiciones
    // Dibujar frame
    // Solicitar siguiente frame
    animationRef.current = requestAnimationFrame(animate);
  };
  
  animationRef.current = requestAnimationFrame(animate);
  
  return () => cancelAnimationFrame(animationRef.current);
}, [draw]);
```

#### 7. Sub-componentes (líneas 800-1500)
```typescript
// Panel de información de planeta
function PlanetInfoPanel({ planet, onClose }) {
  return <div>...</div>;
}

// Panel de información del sol
function SunInfoPanel({ onClose }) {
  return <div>...</div>;
}

// Panel de comparación
function ComparePanel({ comparisonPlanets, toggleComparison }) {
  return <div>...</div>;
}

// Panel de herramientas
function ToolsPanel({ toolMode, ...props }) {
  return <div>...</div>;
}

// Panel de misiones
function MissionsPanel() {
  return <div>...</div>;
}

// Panel de quiz
function QuizPanel({ state, onAnswer, onNext }) {
  return <div>...</div>;
}

// Panel de datos curiosos
function FactsPanel({ currentFact, setCurrentFact }) {
  return <div>...</div>;
}
```

#### 8. Componentes de UI (líneas 1500-1700)
```typescript
// Tarjeta de estadística
function StatCard({ icon, label, value }) {
  return <div>...</div>;
}

// Fila de información
function InfoRow({ icon, label, value }) {
  return <div>...</div>;
}
```

#### 9. Funciones Utilitarias (líneas 1700+)
```typescript
// Convertir hex a RGB
function hexToRgb(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

// Formatear tiempo
function formatTime(seconds: number): string {
  const days = seconds / 60;
  if (days < 1) return `${(days * 365).toFixed(0)}d`;
  if (days < 365) return `${days.toFixed(0)}d`;
  return `${(days / 365).toFixed(1)}a`;
}
```

### data/planets.ts - Datos Estáticos

Este archivo contiene todos los datos del sistema solar:

```typescript
// Datos de planetas
export const PLANETS_DATA: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    nameEs: 'Mercurio',
    // ... todos los campos
  },
  // ... más planetas
];

// Datos del sol
export const SUN_DATA = {
  name: 'Sol',
  // ... datos
};

// Misiones espaciales
export const SPACE_MISSIONS = [
  {
    name: 'Voyager 1',
    year: 1977,
    // ... datos
  },
  // ... más misiones
];

// Preguntas de quiz
export const QUIZ_QUESTIONS = [
  {
    question: '¿Cuál es el planeta más grande?',
    options: ['Saturno', 'Júpiter', 'Neptuno', 'Urano'],
    correct: 1,
    explanation: 'Júpiter es el planeta más grande...'
  },
  // ... más preguntas
];
```

## 🎨 Trabajando con Canvas

### Conceptos Básicos

```typescript
// Obtener contexto
const ctx = canvas.getContext('2d');

// Limpiar canvas
ctx.clearRect(0, 0, width, height);

// Dibujar círculo
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fillStyle = 'blue';
ctx.fill();

// Dibujar texto
ctx.font = '12px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Texto', x, y);

// Gradientes
const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
gradient.addColorStop(0, 'white');
gradient.addColorStop(1, 'blue');
ctx.fillStyle = gradient;
```

### Sistema de Coordenadas

```typescript
// Coordenadas de pantalla a mundo
function screenToWorld(screenX, screenY, camera, canvas) {
  const centerX = canvas.width / 2 + camera.x;
  const centerY = canvas.height / 2 + camera.y;
  
  return {
    x: (screenX - centerX) / camera.zoom,
    y: (screenY - centerY) / camera.zoom
  };
}

// Coordenadas de mundo a pantalla
function worldToScreen(worldX, worldY, camera, canvas) {
  const centerX = canvas.width / 2 + camera.x;
  const centerY = canvas.height / 2 + camera.y;
  
  return {
    x: worldX * camera.zoom + centerX,
    y: worldY * camera.zoom + centerY
  };
}
```

### Animación de Planetas

```typescript
// Actualizar posición del planeta
planetsRef.current.forEach((planet) => {
  // Velocidad angular basada en período orbital
  const angularSpeed = (Math.PI * 2) / (planet.orbitalPeriod * 60);
  
  // Actualizar ángulo
  planet.angle += angularSpeed * delta * speedRef.current;
  
  // Calcular posición
  const x = Math.cos(planet.angle) * planet.orbitRadius;
  const y = Math.sin(planet.angle) * planet.orbitRadius;
});
```

## 🎮 Agregando Nuevas Características

### Ejemplo: Agregar un Nuevo Planeta

1. **Actualizar `data/planets.ts`**:
```typescript
export const PLANETS_DATA = [
  // ... planetas existentes
  {
    id: 'pluto',
    name: 'Pluto',
    nameEs: 'Plutón',
    color: '#a0826d',
    // ... todos los campos requeridos
  }
];
```

2. **El planeta aparecerá automáticamente** en la visualización

3. **Actualizar quiz** si es necesario

### Ejemplo: Agregar Nueva Herramienta

1. **Agregar tipo en `App.tsx`**:
```typescript
type ToolMode = 'weight' | 'travel' | 'age' | 'gravity' | 'newTool';
```

2. **Agregar botón en `ToolsPanel`**:
```typescript
<button onClick={() => setToolMode('newTool')}>
  🆕 Nueva Herramienta
</button>
```

3. **Implementar la herramienta**:
```typescript
{toolMode === 'newTool' && (
  <div>
    {/* UI de la herramienta */}
  </div>
)}
```

### Ejemplo: Agregar Nuevo Logro

1. **Definir logro**:
```typescript
const [achievements, setAchievements] = useState<Achievement[]>([
  // ... logros existentes
  {
    id: 'new_achievement',
    title: 'Nuevo Logro',
    description: 'Descripción del logro',
    icon: '🎯',
    unlocked: false
  }
]);
```

2. **Agregar trigger**:
```typescript
useEffect(() => {
  if (condition) {
    unlockAchievement('new_achievement');
  }
}, [dependency]);
```

## 🐛 Debugging

### Console Logs

```typescript
// Debug de posiciones de planetas
console.log('Planetas:', planetsRef.current.map(p => ({
  name: p.nameEs,
  angle: p.angle,
  x: Math.cos(p.angle) * p.orbitRadius,
  y: Math.sin(p.angle) * p.orbitRadius
})));

// Debug de cámara
console.log('Cámara:', camera);

// Debug de FPS
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log('FPS:', frames);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}
```

### React DevTools

1. Instalar extensión de navegador
2. Inspeccionar componentes
3. Ver estado y props
4. Profiler para rendimiento

### Performance Profiling

```bash
# Build de producción con profiling
npm run build -- --profile

# Analizar bundle
npm run build
# Luego usar source-map-explorer o webpack-bundle-analyzer
```

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con HMR
npm run dev -- --host    # Servidor accesible en red local

# Producción
npm run build            # Compilar para producción
npm run preview          # Vista previa de producción

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run type-check       # Verificar tipos TypeScript

# Limpieza
rm -rf node_modules      # Eliminar dependencias
rm -rf dist              # Eliminar build
npm install              # Reinstalar todo
```

## 🧪 Testing (Futuro)

### Configurar Jest

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Ejemplo de Test

```typescript
// src/__tests__/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders solar system', () => {
  render(<App />);
  expect(screen.getByText('Sistema Solar Interactivo')).toBeInTheDocument();
});
```

## 🚀 Despliegue

### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy

# Desplegar a producción
netlify deploy --prod
```

### GitHub Pages

```bash
# Instalar gh-pages
npm install -D gh-pages

# Agregar a package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Desplegar
npm run deploy
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/)

### Tutoriales
- [Canvas Tutorial - MDN](https://developer.mozilla.org/docs/Web/API/Canvas_API/Tutorial)
- [React Hooks - React Docs](https://react.dev/learn/hooks-overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

### Herramientas
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com/)

## 💡 Consejos y Trucos

### Rendimiento

1. **Usar refs para datos que cambian frecuentemente**
```typescript
const planetsRef = useRef<Planet[]>([]);
// En lugar de useState que causa re-renders
```

2. **Memoizar funciones de dibujo**
```typescript
const draw = useCallback((ctx, width, height, time) => {
  // ...
}, [dependencies]);
```

3. **Limitar actualizaciones de estado**
```typescript
// ❌ Malo: Actualizar estado en cada frame
setPlanets(planets.map(p => updatePlanet(p)));

// ✅ Bueno: Usar refs
planetsRef.current = planetsRef.current.map(p => updatePlanet(p));
```

### Código Limpio

1. **Extraer componentes reutilizables**
```typescript
// En lugar de repetir JSX
function StatCard({ icon, label, value }) {
  return <div>...</div>;
}
```

2. **Usar TypeScript estricto**
```typescript
// Definir interfaces claras
interface Planet {
  id: string;
  name: string;
  // ...
}
```

3. **Comentar código complejo**
```typescript
// Calcular terminador día/noche basado en posición relativa al sol
const shadowAngle = Math.atan2(py, px) + Math.PI;
```

### Accesibilidad

1. **Siempre agregar labels a inputs**
```typescript
<label htmlFor="weight">Peso</label>
<input id="weight" type="range" />
```

2. **Usar botones para acciones**
```typescript
// ✅ Bueno
<button onClick={handleClick}>Click</button>

// ❌ Malo
<div onClick={handleClick}>Click</div>
```

3. **Proveer alternativas de teclado**
```typescript
// Atajos de teclado
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsPlaying(p => !p);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

**¿Tienes preguntas?** Abre un [issue](https://github.com/tu-usuario/sistema-solar-interactivo/issues) o contacta a [tu@email.com]
