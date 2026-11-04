# Arquitectura del Proyecto

## Visión General

El Sistema Solar Interactivo es una aplicación React de página única (SPA) que utiliza Canvas API para renderizar animaciones en tiempo real. La arquitectura está diseñada para ser modular, mantenible y escalable.

## Estructura de Componentes

### Componente Principal: `App.tsx`

El componente `App` es el corazón de la aplicación y gestiona:

#### Estado Global
```typescript
// Estado de la simulación
isPlaying: boolean           // Control de reproducción
speed: number               // Velocidad de simulación
timeElapsed: number         // Tiempo transcurrido

// Estado de la cámara
camera: {
  x: number,               // Posición X
  y: number,               // Posición Y
  zoom: number             // Nivel de zoom
}

// Estado de interacción
selectedPlanet: Planet      // Planeta seleccionado
hoveredPlanet: string       // Planeta bajo el cursor
followPlanet: string        // Planeta siendo seguido

// Estado de visualización
showOrbits: boolean         // Mostrar órbitas
showLabels: boolean         // Mostrar nombres
showTrails: boolean         // Mostrar estelas
showHabitableZone: boolean  // Zona habitable
showSolarWind: boolean      // Viento solar
showAsteroidBelt: boolean   // Cinturón de asteroides
showMinimap: boolean        // Minimapa

// Estado de UI
viewMode: ViewMode          // Modo actual (explore, quiz, etc)
toolMode: ToolMode          // Herramienta activa
```

#### Sistema de Referencias (Refs)

Para optimizar el rendimiento, se usan refs para datos que cambian frecuentemente:

```typescript
planetsRef          // Array de planetas con posiciones actuales
trailsRef           // Map de estelas por planeta
asteroidsRef        // Array de asteroides del cinturón
starsRef            // Array de estrellas de fondo
solarWindRef        // Array de partículas de viento solar
shootingStarsRef    // Array de estrellas fugaces
```

#### Loop de Animación

```typescript
useEffect(() => {
  const animate = (time: number) => {
    // 1. Calcular delta time
    // 2. Actualizar posiciones de planetas
    // 3. Actualizar partículas
    // 4. Actualizar cámara (si sigue planeta)
    // 5. Dibujar todo en canvas
    // 6. Solicitar siguiente frame
    animationRef.current = requestAnimationFrame(animate);
  };
  animationRef.current = requestAnimationFrame(animate);
}, [dependencies]);
```

## Sistema de Datos

### Estructura de Datos (`data/planets.ts`)

#### Planetas
```typescript
interface Planet {
  id: string;                    // Identificador único
  name: string;                  // Nombre en inglés
  nameEs: string;                // Nombre en español
  color: string;                 // Color principal (hex)
  colorDark: string;             // Color oscuro para sombras
  colorLight: string;            // Color claro para highlights
  
  // Datos visuales
  radius: number;                // Radio visual en canvas
  orbitRadius: number;           // Radio de órbita en canvas
  
  // Datos científicos
  realRadius: number;            // Radio real (km)
  distanceFromSun: number;       // Distancia al Sol (M km)
  orbitalPeriod: number;         // Período orbital (años)
  orbitalPeriodDays: number;     // Período orbital (días)
  rotationPeriodHours: number;   // Rotación (horas)
  gravity: number;               // Gravedad (m/s²)
  temperature: string;           // Temperatura (texto)
  temperatureC: number;          // Temperatura (°C)
  mass: string;                  // Masa (notación científica)
  density: number;               // Densidad (g/cm³)
  escapeVelocity: string;        // Velocidad de escape
  atmosphere: string;            // Composición atmosférica
  
  // Características
  type: string;                  // Tipo (Terrestrial, Gas Giant, etc)
  typeEs: string;                // Tipo en español
  moons: number;                 // Número de lunas
  hasRings: boolean;             // Tiene anillos
  magneticField: boolean;        // Tiene campo magnético
  
  // Contenido educativo
  description: string;           // Descripción larga
  funFacts: string[];            // Datos curiosos
  discoveredBy?: string;         // Descubridor
  discoveryYear?: number;        // Año de descubrimiento
  emoji: string;                 // Emoji representativo
}
```

#### Misiones Espaciales
```typescript
interface SpaceMission {
  name: string;          // Nombre de la misión
  year: number;          // Año de lanzamiento
  planet: string;        // ID del planeta objetivo
  status: 'active' | 'ended';  // Estado actual
  description: string;   // Descripción
  distance: string;      // Distancia actual
}
```

#### Preguntas de Quiz
```typescript
interface QuizQuestion {
  question: string;      // Pregunta
  options: string[];     // Opciones de respuesta
  correct: number;       // Índice de respuesta correcta
  explanation: string;   // Explicación detallada
}
```

## Sistema de Renderizado

### Canvas 2D

El renderizado se realiza en capas (de atrás hacia adelante):

1. **Fondo**
   - Color base (#030308)
   - Nebulosas (gradientes radiales)
   - Estrellas (con parpadeo)
   - Estrellas fugaces (animadas)

2. **Elementos de fondo**
   - Zona habitable (si está activa)
   - Órbitas planetarias
   - Cinturón de asteroides
   - Viento solar

3. **Estelas**
   - Trails de planetas (con desvanecimiento)

4. **Sol**
   - Corona exterior
   - Cuerpo del sol
   - Manchas solares animadas

5. **Planetas**
   - Anillos de selección/seguimiento
   - Glow de hover
   - Cuerpo del planeta (gradiente)
   - Terminador día/noche
   - Anillos (Saturno, Urano, etc)
   - Etiquetas

### Optimizaciones de Rendimiento

1. **RequestAnimationFrame**: Sincronización con refresh rate del monitor
2. **Delta Time**: Animaciones independientes de framerate
3. **Canvas State Management**: Save/restore para transformaciones
4. **Limited Trail Length**: Máximo 200 puntos por estela
5. **Particle Pooling**: Reutilización de partículas
6. **Conditional Rendering**: Solo dibujar elementos visibles

## Sistema de Interacción

### Eventos del Mouse

```typescript
// Click: Seleccionar planeta o sol
handleClick(e: MouseEvent) {
  // Convertir coordenadas de pantalla a mundo
  // Verificar colisión con planetas
  // Actualizar selectedPlanet
}

// Mouse Move: Hover y arrastre
handleMouseMove(e: MouseEvent) {
  if (isDragging) {
    // Actualizar posición de cámara
  } else {
    // Detectar hover sobre planetas
  }
}

// Mouse Down: Iniciar arrastre
handleMouseDown(e: MouseEvent) {
  setIsDragging(true);
  setDragStart({ x, y });
}

// Mouse Wheel: Zoom
handleWheel(e: WheelEvent) {
  // Calcular nuevo zoom
  // Aplicar límites (0.2x - 8x)
}
```

### Sistema de Cámara

```typescript
interface CameraState {
  x: number;      // Offset X del centro
  y: number;      // Offset Y del centro
  zoom: number;   // Factor de escala
}

// Transformación de coordenadas
function screenToWorld(screenX, screenY, camera) {
  const centerX = canvas.width / 2 + camera.x;
  const centerY = canvas.height / 2 + camera.y;
  
  const worldX = (screenX - centerX) / camera.zoom;
  const worldY = (screenY - centerY) / camera.zoom;
  
  return { x: worldX, y: worldY };
}
```

## Sistema de Logros

### Estructura de Logros
```typescript
interface Achievement {
  id: string;           // Identificador único
  title: string;        // Nombre del logro
  description: string;  // Descripción
  icon: string;         // Emoji del logro
  unlocked: boolean;    // Estado de desbloqueo
}
```

### Triggers de Logros
```typescript
// Primer click en planeta
useEffect(() => {
  if (selectedPlanet) {
    unlockAchievement('first_click');
    // Actualizar contador de planetas visitados
    if (visitedPlanets.size >= 4) unlockAchievement('explorer');
    if (visitedPlanets.size >= 8) unlockAchievement('scholar');
  }
}, [selectedPlanet]);

// Velocidad máxima
useEffect(() => {
  if (speed >= 10) unlockAchievement('speed_demon');
}, [speed]);

// Zoom máximo
useEffect(() => {
  if (camera.zoom >= 3) unlockAchievement('zoom_master');
}, [camera.zoom]);
```

## Herramientas Interactivas

### Calculadora de Peso
```typescript
function calculateWeightOnPlanet(earthWeight: number, planet: Planet): number {
  // Fórmula: peso_planeta = peso_tierra * (gravedad_planeta / gravedad_tierra)
  return earthWeight * (planet.gravity / 9.81);
}
```

### Calculadora de Viaje
```typescript
function calculateTravelTime(from: Planet, to: Planet, speed: number): string {
  // Distancia aproximada (asumiendo órbitas circulares)
  const distanceKm = Math.abs(to.distanceFromSun - from.distanceFromSun) * 1_000_000;
  
  // Tiempo en horas
  const hours = distanceKm / speed;
  
  // Formatear resultado
  if (hours < 24) return `${hours.toFixed(1)} horas`;
  if (hours < 24 * 365) return `${(hours / 24).toFixed(0)} días`;
  return `${(hours / 24 / 365).toFixed(1)} años`;
}
```

### Calculadora de Edad Planetaria
```typescript
function calculatePlanetAge(earthAge: number, planet: Planet): number {
  // Convertir edad terrestre a días
  const earthDays = earthAge * 365.25;
  
  // Convertir a años del planeta objetivo
  const planetYears = earthDays / planet.orbitalPeriodDays;
  
  return planetYears;
}
```

### Simulador de Gravedad
```typescript
function simulateGravityDrop(height: number, gravity: number): {
  time: number;      // Tiempo de caída (s)
  velocity: number;  // Velocidad final (m/s)
} {
  // Fórmula: t = √(2h/g)
  const time = Math.sqrt(2 * height / gravity);
  
  // Fórmula: v = g * t
  const velocity = gravity * time;
  
  return { time, velocity };
}
```

## Gestión de Estado

### Estado Local vs Global

- **Estado Local**: UI temporal (modales, dropdowns, etc)
- **Estado Global**: Simulación, cámara, selección de planetas

### Actualización de Estado

```typescript
// Actualización asíncrona con refs
useEffect(() => {
  speedRef.current = speed;
}, [speed]);

// Uso en loop de animación
if (isPlayingRef.current) {
  planet.angle += angularSpeed * delta * speedRef.current;
}
```

## Rendimiento y Optimización

### Métricas de Rendimiento

- **FPS Objetivo**: 60 FPS
- **Tiempo de Frame**: < 16.67ms
- **Partículas Máximas**: ~500 (estrellas + asteroides + viento solar)
- **Trail Points**: Máximo 200 por planeta

### Técnicas de Optimización

1. **Canvas Offscreen** (futuro): Renderizar en canvas separado
2. **Web Workers** (futuro): Cálculos en hilo separado
3. **Spatial Partitioning**: Solo procesar elementos visibles
4. **Level of Detail**: Reducir detalle con zoom bajo
5. **Debouncing**: Limitar actualizaciones de estado frecuentes

## Accesibilidad

### Características de Accesibilidad

- **Atajos de Teclado**: Todas las funciones principales
- **ARIA Labels**: En botones y controles
- **Contraste de Colores**: Cumple WCAG AA
- **Texto Redimensionable**: Usa unidades relativas
- **Navegación por Teclado**: Tab order lógico

### Mejoras Futuras

- Screen reader support
- Modo de alto contraste
- Reducción de movimiento
- Subtítulos para contenido educativo

## Testing (Futuro)

### Estrategia de Testing

```typescript
// Tests unitarios para funciones puras
describe('calculateWeightOnPlanet', () => {
  it('should calculate weight correctly', () => {
    const earthWeight = 70;
    const mars = PLANETS_DATA.find(p => p.id === 'mars');
    const result = calculateWeightOnPlanet(earthWeight, mars);
    expect(result).toBeCloseTo(26.6, 1);
  });
});

// Tests de componentes
describe('PlanetInfoPanel', () => {
  it('should display planet information', () => {
    render(<PlanetInfoPanel planet={earth} onClose={jest.fn()} />);
    expect(screen.getByText('Tierra')).toBeInTheDocument();
  });
});

// Tests de integración
describe('Solar System Simulation', () => {
  it('should animate planets correctly', () => {
    render(<App />);
    // Verificar que los planetas se mueven
  });
});
```

## Despliegue

### Build de Producción

```bash
npm run build
```

Genera:
- `dist/index.html` - HTML principal
- `dist/assets/*.js` - JavaScript optimizado
- `dist/assets/*.css` - CSS optimizado

### Hosting

Opciones recomendadas:
- **Vercel**: Despliegue automático desde GitHub
- **Netlify**: Similar a Vercel
- **GitHub Pages**: Gratuito para repos públicos
- **Cloudflare Pages**: CDN global

### Variables de Entorno

```bash
# .env.production
VITE_APP_VERSION=2.0.0
VITE_APP_NAME=Sistema Solar Interactivo
```

## Futuras Mejoras

### Corto Plazo
- [ ] Agregar planetas enanos (Plutón, Ceres)
- [ ] Modo offline con Service Worker
- [ ] Compartir configuraciones via URL
- [ ] Exportar capturas de pantalla

### Mediano Plazo
- [ ] Implementar Three.js para modo 3D
- [ ] Agregar sonidos espaciales
- [ ] Sistema de guardado de progreso
- [ ] Modo educativo para profesores

### Largo Plazo
- [ ] Realidad virtual (WebXR)
- [ ] Simulación de exoplanetas
- [ ] API pública para datos
- [ ] App móvil nativa

## Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API)
- [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Última actualización**: Enero 2024
