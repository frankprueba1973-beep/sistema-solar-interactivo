import { useState, useEffect, useRef, useCallback } from 'react';
import { PLANETS_DATA, SUN_DATA, QUIZ_QUESTIONS, SPACE_MISSIONS, HABITABLE_ZONE, type Planet } from './data/planets';

type ViewMode = 'explore' | 'quiz' | 'compare' | 'facts' | 'missions' | 'tools';
type ToolMode = 'weight' | 'travel' | 'age' | 'gravity' | 'scale';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<(Planet & { angle: number; rotationAngle: number })[]>([]);
  const trailsRef = useRef<Map<string, TrailPoint[]>>(new Map());

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<(Planet & { angle: number; rotationAngle: number }) | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showHabitableZone, setShowHabitableZone] = useState(false);
  const [showSolarWind, setShowSolarWind] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [toolMode, setToolMode] = useState<ToolMode>('weight');
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [followPlanet, setFollowPlanet] = useState<string | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const [quizState, setQuizState] = useState({ current: 0, score: 0, answered: false, selectedAnswer: -1, finished: false });
  const [currentFact, setCurrentFact] = useState(0);
  const [comparisonPlanets, setComparisonPlanets] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [visitedPlanets, setVisitedPlanets] = useState<Set<string>>(new Set());
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_click', title: 'Primer Contacto', description: 'Haz clic en un planeta', icon: '👆', unlocked: false },
    { id: 'explorer', title: 'Explorador', description: 'Visita 4 planetas', icon: '🔭', unlocked: false },
    { id: 'scholar', title: 'Erudito', description: 'Visita todos los planetas', icon: '🎓', unlocked: false },
    { id: 'quiz_master', title: 'Maestro del Quiz', description: 'Obtén 100% en el quiz', icon: '🏆', unlocked: false },
    { id: 'speed_demon', title: 'Velocista', description: 'Alcanza 10x velocidad', icon: '⚡', unlocked: false },
    { id: 'zoom_master', title: 'Ojo de Águila', description: 'Haz zoom 3x o más', icon: '🔍', unlocked: false },
    { id: 'mission_fan', title: 'Fan de Misiones', description: 'Explora la sección de misiones', icon: '🚀', unlocked: false },
    { id: 'comparer', title: 'Comparador', description: 'Compara 3+ planetas', icon: '📊', unlocked: false },
  ]);
  const [showAchievementPopup, setShowAchievementPopup] = useState<Achievement | null>(null);
  const [userWeight, setUserWeight] = useState(70);
  const [travelFrom, setTravelFrom] = useState('earth');
  const [travelTo, setTravelTo] = useState('mars');
  const [travelSpeed, setTravelSpeed] = useState(58000); // km/h (average spacecraft)
  const [userAge, setUserAge] = useState(25);
  const [agePlanet, setAgePlanet] = useState('earth');
  // realScale mode could be toggled for real distance visualization
  const [gravityDropHeight, setGravityDropHeight] = useState(10);
  const [gravityDropping, setGravityDropping] = useState(false);
  const [gravityTime, setGravityTime] = useState(0);
  const [gravityVelocity, setGravityVelocity] = useState(0);
  const [showMinimap, setShowMinimap] = useState(true);

  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);
  const isPlayingRef = useRef(isPlaying);
  const cameraRef = useRef(camera);
  const asteroidsRef = useRef<{ angle: number; radius: number; size: number; speed: number }[]>([]);
  const shootingStarsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; brightness: number; twinkleSpeed: number }[]>([]);
  const solarWindRef = useRef<{ angle: number; radius: number; speed: number; size: number }[]>([]);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { cameraRef.current = camera; }, [camera]);

  // Check achievements
  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const ach = prev.find(a => a.id === id);
      if (ach && !ach.unlocked) {
        setShowAchievementPopup(ach);
        setTimeout(() => setShowAchievementPopup(null), 3000);
        return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
      }
      return prev;
    });
  }, []);

  // Initialize
  useEffect(() => {
    planetsRef.current = PLANETS_DATA.map((p) => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
      rotationAngle: 0,
    }));

    asteroidsRef.current = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 195 + Math.random() * 28,
      size: Math.random() * 1.5 + 0.3,
      speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
    }));

    starsRef.current = Array.from({ length: 350 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    solarWindRef.current = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 30 + Math.random() * 200,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 2 + 0.5,
    }));

    // Init trails
    PLANETS_DATA.forEach(p => {
      trailsRef.current.set(p.id, []);
    });
  }, []);

  // Visit planet achievement
  useEffect(() => {
    if (selectedPlanet) {
      const newVisited = new Set(visitedPlanets);
      newVisited.add(selectedPlanet.id);
      setVisitedPlanets(newVisited);

      if (!achievements.find(a => a.id === 'first_click')?.unlocked) unlockAchievement('first_click');
      if (newVisited.size >= 4) unlockAchievement('explorer');
      if (newVisited.size >= 8) unlockAchievement('scholar');
    }
  }, [selectedPlanet]);

  // Speed achievement
  useEffect(() => {
    if (speed >= 10) unlockAchievement('speed_demon');
  }, [speed]);

  // Zoom achievement
  useEffect(() => {
    if (camera.zoom >= 3) unlockAchievement('zoom_master');
  }, [camera.zoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowUp' || e.code === 'Equal') setSpeed(s => Math.min(s * 2, 20));
      if (e.code === 'ArrowDown' || e.code === 'Minus') setSpeed(s => Math.max(s / 2, 0.1));
      if (e.code === 'KeyO') setShowOrbits(o => !o);
      if (e.code === 'KeyL') setShowLabels(l => !l);
      if (e.code === 'KeyT') setShowTrails(t => !t);
      if (e.code === 'KeyH') setShowHabitableZone(h => !h);
      if (e.code === 'KeyR') { setCamera({ x: 0, y: 0, zoom: 1 }); setFollowPlanet(null); }
      if (e.code === 'Escape') { setSelectedPlanet(null); setShowSunInfo(false); }
      if (e.code === 'KeyF') setFollowPlanet(null);
      if (e.code === 'KeyM') setShowMinimap(m => !m);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(c => ({ ...c, zoom: Math.max(0.2, Math.min(8, c.zoom * delta)) }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cameraRef.current.x, y: e.clientY - cameraRef.current.y });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isDragging) {
      setCamera(c => ({ ...c, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - cameraRef.current.x) / cameraRef.current.zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - cameraRef.current.y) / cameraRef.current.zoom;
    let hovered: string | null = null;
    for (const planet of planetsRef.current) {
      const px = Math.cos(planet.angle) * planet.orbitRadius;
      const py = Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) { hovered = planet.id; break; }
    }
    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - cameraRef.current.x) / cameraRef.current.zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - cameraRef.current.y) / cameraRef.current.zoom;
    const sunDist = Math.sqrt(x ** 2 + y ** 2);
    if (sunDist <= 30) { setShowSunInfo(true); setSelectedPlanet(null); return; }
    let clicked: (Planet & { angle: number; rotationAngle: number }) | null = null;
    for (const planet of planetsRef.current) {
      const px = Math.cos(planet.angle) * planet.orbitRadius;
      const py = Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) { clicked = planet; break; }
    }
    setSelectedPlanet(clicked);
    setShowSunInfo(false);
  }, []);

  // Drawing function
  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const cam = cameraRef.current;
    const centerX = width / 2 + cam.x;
    const centerY = height / 2 + cam.y;

    // Background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, width, height);

    // Nebula effects
    const nebulaGrad = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, width * 0.5);
    nebulaGrad.addColorStop(0, 'rgba(40, 10, 80, 0.15)');
    nebulaGrad.addColorStop(0.5, 'rgba(10, 20, 60, 0.05)');
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);

    const nebulaGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 0, width * 0.2, height * 0.8, width * 0.4);
    nebulaGrad2.addColorStop(0, 'rgba(10, 40, 60, 0.1)');
    nebulaGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad2;
    ctx.fillRect(0, 0, width, height);

    // Stars with twinkling
    starsRef.current.forEach((star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });

    // Shooting stars
    if (Math.random() < 0.003) {
      shootingStarsRef.current.push({
        x: Math.random() * width, y: Math.random() * height * 0.5,
        vx: (Math.random() - 0.3) * 8, vy: Math.random() * 4 + 2, life: 1,
      });
    }
    shootingStarsRef.current = shootingStarsRef.current.filter(s => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.02;
      if (s.life <= 0) return false;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`; ctx.lineWidth = 1.5; ctx.stroke();
      return true;
    });

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(cam.zoom, cam.zoom);

    // Habitable zone
    if (showHabitableZone) {
      const hzInner = 120;
      const hzOuter = 145;
      const hzGrad = ctx.createRadialGradient(0, 0, hzInner, 0, 0, hzOuter);
      hzGrad.addColorStop(0, 'rgba(0, 255, 100, 0)');
      hzGrad.addColorStop(0.2, 'rgba(0, 255, 100, 0.05)');
      hzGrad.addColorStop(0.5, 'rgba(0, 200, 100, 0.08)');
      hzGrad.addColorStop(0.8, 'rgba(0, 255, 100, 0.05)');
      hzGrad.addColorStop(1, 'rgba(0, 255, 100, 0)');
      ctx.beginPath();
      ctx.arc(0, 0, hzOuter, 0, Math.PI * 2);
      ctx.arc(0, 0, hzInner, 0, Math.PI * 2, true);
      ctx.fillStyle = hzGrad;
      ctx.fill();
      // Label
      ctx.font = `${10 / cam.zoom}px sans-serif`;
      ctx.fillStyle = 'rgba(0, 255, 100, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Zona Habitable', 0, -(hzInner + hzOuter) / 2);
    }

    // Orbit paths
    if (showOrbits) {
      planetsRef.current.forEach((planet) => {
        ctx.beginPath();
        ctx.arc(0, 0, planet.orbitRadius, 0, Math.PI * 2);
        const isSelected = selectedPlanet?.id === planet.id;
        const isFollowed = followPlanet === planet.id;
        ctx.strokeStyle = isSelected || isFollowed
          ? `rgba(${hexToRgb(planet.color)}, 0.4)`
          : 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = (isSelected || isFollowed ? 1.5 : 0.5) / cam.zoom;
        ctx.setLineDash(isSelected ? [4 / cam.zoom, 4 / cam.zoom] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Asteroid belt
    if (showAsteroidBelt) {
      asteroidsRef.current.forEach((asteroid) => {
        const ax = Math.cos(asteroid.angle) * asteroid.radius;
        const ay = Math.sin(asteroid.angle) * asteroid.radius;
        ctx.beginPath();
        ctx.arc(ax, ay, asteroid.size / cam.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 130, 100, ${0.3 + Math.random() * 0.3})`;
        ctx.fill();
      });
    }

    // Solar wind particles
    if (showSolarWind) {
      solarWindRef.current.forEach((particle) => {
        const px = Math.cos(particle.angle) * particle.radius;
        const py = Math.sin(particle.angle) * particle.radius;
        const alpha = Math.max(0, 1 - particle.radius / 250) * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, particle.size / cam.zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
        ctx.fill();
      });
    }

    // Planet trails
    if (showTrails) {
      planetsRef.current.forEach((planet) => {
        const trail = trailsRef.current.get(planet.id) || [];
        if (trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = `rgba(${hexToRgb(planet.color)}, 0.3)`;
        ctx.lineWidth = 1.5 / cam.zoom;
        ctx.stroke();
      });
    }

    // Sun
    const sunPulse = Math.sin(time * 0.003) * 3;
    const coronaGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 65 + sunPulse);
    coronaGrad.addColorStop(0, 'rgba(255, 180, 50, 0.25)');
    coronaGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.05)');
    coronaGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, 65 + sunPulse, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    const sunGrad = ctx.createRadialGradient(-5, -5, 0, 0, 0, 28);
    sunGrad.addColorStop(0, '#fffbe6');
    sunGrad.addColorStop(0.2, '#ffee80');
    sunGrad.addColorStop(0.5, '#ffcc00');
    sunGrad.addColorStop(0.8, '#ff8800');
    sunGrad.addColorStop(1, '#cc4400');
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Sun surface spots
    for (let i = 0; i < 5; i++) {
      const spotAngle = time * 0.001 + i * 1.2;
      const spotX = Math.cos(spotAngle) * 12;
      const spotY = Math.sin(spotAngle) * 12;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 4 + Math.sin(time * 0.005 + i) * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.fill();
    }

    // Planets
    planetsRef.current.forEach((planet) => {
      const px = Math.cos(planet.angle) * planet.orbitRadius;
      const py = Math.sin(planet.angle) * planet.orbitRadius;
      const isSelected = selectedPlanet?.id === planet.id;
      const isHovered = hoveredPlanet === planet.id;
      const isFollowed = followPlanet === planet.id;
      const displayRadius = planet.radius * (isSelected || isHovered ? 1.3 : 1);

      if (isSelected || isFollowed) {
        ctx.beginPath();
        ctx.arc(px, py, displayRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${hexToRgb(planet.color)}, ${0.5 + Math.sin(time * 0.005) * 0.3})`;
        ctx.lineWidth = 2 / cam.zoom;
        ctx.stroke();
      }

      if (isHovered && !isSelected) {
        const glowGrad = ctx.createRadialGradient(px, py, displayRadius, px, py, displayRadius + 15);
        glowGrad.addColorStop(0, `rgba(${hexToRgb(planet.color)}, 0.3)`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, displayRadius + 15, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Planet shadow
      const shadowAngle = Math.atan2(py, px) + Math.PI;
      const planetGrad = ctx.createRadialGradient(
        px - displayRadius * 0.3, py - displayRadius * 0.3, 0, px, py, displayRadius
      );
      planetGrad.addColorStop(0, planet.colorLight);
      planetGrad.addColorStop(0.7, planet.color);
      planetGrad.addColorStop(1, planet.colorDark);
      ctx.beginPath();
      ctx.arc(px, py, displayRadius, 0, Math.PI * 2);
      ctx.fillStyle = planetGrad;
      ctx.fill();

      // Day/night terminator
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, displayRadius, 0, Math.PI * 2);
      ctx.clip();
      const shadowGrad = ctx.createLinearGradient(
        px + Math.cos(shadowAngle) * displayRadius,
        py + Math.sin(shadowAngle) * displayRadius,
        px - Math.cos(shadowAngle) * displayRadius,
        py - Math.sin(shadowAngle) * displayRadius
      );
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(px - displayRadius, py - displayRadius, displayRadius * 2, displayRadius * 2);
      ctx.restore();

      // Rings
      if (planet.hasRings && planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(px, py, displayRadius + 10, (displayRadius + 10) * 0.3, 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(210, 180, 120, 0.7)';
        ctx.lineWidth = 3 / cam.zoom;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(px, py, displayRadius + 6, (displayRadius + 6) * 0.3, 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(180, 150, 100, 0.4)';
        ctx.lineWidth = 2 / cam.zoom;
        ctx.stroke();
      }
      if (planet.hasRings && (planet.id === 'uranus' || planet.id === 'neptune' || planet.id === 'jupiter')) {
        ctx.beginPath();
        ctx.ellipse(px, py, displayRadius + 5, (displayRadius + 5) * 0.15, 1.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${hexToRgb(planet.color)}, 0.2)`;
        ctx.lineWidth = 1 / cam.zoom;
        ctx.stroke();
      }

      // Labels
      if (showLabels || isSelected || isHovered) {
        const fontSize = Math.max(9, 11 / cam.zoom);
        ctx.font = `${isSelected || isHovered ? 'bold ' : ''}${fontSize}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(planet.nameEs, px, py - displayRadius - 8 / cam.zoom);
      }
    });

    ctx.restore();
  }, [showOrbits, showLabels, showAsteroidBelt, showTrails, showHabitableZone, showSolarWind, selectedPlanet, hoveredPlanet, followPlanet]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (time: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlayingRef.current) {
        setTimeElapsed(t => t + delta * speedRef.current);
        planetsRef.current.forEach((planet) => {
          const angularSpeed = (Math.PI * 2) / (planet.orbitalPeriod * 60);
          planet.angle += angularSpeed * delta * speedRef.current;
          planet.rotationAngle += (delta * speedRef.current * 0.5);

          // Update trail
          if (showTrails) {
            const trail = trailsRef.current.get(planet.id) || [];
            const px = Math.cos(planet.angle) * planet.orbitRadius;
            const py = Math.sin(planet.angle) * planet.orbitRadius;
            trail.push({ x: px, y: py, age: 0 });
            if (trail.length > 200) trail.shift();
            trail.forEach(p => p.age += delta);
            trailsRef.current.set(planet.id, trail);
          }
        });
        asteroidsRef.current.forEach((a) => { a.angle += a.speed * delta * speedRef.current * 0.01; });
        solarWindRef.current.forEach((p) => {
          p.radius += p.speed * delta * speedRef.current * 2;
          if (p.radius > 300) { p.radius = 30; p.angle = Math.random() * Math.PI * 2; }
        });
      }

      if (followPlanet) {
        const planet = planetsRef.current.find(p => p.id === followPlanet);
        if (planet) {
          const px = Math.cos(planet.angle) * planet.orbitRadius;
          const py = Math.sin(planet.angle) * planet.orbitRadius;
          setCamera(c => ({ ...c, x: -px * c.zoom, y: -py * c.zoom }));
        }
      }

      draw(ctx, canvas.width, canvas.height, time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener('resize', resizeCanvas); cancelAnimationFrame(animationRef.current); };
  }, [draw, showTrails]);

  // Quiz logic
  const handleQuizAnswer = (answerIndex: number) => {
    if (quizState.answered) return;
    const question = QUIZ_QUESTIONS[quizState.current];
    const isCorrect = answerIndex === question.correct;
    setQuizState(s => ({ ...s, answered: true, selectedAnswer: answerIndex, score: isCorrect ? s.score + 1 : s.score }));
  };

  const nextQuestion = () => {
    if (quizState.current >= QUIZ_QUESTIONS.length - 1) {
      setQuizState(s => ({ ...s, finished: true }));
      if (quizState.score + (QUIZ_QUESTIONS[quizState.current].correct === quizState.selectedAnswer ? 0 : 0) === QUIZ_QUESTIONS.length) {
        unlockAchievement('quiz_master');
      }
    } else {
      setQuizState(s => ({ ...s, current: s.current + 1, answered: false, selectedAnswer: -1 }));
    }
  };

  const resetQuiz = () => { setQuizState({ current: 0, score: 0, answered: false, selectedAnswer: -1, finished: false }); };

  const toggleComparison = (planetId: string) => {
    setComparisonPlanets(prev => {
      const next = prev.includes(planetId) ? prev.filter(p => p !== planetId) : [...prev, planetId];
      if (next.length >= 3) unlockAchievement('comparer');
      return next;
    });
  };

  // Gravity simulator
  const startGravityDrop = () => {
    setGravityDropping(true);
    setGravityTime(0);
    setGravityVelocity(0);
    const planet = PLANETS_DATA.find(p => p.id === travelTo) || PLANETS_DATA[2];
    const g = planet.gravity;
    const totalTime = Math.sqrt(2 * gravityDropHeight / g);
    const interval = setInterval(() => {
      setGravityTime(t => {
        const newT = t + 0.05;
        if (newT >= totalTime) { clearInterval(interval); setGravityDropping(false); return totalTime; }
        setGravityVelocity(g * newT);
        return newT;
      });
    }, 50);
  };

  // Travel calculator
  const getTravelTime = () => {
    const from = PLANETS_DATA.find(p => p.id === travelFrom);
    const to = PLANETS_DATA.find(p => p.id === travelTo);
    if (!from || !to) return 'N/A';
    const distKm = Math.abs(to.distanceFromSun - from.distanceFromSun) * 1_000_000;
    const hours = distKm / travelSpeed;
    if (hours < 24) return `${hours.toFixed(1)} horas`;
    if (hours < 24 * 365) return `${(hours / 24).toFixed(0)} días`;
    return `${(hours / 24 / 365).toFixed(1)} años`;
  };

  // Age calculator
  const getPlanetAge = () => {
    const planet = PLANETS_DATA.find(p => p.id === agePlanet);
    if (!planet) return 'N/A';
    const earthDays = userAge * 365.25;
    const planetYears = earthDays / planet.orbitalPeriodDays;
    return planetYears.toFixed(2);
  };

  return (
    <div className="w-full h-screen bg-[#030308] flex flex-col overflow-hidden select-none">
      {/* Achievement popup */}
      {showAchievementPopup && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in bg-gradient-to-r from-yellow-900/90 to-amber-900/90 border border-yellow-500/50 rounded-xl p-4 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{showAchievementPopup.icon}</span>
            <div>
              <p className="text-yellow-300 text-[10px] uppercase font-bold">¡Logro desbloqueado!</p>
              <p className="text-white font-bold">{showAchievementPopup.title}</p>
              <p className="text-yellow-200/70 text-xs">{showAchievementPopup.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-[#060618] via-[#0a0a30] to-[#060618] border-b border-indigo-900/40 px-3 py-2 flex items-center justify-between z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-sm">☀️</div>
          <div>
            <h1 className="text-white text-sm font-bold tracking-wide">Sistema Solar Interactivo</h1>
            <p className="text-indigo-400 text-[9px]">Explora • Aprende • Descubre</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 bg-indigo-950/50 rounded-lg p-0.5">
          {([
            { id: 'explore', label: '🔭 Explorar' },
            { id: 'compare', label: '📊 Comparar' },
            { id: 'tools', label: '🛠️ Herramientas' },
            { id: 'missions', label: '🚀 Misiones' },
            { id: 'quiz', label: '🧠 Quiz' },
            { id: 'facts', label: '✨ Datos' },
          ] as { id: ViewMode; label: string }[]).map(tab => (
            <button key={tab.id} onClick={() => { setViewMode(tab.id); if (tab.id === 'missions') unlockAchievement('mission_fan'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-300 hover:text-white hover:bg-indigo-800/50'
              }`}>{tab.label}</button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-0.5">
            {[0.25, 0.5, 1, 2, 5, 10].map((s) => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                  speed === s ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/40' : 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50'
                }`}>{s}x</button>
            ))}
          </div>
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="text-indigo-400 hover:text-white p-1 rounded hover:bg-indigo-800/50 transition-all" title="Atajos">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center gap-1 bg-[#060618] px-2 py-1 overflow-x-auto border-b border-indigo-900/30">
        {([
          { id: 'explore', label: '🔭' }, { id: 'compare', label: '📊' }, { id: 'tools', label: '🛠️' },
          { id: 'missions', label: '🚀' }, { id: 'quiz', label: '🧠' }, { id: 'facts', label: '✨' },
        ] as { id: ViewMode; label: string }[]).map(tab => (
          <button key={tab.id} onClick={() => setViewMode(tab.id)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
              viewMode === tab.id ? 'bg-indigo-600 text-white' : 'text-indigo-300 bg-indigo-900/30'
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas ref={canvasRef} onClick={handleClick} onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel} className="w-full h-full cursor-grab" />

          {/* Left controls */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {[
              { icon: isPlaying ? '⏸' : '▶', action: () => setIsPlaying(!isPlaying), active: isPlaying, title: 'Pausar/Reproducir' },
              { icon: '◎', action: () => setShowOrbits(!showOrbits), active: showOrbits, title: 'Órbitas (O)' },
              { icon: 'Aa', action: () => setShowLabels(!showLabels), active: showLabels, title: 'Nombres (L)' },
              { icon: '〰', action: () => setShowTrails(!showTrails), active: showTrails, title: 'Estelas (T)' },
              { icon: '🌿', action: () => setShowHabitableZone(!showHabitableZone), active: showHabitableZone, title: 'Zona habitable (H)' },
              { icon: '💨', action: () => setShowSolarWind(!showSolarWind), active: showSolarWind, title: 'Viento solar' },
              { icon: '🪨', action: () => setShowAsteroidBelt(!showAsteroidBelt), active: showAsteroidBelt, title: 'Asteroides' },
              { icon: '🗺', action: () => setShowMinimap(!showMinimap), active: showMinimap, title: 'Minimapa (M)' },
              { icon: '↺', action: () => { setCamera({ x: 0, y: 0, zoom: 1 }); setFollowPlanet(null); }, active: false, title: 'Reset (R)' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.title}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all shadow-lg backdrop-blur-sm ${
                  btn.active ? 'bg-indigo-600/80 text-white' : 'bg-gray-900/70 text-gray-400 hover:text-white'
                }`}>{btn.icon}</button>
            ))}
          </div>

          {/* Top-right info */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] text-indigo-300 font-mono">
              🔍 {camera.zoom.toFixed(1)}x
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] text-indigo-300">
              ⏱️ {formatTime(timeElapsed)}
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] text-indigo-300">
              🏆 {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
          </div>

          {/* Minimap */}
          {showMinimap && (
            <div className="absolute bottom-16 left-3 w-28 h-28 bg-black/60 backdrop-blur-sm rounded-lg border border-indigo-800/30 z-10 overflow-hidden">
              <canvas ref={(el) => {
                if (!el) return;
                const ctx = el.getContext('2d');
                if (!ctx) return;
                el.width = 112; el.height = 112;
                ctx.fillStyle = '#050510';
                ctx.fillRect(0, 0, 112, 112);
                const scale = 0.13;
                const cx = 56, cy = 56;
                // Sun
                ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffcc00'; ctx.fill();
                // Planets
                planetsRef.current.forEach(p => {
                  const px = cx + Math.cos(p.angle) * p.orbitRadius * scale;
                  const py = cy + Math.sin(p.angle) * p.orbitRadius * scale;
                  ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                  ctx.fillStyle = p.color; ctx.fill();
                });
                // Viewport indicator
                const cam = cameraRef.current;
                const vw = (canvasRef.current?.width || 800) / cam.zoom * scale;
                const vh = (canvasRef.current?.height || 600) / cam.zoom * scale;
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(cx - cam.x * scale / cam.zoom - vw / 2, cy - cam.y * scale / cam.zoom - vh / 2, vw, vh);
              }} className="w-full h-full" />
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <button onClick={() => setSpeed(s => Math.max(s / 2, 0.1))}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-indigo-300 hover:text-white flex items-center justify-center transition-all text-xs">◀</button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/30 backdrop-blur-sm">
              {isPlaying ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button onClick={() => setSpeed(s => Math.min(s * 2, 20))}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-indigo-300 hover:text-white flex items-center justify-center transition-all text-xs">▶</button>
          </div>
        </div>

        {/* Right Panel */}
        {viewMode === 'explore' && (selectedPlanet || showSunInfo) && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto animate-slide-in z-10">
            {showSunInfo ? <SunInfoPanel onClose={() => setShowSunInfo(false)} /> :
              selectedPlanet ? <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)}
                onFollow={() => setFollowPlanet(followPlanet === selectedPlanet.id ? null : selectedPlanet.id)}
                isFollowed={followPlanet === selectedPlanet.id} /> : null}
          </div>
        )}

        {viewMode === 'compare' && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto p-3 z-10">
            <ComparePanel comparisonPlanets={comparisonPlanets} toggleComparison={toggleComparison} />
          </div>
        )}

        {viewMode === 'tools' && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto p-3 z-10">
            <ToolsPanel toolMode={toolMode} setToolMode={setToolMode}
              userWeight={userWeight} setUserWeight={setUserWeight}
              travelFrom={travelFrom} setTravelFrom={setTravelFrom}
              travelTo={travelTo} setTravelTo={setTravelTo}
              travelSpeed={travelSpeed} setTravelSpeed={setTravelSpeed}
              getTravelTime={getTravelTime}
              userAge={userAge} setUserAge={setUserAge}
              
              getPlanetAge={getPlanetAge}
              gravityDropHeight={gravityDropHeight} setGravityDropHeight={setGravityDropHeight}
              gravityDropping={gravityDropping} gravityTime={gravityTime} gravityVelocity={gravityVelocity}
              startGravityDrop={startGravityDrop} travelToPlanet={travelTo}
            />
          </div>
        )}

        {viewMode === 'missions' && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto p-3 z-10">
            <MissionsPanel />
          </div>
        )}

        {viewMode === 'quiz' && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto p-3 z-10">
            <QuizPanel state={quizState} onAnswer={handleQuizAnswer} onNext={nextQuestion} onReset={resetQuiz} />
          </div>
        )}

        {viewMode === 'facts' && (
          <div className="w-72 lg:w-80 bg-[#060618]/95 backdrop-blur-md border-l border-indigo-900/40 overflow-y-auto p-3 z-10">
            <FactsPanel currentFact={currentFact} setCurrentFact={setCurrentFact} />
          </div>
        )}
      </div>

      {/* Bottom planet bar */}
      <div className="bg-gradient-to-r from-[#060618] via-[#0a0a30] to-[#060618] border-t border-indigo-900/40 px-3 py-1.5 flex items-center justify-center gap-1 overflow-x-auto z-10">
        <button onClick={() => { setShowSunInfo(true); setSelectedPlanet(null); setViewMode('explore'); }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all whitespace-nowrap ${
            showSunInfo ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50' : 'text-indigo-300 hover:bg-indigo-900/50'
          }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500" />Sol
        </button>
        {planetsRef.current.map((planet) => (
          <button key={planet.id}
            onClick={() => { setSelectedPlanet(planet); setShowSunInfo(false); setViewMode('explore'); }}
            onDoubleClick={() => setFollowPlanet(followPlanet === planet.id ? null : planet.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all whitespace-nowrap ${
              selectedPlanet?.id === planet.id ? 'bg-indigo-600/50 text-white border border-indigo-400/50' :
              followPlanet === planet.id ? 'bg-green-600/30 text-green-200 border border-green-400/50' :
              'text-indigo-300 hover:bg-indigo-900/50'
            }`}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planet.color }} />
            {planet.nameEs}
          </button>
        ))}
      </div>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#0a0a30] border border-indigo-700/50 rounded-2xl p-5 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-base font-bold mb-3">⌨️ Atajos de Teclado</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ['Espacio', 'Pausar/Reproducir'], ['↑ / +', 'Más velocidad'],
                ['↓ / -', 'Menos velocidad'], ['O', 'Órbitas on/off'],
                ['L', 'Nombres on/off'], ['T', 'Estelas on/off'],
                ['H', 'Zona habitable'], ['M', 'Minimapa'],
                ['R', 'Reset vista'], ['F', 'Dejar de seguir'],
                ['Esc', 'Cerrar panel'], ['Scroll', 'Zoom'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2 py-0.5">
                  <kbd className="px-1.5 py-0.5 bg-indigo-900/50 border border-indigo-700/50 rounded text-[9px] text-indigo-200 font-mono min-w-[45px] text-center">{key}</kbd>
                  <span className="text-indigo-300 text-[10px]">{desc}</span>
                </div>
              ))}
            </div>
            <h3 className="text-white text-sm font-bold mt-4 mb-2">🏆 Logros ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h3>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {achievements.map(a => (
                <div key={a.id} className={`p-1.5 rounded-lg text-[10px] ${a.unlocked ? 'bg-yellow-900/30 border border-yellow-600/30' : 'bg-gray-900/30 border border-gray-700/30 opacity-50'}`}>
                  <span className="text-sm">{a.icon}</span> <span className={a.unlocked ? 'text-yellow-200' : 'text-gray-400'}>{a.title}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// === SUB-COMPONENTS ===

function PlanetInfoPanel({ planet, onClose, onFollow, isFollowed }: {
  planet: Planet & { angle: number; rotationAngle: number }; onClose: () => void; onFollow: () => void; isFollowed: boolean;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full shadow-lg" style={{ background: `radial-gradient(circle at 30% 30%, ${planet.colorLight}, ${planet.colorDark})`, boxShadow: `0 0 15px ${planet.color}40` }} />
          <div>
            <h2 className="text-white text-lg font-bold">{planet.emoji} {planet.nameEs}</h2>
            <p className="text-indigo-400 text-[10px]">{planet.name} • {planet.typeEs}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-indigo-400 hover:text-white p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <p className="text-indigo-200 text-xs mb-3 leading-relaxed">{planet.description}</p>
      <button onClick={onFollow} className={`w-full mb-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isFollowed ? 'bg-green-600/30 text-green-300 border border-green-500/50' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50 border border-indigo-600/30'}`}>
        {isFollowed ? '📌 Siguiendo (click para dejar)' : '📌 Seguir planeta'}
      </button>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <StatCard icon="📏" label="Radio" value={`${planet.realRadius.toLocaleString()} km`} />
        <StatCard icon="☀️" label="Dist. Sol" value={`${planet.distanceFromSun.toLocaleString()} M km`} />
        <StatCard icon="🔄" label="Año" value={planet.yearLength} />
        <StatCard icon="🌍" label="Día" value={planet.dayLength} />
        <StatCard icon="🌡️" label="Temp." value={planet.temperature} />
        <StatCard icon="⚖️" label="Gravedad" value={`${planet.gravity} m/s²`} />
        <StatCard icon="🌙" label="Lunas" value={`${planet.moons}`} />
        <StatCard icon="🧲" label="C. magnético" value={planet.magneticField ? 'Sí' : 'No'} />
      </div>
      <div className="space-y-1.5 mb-3">
        <InfoRow icon="⚖️" label="Masa" value={planet.mass} />
        <InfoRow icon="🚀" label="Vel. escape" value={planet.escapeVelocity} />
        <InfoRow icon="🌫️" label="Atmósfera" value={planet.atmosphere} />
        <InfoRow icon="📐" label="Densidad" value={`${planet.density} g/cm³`} />
        {planet.discoveredBy && <InfoRow icon="🔭" label="Descubierto" value={`${planet.discoveredBy}${planet.discoveryYear ? ` (${planet.discoveryYear})` : ''}`} />}
      </div>
      <div className="bg-indigo-900/30 rounded-lg p-2.5 border border-indigo-800/30">
        <h3 className="text-indigo-300 text-[10px] font-bold uppercase mb-1.5">💡 ¿Sabías que...?</h3>
        <ul className="space-y-1">
          {planet.funFacts.slice(0, 3).map((fact, i) => (
            <li key={i} className="text-indigo-200 text-[10px] flex items-start gap-1.5"><span className="text-indigo-500 mt-0.5">•</span><span>{fact}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SunInfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-orange-400 to-red-500 shadow-lg shadow-orange-500/40" />
          <div>
            <h2 className="text-white text-lg font-bold">☀️ {SUN_DATA.nameEs}</h2>
            <p className="text-orange-400 text-[10px]">{SUN_DATA.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-indigo-400 hover:text-white p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
      <p className="text-indigo-200 text-xs mb-3 leading-relaxed">{SUN_DATA.description}</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <StatCard icon="📏" label="Radio" value={`${SUN_DATA.radius.toLocaleString()} km`} />
        <StatCard icon="🌡️" label="Superficie" value={SUN_DATA.temperature} />
        <StatCard icon="🔥" label="Núcleo" value={SUN_DATA.temperatureCore} />
        <StatCard icon="⏳" label="Edad" value={SUN_DATA.age} />
      </div>
      <InfoRow icon="⚖️" label="Masa" value={SUN_DATA.mass} />
      <InfoRow icon="💡" label="Luminosidad" value={SUN_DATA.luminosity} />
      <InfoRow icon="🧪" label="Composición" value={SUN_DATA.composition} />
      <div className="mt-3 bg-orange-900/20 rounded-lg p-2.5 border border-orange-800/30">
        <h3 className="text-orange-300 text-[10px] font-bold uppercase mb-1.5">💡 ¿Sabías que...?</h3>
        <ul className="space-y-1">
          {SUN_DATA.funFacts.map((fact, i) => (
            <li key={i} className="text-indigo-200 text-[10px] flex items-start gap-1.5"><span className="text-orange-500 mt-0.5">•</span><span>{fact}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComparePanel({ comparisonPlanets, toggleComparison }: { comparisonPlanets: string[]; toggleComparison: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-white text-sm font-bold mb-2">📊 Comparar Planetas</h2>
      <p className="text-indigo-400 text-[10px] mb-3">Selecciona planetas para comparar</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {PLANETS_DATA.map(planet => (
          <button key={planet.id} onClick={() => toggleComparison(planet.id)}
            className={`p-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1.5 ${
              comparisonPlanets.includes(planet.id) ? 'bg-indigo-600/50 text-white border border-indigo-400/50' : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/30 border border-transparent'
            }`}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color }} />{planet.nameEs}
          </button>
        ))}
      </div>
      {comparisonPlanets.length > 0 && <ComparisonChart planetIds={comparisonPlanets} />}
    </div>
  );
}

function ComparisonChart({ planetIds }: { planetIds: string[] }) {
  const planets = PLANETS_DATA.filter(p => planetIds.includes(p.id));
  if (planets.length === 0) return null;
  const maxRadius = Math.max(...planets.map(p => p.realRadius));
  const maxDistance = Math.max(...planets.map(p => p.distanceFromSun));
  const maxGravity = Math.max(...planets.map(p => p.gravity));
  const maxMoons = Math.max(...planets.map(p => p.moons), 1);

  return (
    <div className="space-y-3">
      {[
        { title: '📏 Radio (km)', data: planets.map(p => ({ name: p.nameEs, value: p.realRadius, max: maxRadius, color: p.color })) },
        { title: '☀️ Distancia al Sol (M km)', data: planets.map(p => ({ name: p.nameEs, value: p.distanceFromSun, max: maxDistance, color: p.color })) },
        { title: '⚖️ Gravedad (m/s²)', data: planets.map(p => ({ name: p.nameEs, value: p.gravity, max: maxGravity, color: p.color })) },
        { title: '🌙 Lunas', data: planets.map(p => ({ name: p.nameEs, value: p.moons, max: maxMoons, color: p.color })) },
        { title: '📐 Densidad (g/cm³)', data: planets.map(p => ({ name: p.nameEs, value: p.density, max: Math.max(...planets.map(pl => pl.density)), color: p.color })) },
      ].map((section, i) => (
        <div key={i}>
          <h3 className="text-indigo-300 text-[9px] font-bold uppercase mb-1">{section.title}</h3>
          {section.data.map((d, j) => (
            <div key={j} className="flex items-center gap-1.5 mb-1">
              <span className="text-indigo-400 text-[9px] w-14 truncate">{d.name}</span>
              <div className="flex-1 bg-indigo-900/30 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(d.value / d.max) * 100}%`, backgroundColor: d.color }} />
              </div>
              <span className="text-indigo-300 text-[9px] w-14 text-right">{typeof d.value === 'number' ? d.value.toLocaleString() : d.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ToolsPanel({ toolMode, setToolMode, userWeight, setUserWeight, travelFrom, setTravelFrom, travelTo, setTravelTo, travelSpeed, setTravelSpeed, getTravelTime, userAge, setUserAge, getPlanetAge, gravityDropHeight, setGravityDropHeight, gravityDropping, gravityTime, gravityVelocity, startGravityDrop, travelToPlanet }: {
  toolMode: ToolMode; setToolMode: (m: ToolMode) => void; userWeight: number; setUserWeight: (n: number) => void;
  travelFrom: string; setTravelFrom: (s: string) => void; travelTo: string; setTravelTo: (s: string) => void;
  travelSpeed: number; setTravelSpeed: (n: number) => void; getTravelTime: () => string;
  userAge: number; setUserAge: (n: number) => void; getPlanetAge: () => string;
  gravityDropHeight: number; setGravityDropHeight: (n: number) => void; gravityDropping: boolean; gravityTime: number; gravityVelocity: number;
  startGravityDrop: () => void; travelToPlanet: string;
}) {
  return (
    <div>
      <h2 className="text-white text-sm font-bold mb-3">🛠️ Herramientas</h2>
      <div className="flex flex-wrap gap-1 mb-4">
        {([
          { id: 'weight', label: '⚖️ Peso' }, { id: 'travel', label: '🚀 Viaje' },
          { id: 'age', label: '🎂 Edad' }, { id: 'gravity', label: '🍎 Gravedad' },
        ] as { id: ToolMode; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setToolMode(t.id)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              toolMode === t.id ? 'bg-indigo-600 text-white' : 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50'
            }`}>{t.label}</button>
        ))}
      </div>

      {toolMode === 'weight' && (
        <div>
          <h3 className="text-indigo-300 text-xs font-bold mb-2">⚖️ Tu peso en otros planetas</h3>
          <div className="mb-3">
            <label className="text-indigo-400 text-[10px]">Tu peso en la Tierra (kg)</label>
            <input type="range" min="10" max="200" value={userWeight} onChange={e => setUserWeight(Number(e.target.value))} className="w-full accent-indigo-500" />
            <span className="text-white text-sm font-bold">{userWeight} kg</span>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {PLANETS_DATA.map(p => {
              const weightOnPlanet = (userWeight * p.gravity / 9.81).toFixed(1);
              return (
                <div key={p.id} className="flex items-center gap-2 p-1.5 bg-indigo-900/20 rounded-lg">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-indigo-300 text-[10px] flex-1">{p.nameEs}</span>
                  <span className="text-white text-xs font-bold">{weightOnPlanet} kg</span>
                  <span className="text-indigo-500 text-[9px]">({(p.gravity / 9.81).toFixed(2)}x)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toolMode === 'travel' && (
        <div>
          <h3 className="text-indigo-300 text-xs font-bold mb-2">🚀 Calculadora de viaje</h3>
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-indigo-400 text-[10px]">Desde</label>
              <select value={travelFrom} onChange={e => setTravelFrom(e.target.value)} className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded px-2 py-1 text-white text-xs">
                {PLANETS_DATA.map(p => <option key={p.id} value={p.id}>{p.nameEs}</option>)}
              </select>
            </div>
            <div>
              <label className="text-indigo-400 text-[10px]">Hasta</label>
              <select value={travelTo} onChange={e => setTravelTo(e.target.value)} className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded px-2 py-1 text-white text-xs">
                {PLANETS_DATA.map(p => <option key={p.id} value={p.id}>{p.nameEs}</option>)}
              </select>
            </div>
            <div>
              <label className="text-indigo-400 text-[10px]">Velocidad nave (km/h)</label>
              <input type="range" min="10000" max="200000" step="1000" value={travelSpeed} onChange={e => setTravelSpeed(Number(e.target.value))} className="w-full accent-indigo-500" />
              <span className="text-white text-[10px]">{travelSpeed.toLocaleString()} km/h</span>
            </div>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700/30 text-center">
            <p className="text-indigo-400 text-[10px] uppercase">Tiempo estimado de viaje</p>
            <p className="text-white text-xl font-bold">{getTravelTime()}</p>
            <p className="text-indigo-400 text-[9px] mt-1">
              Distancia: {Math.abs((PLANETS_DATA.find(p => p.id === travelTo)?.distanceFromSun || 0) - (PLANETS_DATA.find(p => p.id === travelFrom)?.distanceFromSun || 0)).toLocaleString()} M km
            </p>
          </div>
          <div className="mt-3 bg-indigo-900/20 rounded-lg p-2 border border-indigo-800/20">
            <p className="text-indigo-400 text-[9px] font-bold mb-1">Referencias de velocidad:</p>
            <p className="text-indigo-300 text-[9px]">• ISS: 28,000 km/h</p>
            <p className="text-indigo-300 text-[9px]">• Voyager 1: 61,000 km/h</p>
            <p className="text-indigo-300 text-[9px]">• Parker Solar Probe: 700,000 km/h</p>
            <p className="text-indigo-300 text-[9px]">• Luz: 1,080,000,000 km/h</p>
          </div>
        </div>
      )}

      {toolMode === 'age' && (
        <div>
          <h3 className="text-indigo-300 text-xs font-bold mb-2">🎂 Tu edad en otros planetas</h3>
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-indigo-400 text-[10px]">Tu edad (años terrestres)</label>
              <input type="range" min="1" max="100" value={userAge} onChange={e => setUserAge(Number(e.target.value))} className="w-full accent-indigo-500" />
              <span className="text-white text-sm font-bold">{userAge} años</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {PLANETS_DATA.map(p => {
              const earthDays = userAge * 365.25;
              const planetYears = earthDays / p.orbitalPeriodDays;
              const planetDays = earthDays / (p.rotationPeriodHours / 24);
              return (
                <div key={p.id} className="p-2 bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-indigo-300 text-[10px] font-bold">{p.nameEs}</span>
                  </div>
                  <div className="ml-6 mt-1">
                    <p className="text-white text-xs">📅 {planetYears.toFixed(2)} años {p.nameEs === 'Tierra' ? '' : `(${p.name.toLowerCase()}nos)`}</p>
                    <p className="text-indigo-400 text-[9px]">🌅 {planetDays.toFixed(0)} días solares</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toolMode === 'gravity' && (
        <div>
          <h3 className="text-indigo-300 text-xs font-bold mb-2">🍎 Simulador de caída</h3>
          <p className="text-indigo-400 text-[10px] mb-2">¿Cuánto tarda un objeto en caer desde {gravityDropHeight}m?</p>
          <div className="mb-3">
            <label className="text-indigo-400 text-[10px]">Planeta</label>
            <select value={travelToPlanet} onChange={() => {}} className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded px-2 py-1 text-white text-xs mb-2">
              {PLANETS_DATA.map(p => <option key={p.id} value={p.id}>{p.nameEs} (g={p.gravity})</option>)}
            </select>
            <label className="text-indigo-400 text-[10px]">Altura (metros)</label>
            <input type="range" min="1" max="100" value={gravityDropHeight} onChange={e => setGravityDropHeight(Number(e.target.value))} className="w-full accent-indigo-500" />
            <span className="text-white text-sm font-bold">{gravityDropHeight} m</span>
          </div>
          <button onClick={startGravityDrop} disabled={gravityDropping}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all mb-3">
            {gravityDropping ? '⏳ Cayendo...' : '🍎 Soltar objeto'}
          </button>
          <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700/30 text-center">
            <p className="text-indigo-400 text-[10px]">Tiempo de caída</p>
            <p className="text-white text-xl font-bold">{gravityTime.toFixed(2)}s</p>
            <p className="text-indigo-400 text-[10px] mt-1">Velocidad final: {gravityVelocity.toFixed(1)} m/s</p>
            <p className="text-indigo-400 text-[9px]">({(gravityVelocity * 3.6).toFixed(1)} km/h)</p>
          </div>
          <div className="mt-2 bg-indigo-900/20 rounded-lg p-2 border border-indigo-800/20">
            <p className="text-indigo-400 text-[9px]">Fórmula: t = √(2h/g)</p>
            <p className="text-indigo-400 text-[9px]">v = g × t</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MissionsPanel() {
  return (
    <div>
      <h2 className="text-white text-sm font-bold mb-2">🚀 Misiones Espaciales</h2>
      <p className="text-indigo-400 text-[10px] mb-3">Principales misiones de exploración del sistema solar</p>
      <div className="space-y-2">
        {SPACE_MISSIONS.map((mission, i) => {
          const planet = PLANETS_DATA.find(p => p.id === mission.planet);
          return (
            <div key={i} className="p-2.5 bg-indigo-900/20 rounded-lg border border-indigo-800/20 hover:border-indigo-600/30 transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet?.color || '#fff' }} />
                  <span className="text-white text-xs font-bold">{mission.name}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${mission.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-800/50 text-gray-400'}`}>
                  {mission.status === 'active' ? '🟢 Activa' : '⚫ Finalizada'}
                </span>
              </div>
              <p className="text-indigo-300 text-[10px] mb-1">{mission.description}</p>
              <div className="flex items-center justify-between text-[9px] text-indigo-400">
                <span>Lanzamiento: {mission.year}</span>
                <span>Dist: {mission.distance}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-indigo-900/20 rounded-lg border border-indigo-800/20">
        <h3 className="text-indigo-300 text-[10px] font-bold uppercase mb-2">📅 Timeline histórica</h3>
        <div className="space-y-1.5">
          {[
            { year: '1957', event: 'Sputnik 1 - Primer satélite artificial' },
            { year: '1969', event: 'Apollo 11 - Primer humano en la Luna' },
            { year: '1977', event: 'Voyager 1 y 2 lanzados' },
            { year: '1990', event: 'Telescopio Hubble en órbita' },
            { year: '1997', event: 'Mars Pathfinder - Sojourner en Marte' },
            { year: '2004', event: 'Spirit y Opportunity en Marte' },
            { year: '2012', event: 'Curiosity aterriza en Marte' },
            { year: '2015', event: 'New Horizons sobrevuela Plutón' },
            { year: '2021', event: 'James Webb lanzado + Perseverance' },
            { year: '2024', event: 'Europa Clipper hacia Júpiter' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-500 text-[9px] font-mono min-w-[30px]">{item.year}</span>
              <span className="text-indigo-300 text-[9px]">{item.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizPanel({ state, onAnswer, onNext, onReset }: {
  state: { current: number; score: number; answered: boolean; selectedAnswer: number; finished: boolean };
  onAnswer: (i: number) => void; onNext: () => void; onReset: () => void;
}) {
  if (state.finished) {
    const percentage = Math.round((state.score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
        <h2 className="text-white text-lg font-bold mb-2">¡Quiz Completado!</h2>
        <p className="text-indigo-300 text-sm mb-2">Puntuación: <span className="text-white font-bold">{state.score}/{QUIZ_QUESTIONS.length}</span></p>
        <div className="w-full bg-indigo-900/30 rounded-full h-2.5 mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${percentage}%` }} />
        </div>
        <p className="text-indigo-400 text-xs mb-4">
          {percentage >= 80 ? '¡Excelente! Eres un experto del sistema solar.' : percentage >= 50 ? '¡Buen trabajo!' : '¡Explora los planetas y vuelve a intentarlo!'}
        </p>
        <button onClick={onReset} className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all">🔄 Reintentar</button>
      </div>
    );
  }
  const question = QUIZ_QUESTIONS[state.current];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-sm font-bold">🧠 Quiz Espacial</h2>
        <span className="text-indigo-400 text-[10px] bg-indigo-900/50 px-2 py-0.5 rounded-full">{state.current + 1}/{QUIZ_QUESTIONS.length}</span>
      </div>
      <div className="w-full bg-indigo-900/30 rounded-full h-1.5 mb-3">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${((state.current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="bg-indigo-900/30 rounded-lg p-3 mb-3 border border-indigo-800/30">
        <p className="text-white text-xs font-medium">{question.question}</p>
      </div>
      <div className="space-y-1.5 mb-3">
        {question.options.map((option, i) => (
          <button key={i} onClick={() => onAnswer(i)} disabled={state.answered}
            className={`w-full p-2 rounded-lg text-left text-[11px] transition-all ${
              state.answered ? i === question.correct ? 'bg-green-600/30 text-green-200 border border-green-500/50'
                : i === state.selectedAnswer ? 'bg-red-600/30 text-red-200 border border-red-500/50'
                : 'bg-indigo-900/20 text-indigo-400'
                : 'bg-indigo-900/30 text-indigo-200 hover:bg-indigo-800/50 border border-indigo-700/30'
            }`}>
            <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option}
            {state.answered && i === question.correct && ' ✓'}
            {state.answered && i === state.selectedAnswer && i !== question.correct && ' ✗'}
          </button>
        ))}
      </div>
      {state.answered && (
        <div className="mb-3">
          <div className="bg-indigo-900/30 rounded-lg p-2 border border-indigo-800/30 mb-2">
            <p className="text-indigo-200 text-[10px]">{question.explanation}</p>
          </div>
          <button onClick={onNext} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all">
            {state.current >= QUIZ_QUESTIONS.length - 1 ? 'Ver resultados' : 'Siguiente →'}
          </button>
        </div>
      )}
      <p className="text-center text-indigo-400 text-[10px]">Puntuación: {state.score}/{state.current + (state.answered ? 1 : 0)}</p>
    </div>
  );
}

function FactsPanel({ currentFact, setCurrentFact }: { currentFact: number; setCurrentFact: (n: number) => void }) {
  const allFacts = PLANETS_DATA.flatMap(p => p.funFacts.map(f => ({ fact: f, planet: p.nameEs, color: p.color })));
  allFacts.push(...SUN_DATA.funFacts.map(f => ({ fact: f, planet: 'Sol', color: '#ffcc00' })));
  allFacts.push({ fact: HABITABLE_ZONE.description, planet: 'Concepto', color: '#00ff88' });
  const fact = allFacts[currentFact % allFacts.length];
  return (
    <div>
      <h2 className="text-white text-sm font-bold mb-3">✨ Datos Curiosos</h2>
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-xl p-4 border border-indigo-700/30 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fact.color }} />
          <span className="text-indigo-300 text-[9px] font-bold uppercase">{fact.planet}</span>
        </div>
        <p className="text-white text-sm leading-relaxed">{fact.fact}</p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentFact(Math.max(0, currentFact - 1))} disabled={currentFact === 0}
          className="px-3 py-1 bg-indigo-800/50 text-indigo-300 hover:text-white rounded text-[10px] disabled:opacity-30 transition-all">← Anterior</button>
        <span className="text-indigo-400 text-[10px]">{currentFact + 1} / {allFacts.length}</span>
        <button onClick={() => setCurrentFact(Math.min(allFacts.length - 1, currentFact + 1))} disabled={currentFact >= allFacts.length - 1}
          className="px-3 py-1 bg-indigo-800/50 text-indigo-300 hover:text-white rounded text-[10px] disabled:opacity-30 transition-all">Siguiente →</button>
      </div>
      <button onClick={() => setCurrentFact(Math.floor(Math.random() * allFacts.length))}
        className="w-full py-1.5 bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 rounded-lg text-[10px] transition-all border border-purple-500/30 mb-3">
        🎲 Dato aleatorio
      </button>
      <div className="max-h-52 overflow-y-auto pr-1 space-y-1">
        {allFacts.map((f, i) => (
          <button key={i} onClick={() => setCurrentFact(i)}
            className={`w-full text-left p-1.5 rounded text-[10px] transition-all ${
              i === currentFact ? 'bg-indigo-600/30 text-white border border-indigo-500/50' : 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-800/30 border border-transparent'
            }`}>
            <span className="font-medium" style={{ color: f.color }}>● {f.planet}:</span> {f.fact}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-indigo-900/20 rounded-lg p-1.5 border border-indigo-800/20">
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[10px]">{icon}</span>
        <span className="text-indigo-400 text-[8px] uppercase font-semibold">{label}</span>
      </div>
      <p className="text-white text-[10px] font-medium leading-tight">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-900/20 border border-indigo-800/20">
      <span className="text-xs">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-indigo-400 text-[8px] uppercase font-semibold">{label}</p>
        <p className="text-white text-[10px] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// === UTILITIES ===
function hexToRgb(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function formatTime(seconds: number): string {
  const days = seconds / 60;
  if (days < 1) return `${(days * 365).toFixed(0)}d`;
  if (days < 365) return `${days.toFixed(0)}d`;
  return `${(days / 365).toFixed(1)}a`;
}

export default App;
