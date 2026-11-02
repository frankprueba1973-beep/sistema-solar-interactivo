import { useState, useEffect, useRef, useCallback } from 'react';

interface Planet {
  name: string;
  nameEs: string;
  color: string;
  radius: number;
  orbitRadius: number;
  orbitalPeriod: number; // in Earth years
  realRadius: number; // in km
  distanceFromSun: number; // in million km
  orbitalPeriodDays: number; // in Earth days
  description: string;
  angle: number;
  moons: number;
}

const PLANETS_DATA: Omit<Planet, 'angle'>[] = [
  {
    name: 'Mercury',
    nameEs: 'Mercurio',
    color: '#b5b5b5',
    radius: 4,
    orbitRadius: 60,
    orbitalPeriod: 0.24,
    realRadius: 2439,
    distanceFromSun: 57.9,
    orbitalPeriodDays: 88,
    description: 'El planeta más pequeño y cercano al Sol. No tiene atmósfera significativa y sus temperaturas varían extremadamente.',
    moons: 0,
  },
  {
    name: 'Venus',
    nameEs: 'Venus',
    color: '#e8cda0',
    radius: 7,
    orbitRadius: 90,
    orbitalPeriod: 0.62,
    realRadius: 6052,
    distanceFromSun: 108.2,
    orbitalPeriodDays: 225,
    description: 'El planeta más caliente del sistema solar debido a su efecto invernadero extremo. Rota en dirección opuesta a la mayoría de los planetas.',
    moons: 0,
  },
  {
    name: 'Earth',
    nameEs: 'Tierra',
    color: '#4da6ff',
    radius: 8,
    orbitRadius: 125,
    orbitalPeriod: 1,
    realRadius: 6371,
    distanceFromSun: 149.6,
    orbitalPeriodDays: 365,
    description: 'Nuestro hogar. El único planeta conocido que alberga vida. Tiene agua líquida en su superficie y una atmósfera protectora.',
    moons: 1,
  },
  {
    name: 'Mars',
    nameEs: 'Marte',
    color: '#e85d3a',
    radius: 5,
    orbitRadius: 165,
    orbitalPeriod: 1.88,
    realRadius: 3390,
    distanceFromSun: 227.9,
    orbitalPeriodDays: 687,
    description: 'El "Planeta Rojo" debido al óxido de hierro en su superficie. Tiene el volcán más grande del sistema solar: Olympus Mons.',
    moons: 2,
  },
  {
    name: 'Jupiter',
    nameEs: 'Júpiter',
    color: '#c8a45c',
    radius: 18,
    orbitRadius: 220,
    orbitalPeriod: 11.86,
    realRadius: 69911,
    distanceFromSun: 778.5,
    orbitalPeriodDays: 4333,
    description: 'El planeta más grande del sistema solar. Su Gran Mancha Roja es una tormenta que ha durado más de 400 años.',
    moons: 95,
  },
  {
    name: 'Saturn',
    nameEs: 'Saturno',
    color: '#e8d5a3',
    radius: 15,
    orbitRadius: 280,
    orbitalPeriod: 29.46,
    realRadius: 58232,
    distanceFromSun: 1434,
    orbitalPeriodDays: 10759,
    description: 'Famoso por sus espectaculares anillos compuestos de hielo y roca. Es tan poco denso que flotaría en agua.',
    moons: 146,
  },
  {
    name: 'Uranus',
    nameEs: 'Urano',
    color: '#7de8e8',
    radius: 11,
    orbitRadius: 340,
    orbitalPeriod: 84.01,
    realRadius: 25362,
    distanceFromSun: 2871,
    orbitalPeriodDays: 30687,
    description: 'Un gigante de hielo que rota de lado. Su eje de rotación está inclinado casi 98 grados respecto a su órbita.',
    moons: 28,
  },
  {
    name: 'Neptune',
    nameEs: 'Neptuno',
    color: '#4166f5',
    radius: 10,
    orbitRadius: 390,
    orbitalPeriod: 164.8,
    realRadius: 24622,
    distanceFromSun: 4495,
    orbitalPeriodDays: 60190,
    description: 'El planeta más lejano del Sol. Tiene los vientos más fuertes del sistema solar, alcanzando 2,100 km/h.',
    moons: 16,
  },
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<Planet[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize planets
  useEffect(() => {
    planetsRef.current = PLANETS_DATA.map((p) => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
    }));
  }, []);

  const drawSolarSystem = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    const starSeed = 42;
    for (let i = 0; i < 200; i++) {
      const x = ((starSeed * (i + 1) * 7919) % width);
      const y = ((starSeed * (i + 1) * 6271) % height);
      const size = ((i * 3571) % 3) * 0.5 + 0.5;
      const opacity = ((i * 2347) % 100) / 100 * 0.7 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Draw orbit paths
    planetsRef.current.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = selectedPlanet?.name === planet.name
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = selectedPlanet?.name === planet.name ? 1.5 : 0.5;
      ctx.stroke();
    });

    // Draw Sun with glow
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    sunGradient.addColorStop(0, '#fff7e6');
    sunGradient.addColorStop(0.3, '#ffcc00');
    sunGradient.addColorStop(0.7, '#ff8800');
    sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun corona
    const coronaGradient = ctx.createRadialGradient(centerX, centerY, 25, centerX, centerY, 55);
    coronaGradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    coronaGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    ctx.fillStyle = coronaGradient;
    ctx.fill();

    // Draw planets
    planetsRef.current.forEach((planet) => {
      const x = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const y = centerY + Math.sin(planet.angle) * planet.orbitRadius;

      // Planet glow for selected/hovered
      if (selectedPlanet?.name === planet.name || hoveredPlanet === planet.name) {
        const glowGradient = ctx.createRadialGradient(x, y, planet.radius, x, y, planet.radius + 10);
        glowGradient.addColorStop(0, planet.color + '80');
        glowGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, planet.radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        x - planet.radius * 0.3,
        y - planet.radius * 0.3,
        0,
        x,
        y,
        planet.radius
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      ctx.beginPath();
      ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      // Saturn rings
      if (planet.name === 'Saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, planet.radius + 8, (planet.radius + 8) * 0.3, 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(210, 180, 120, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Planet label
      if (selectedPlanet?.name === planet.name || hoveredPlanet === planet.name) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(planet.nameEs, x, y - planet.radius - 8);
      }
    });
  }, [selectedPlanet, hoveredPlanet]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    if (isPlayingRef.current) {
      planetsRef.current.forEach((planet) => {
        const angularSpeed = (Math.PI * 2) / (planet.orbitalPeriod * 60);
        planet.angle += angularSpeed * delta * speedRef.current;
      });
    }

    const width = canvas.width;
    const height = canvas.height;
    drawSolarSystem(ctx, width, height);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawSolarSystem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let clickedPlanet: Planet | null = null;

    for (const planet of planetsRef.current) {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (dist <= planet.radius + 5) {
        clickedPlanet = planet;
        break;
      }
    }

    setSelectedPlanet(clickedPlanet);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let hovered: string | null = null;

    for (const planet of planetsRef.current) {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (dist <= planet.radius + 5) {
        hovered = planet.name;
        break;
      }
    }

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#0d1033] border-b border-indigo-900/50 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌌</span>
          <div>
            <h1 className="text-white text-lg font-bold">Sistema Solar Interactivo</h1>
            <p className="text-indigo-300 text-xs">Haz clic en un planeta para aprender más</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-300 text-sm hidden sm:inline">Velocidad:</span>
          <div className="flex items-center gap-1">
            {[0.25, 0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  speed === s
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full"
          />

          {/* Play/Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600/90 hover:bg-indigo-500 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30 backdrop-blur-sm"
          >
            {isPlaying ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span className="text-sm font-medium">Pausar</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm font-medium">Reproducir</span>
              </>
            )}
          </button>
        </div>

        {/* Info Panel */}
        {selectedPlanet && (
          <div className="w-80 bg-[#0d1033]/95 backdrop-blur-md border-l border-indigo-900/50 p-6 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color})`,
                    boxShadow: `0 0 15px ${selectedPlanet.color}50`,
                  }}
                />
                <div>
                  <h2 className="text-white text-xl font-bold">{selectedPlanet.nameEs}</h2>
                  <p className="text-indigo-400 text-xs">{selectedPlanet.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-indigo-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              {selectedPlanet.description}
            </p>

            <div className="space-y-3">
              <InfoRow
                icon="📏"
                label="Radio"
                value={`${selectedPlanet.realRadius.toLocaleString()} km`}
              />
              <InfoRow
                icon="☀️"
                label="Distancia al Sol"
                value={`${selectedPlanet.distanceFromSun.toLocaleString()} millones km`}
              />
              <InfoRow
                icon="🔄"
                label="Período orbital"
                value={
                  selectedPlanet.orbitalPeriodDays < 365
                    ? `${selectedPlanet.orbitalPeriodDays} días`
                    : `${selectedPlanet.orbitalPeriod} años (${selectedPlanet.orbitalPeriodDays.toLocaleString()} días)`
                }
              />
              <InfoRow
                icon="🌙"
                label="Lunas"
                value={`${selectedPlanet.moons}`}
              />
              <InfoRow
                icon="⏱️"
                label="Período orbital"
                value={`${selectedPlanet.orbitalPeriod} años terrestres`}
              />
            </div>

            {/* Size comparison */}
            <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-800/30">
              <h3 className="text-indigo-300 text-xs font-semibold uppercase mb-3">
                Comparación de tamaño (vs Tierra)
              </h3>
              <div className="flex items-end gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full bg-blue-400"
                    style={{
                      width: `${Math.max(8, (selectedPlanet.realRadius / 6371) * 20)}px`,
                      height: `${Math.max(8, (selectedPlanet.realRadius / 6371) * 20)}px`,
                    }}
                  />
                  <span className="text-indigo-400 text-[10px] mt-1">{selectedPlanet.nameEs}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full bg-blue-500"
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span className="text-indigo-400 text-[10px] mt-1">Tierra</span>
                </div>
              </div>
              <p className="text-indigo-300 text-xs mt-2">
                {selectedPlanet.nameEs} es{' '}
                {(selectedPlanet.realRadius / 6371).toFixed(2)}x el radio de la Tierra
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Planet quick select bar */}
      <div className="bg-[#0d1033] border-t border-indigo-900/50 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto">
        {planetsRef.current.map((planet) => (
          <button
            key={planet.name}
            onClick={() => setSelectedPlanet(planet)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              selectedPlanet?.name === planet.name
                ? 'bg-indigo-600/50 text-white border border-indigo-400/50'
                : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: planet.color }}
            />
            {planet.nameEs}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-900/20 border border-indigo-800/20">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-indigo-400 text-[10px] uppercase font-semibold">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export default App;
