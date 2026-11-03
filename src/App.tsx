import { useState, useEffect, useRef, useCallback } from 'react';
import { PLANETS_DATA, SUN_DATA, QUIZ_QUESTIONS, type Planet } from './data/planets';

type ViewMode = 'explore' | 'quiz' | 'compare' | 'facts';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<(Planet & { angle: number; rotationAngle: number })[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<(Planet & { angle: number; rotationAngle: number }) | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [followPlanet, setFollowPlanet] = useState<string | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const [quizState, setQuizState] = useState({ current: 0, score: 0, answered: false, selectedAnswer: -1, finished: false });
  const [currentFact, setCurrentFact] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPlanets, setComparisonPlanets] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);
  const isPlayingRef = useRef(isPlaying);
  const cameraRef = useRef(camera);
  const asteroidsRef = useRef<{ angle: number; radius: number; size: number; speed: number }[]>([]);
  const shootingStarsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; brightness: number; twinkleSpeed: number }[]>([]);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { cameraRef.current = camera; }, [camera]);

  // Initialize
  useEffect(() => {
    planetsRef.current = PLANETS_DATA.map((p) => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
      rotationAngle: 0,
    }));

    // Asteroid belt
    asteroidsRef.current = Array.from({ length: 150 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 195 + Math.random() * 25,
      size: Math.random() * 1.5 + 0.5,
      speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // Background stars
    starsRef.current = Array.from({ length: 300 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowUp' || e.code === 'Equal') setSpeed(s => Math.min(s * 2, 20));
      if (e.code === 'ArrowDown' || e.code === 'Minus') setSpeed(s => Math.max(s / 2, 0.1));
      if (e.code === 'KeyO') setShowOrbits(o => !o);
      if (e.code === 'KeyL') setShowLabels(l => !l);
      if (e.code === 'KeyR') { setCamera({ x: 0, y: 0, zoom: 1 }); setFollowPlanet(null); }
      if (e.code === 'Escape') { setSelectedPlanet(null); setShowSunInfo(false); }
      if (e.code === 'KeyF') setFollowPlanet(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(c => ({
      ...c,
      zoom: Math.max(0.3, Math.min(5, c.zoom * delta)),
    }));
  }, []);

  // Pan with mouse drag
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
      setCamera(c => ({
        ...c,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
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
      if (dist <= planet.radius + 8) {
        hovered = planet.id;
        break;
      }
    }
    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - cameraRef.current.x) / cameraRef.current.zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - cameraRef.current.y) / cameraRef.current.zoom;

    // Check sun click
    const sunDist = Math.sqrt(x ** 2 + y ** 2);
    if (sunDist <= 30) {
      setShowSunInfo(true);
      setSelectedPlanet(null);
      return;
    }

    let clicked: (Planet & { angle: number; rotationAngle: number }) | null = null;
    for (const planet of planetsRef.current) {
      const px = Math.cos(planet.angle) * planet.orbitRadius;
      const py = Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) {
        clicked = planet;
        break;
      }
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
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // Nebula effect
    const nebulaGrad = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, width * 0.5);
    nebulaGrad.addColorStop(0, 'rgba(30, 10, 60, 0.3)');
    nebulaGrad.addColorStop(0.5, 'rgba(10, 20, 50, 0.1)');
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);

    const nebulaGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 0, width * 0.2, height * 0.7, width * 0.4);
    nebulaGrad2.addColorStop(0, 'rgba(10, 30, 60, 0.2)');
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
    if (Math.random() < 0.005) {
      shootingStarsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        vx: (Math.random() - 0.3) * 8,
        vy: Math.random() * 4 + 2,
        life: 1,
      });
    }
    shootingStarsRef.current = shootingStarsRef.current.filter(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.02;
      if (s.life <= 0) return false;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return true;
    });

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(cam.zoom, cam.zoom);

    // Orbit paths
    if (showOrbits) {
      planetsRef.current.forEach((planet) => {
        ctx.beginPath();
        ctx.arc(0, 0, planet.orbitRadius, 0, Math.PI * 2);
        const isSelected = selectedPlanet?.id === planet.id;
        const isFollowed = followPlanet === planet.id;
        ctx.strokeStyle = isSelected || isFollowed
          ? `rgba(${hexToRgb(planet.color)}, 0.5)`
          : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isSelected || isFollowed ? 1.5 / cam.zoom : 0.5 / cam.zoom;
        ctx.setLineDash(isSelected ? [5 / cam.zoom, 5 / cam.zoom] : []);
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
        ctx.fillStyle = `rgba(150, 130, 100, ${0.4 + Math.random() * 0.3})`;
        ctx.fill();
      });
    }

    // Sun
    const sunPulse = Math.sin(time * 0.003) * 3;
    // Outer corona
    const coronaGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 60 + sunPulse);
    coronaGrad.addColorStop(0, 'rgba(255, 180, 50, 0.2)');
    coronaGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.05)');
    coronaGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, 60 + sunPulse, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    // Sun body
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

    // Sun surface detail
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

      // Selection ring
      if (isSelected || isFollowed) {
        ctx.beginPath();
        ctx.arc(px, py, displayRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${hexToRgb(planet.color)}, ${0.5 + Math.sin(time * 0.005) * 0.3})`;
        ctx.lineWidth = 2 / cam.zoom;
        ctx.stroke();
      }

      // Hover glow
      if (isHovered && !isSelected) {
        const glowGrad = ctx.createRadialGradient(px, py, displayRadius, px, py, displayRadius + 15);
        glowGrad.addColorStop(0, `rgba(${hexToRgb(planet.color)}, 0.3)`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, displayRadius + 15, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Planet shadow (day/night)
      const shadowAngle = Math.atan2(py, px) + Math.PI;

      // Planet body with gradient
      const planetGrad = ctx.createRadialGradient(
        px - displayRadius * 0.3, py - displayRadius * 0.3, 0,
        px, py, displayRadius
      );
      planetGrad.addColorStop(0, lightenColor(planet.color, 30));
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

      // Saturn rings
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

      // Uranus rings (thin)
      if (planet.hasRings && planet.id === 'uranus') {
        ctx.beginPath();
        ctx.ellipse(px, py, displayRadius + 5, (displayRadius + 5) * 0.15, 1.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 200, 200, 0.3)';
        ctx.lineWidth = 1 / cam.zoom;
        ctx.stroke();
      }

      // Labels
      if (showLabels || isSelected || isHovered) {
        const fontSize = Math.max(10, 12 / cam.zoom);
        ctx.font = `${isSelected || isHovered ? 'bold ' : ''}${fontSize}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(planet.nameEs, px, py - displayRadius - 8 / cam.zoom);
      }
    });

    ctx.restore();
  }, [showOrbits, showLabels, showAsteroidBelt, selectedPlanet, hoveredPlanet, followPlanet]);

  // Animation loop
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
        });
        asteroidsRef.current.forEach((a) => {
          a.angle += a.speed * delta * speedRef.current * 0.01;
        });
      }

      // Follow planet camera
      if (followPlanet) {
        const planet = planetsRef.current.find(p => p.id === followPlanet);
        if (planet) {
          const px = Math.cos(planet.angle) * planet.orbitRadius;
          const py = Math.sin(planet.angle) * planet.orbitRadius;
          setCamera(c => ({
            ...c,
            x: -px * c.zoom,
            y: -py * c.zoom,
          }));
        }
      }

      draw(ctx, canvas.width, canvas.height, time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  // Quiz logic
  const handleQuizAnswer = (answerIndex: number) => {
    if (quizState.answered) return;
    const question = QUIZ_QUESTIONS[quizState.current];
    const isCorrect = answerIndex === question.correct;
    setQuizState(s => ({
      ...s,
      answered: true,
      selectedAnswer: answerIndex,
      score: isCorrect ? s.score + 1 : s.score,
    }));
  };

  const nextQuestion = () => {
    if (quizState.current >= QUIZ_QUESTIONS.length - 1) {
      setQuizState(s => ({ ...s, finished: true }));
    } else {
      setQuizState(s => ({
        ...s,
        current: s.current + 1,
        answered: false,
        selectedAnswer: -1,
      }));
    }
  };

  const resetQuiz = () => {
    setQuizState({ current: 0, score: 0, answered: false, selectedAnswer: -1, finished: false });
  };

  // Toggle comparison planet
  const toggleComparison = (planetId: string) => {
    setComparisonPlanets(prev =>
      prev.includes(planetId)
        ? prev.filter(p => p !== planetId)
        : [...prev, planetId]
    );
  };

  return (
    <div className="w-full h-screen bg-[#050510] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0a0a2e] via-[#0d1045] to-[#0a0a2e] border-b border-indigo-800/30 px-4 py-2.5 flex items-center justify-between z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-lg">☀️</span>
          </div>
          <div>
            <h1 className="text-white text-base font-bold tracking-wide">Sistema Solar Interactivo</h1>
            <p className="text-indigo-400 text-[10px]">Explora • Aprende • Descubre</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-indigo-950/50 rounded-lg p-1">
          {[
            { id: 'explore' as ViewMode, label: '🔭 Explorar', },
            { id: 'compare' as ViewMode, label: '📊 Comparar', },
            { id: 'quiz' as ViewMode, label: '🧠 Quiz', },
            { id: 'facts' as ViewMode, label: '✨ Curiosidades', },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Speed controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            {[0.25, 0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  speed === s
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/40'
                    : 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50 hover:text-indigo-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-indigo-400 hover:text-white p-1.5 rounded hover:bg-indigo-800/50 transition-all"
            title="Atajos de teclado"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 bg-[#0a0a2e] px-2 py-1.5 overflow-x-auto border-b border-indigo-900/30">
        {[
          { id: 'explore' as ViewMode, label: '🔭 Explorar' },
          { id: 'compare' as ViewMode, label: '📊 Comparar' },
          { id: 'quiz' as ViewMode, label: '🧠 Quiz' },
          { id: 'facts' as ViewMode, label: '✨ Datos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              viewMode === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-300 bg-indigo-900/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab"
          />

          {/* Floating controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
                isPlaying
                  ? 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
                  : 'bg-green-600/80 hover:bg-green-500 text-white'
              }`}
              title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
                showOrbits ? 'bg-indigo-600/80 text-white' : 'bg-gray-800/80 text-gray-400'
              }`}
              title="Mostrar/ocultar órbitas (O)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
                showLabels ? 'bg-indigo-600/80 text-white' : 'bg-gray-800/80 text-gray-400'
              }`}
              title="Mostrar/ocultar nombres (L)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
              </svg>
            </button>
            <button
              onClick={() => setShowAsteroidBelt(!showAsteroidBelt)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
                showAsteroidBelt ? 'bg-indigo-600/80 text-white' : 'bg-gray-800/80 text-gray-400'
              }`}
              title="Cinturón de asteroides"
            >
              <span className="text-xs">🪨</span>
            </button>
            <button
              onClick={() => { setCamera({ x: 0, y: 0, zoom: 1 }); setFollowPlanet(null); }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all shadow-lg backdrop-blur-sm"
              title="Resetear vista (R)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono z-10">
            Zoom: {camera.zoom.toFixed(1)}x
          </div>

          {/* Time elapsed */}
          <div className="absolute bottom-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-indigo-300 z-10">
            ⏱️ Tiempo simulado: {formatTime(timeElapsed)}
          </div>

          {/* Play/Pause big button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <button
              onClick={() => setSpeed(s => Math.max(s / 2, 0.1))}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-indigo-300 hover:text-white flex items-center justify-center transition-all"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 12L5 12l7-7z" transform="rotate(90 12 12)" /></svg>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30 backdrop-blur-sm"
            >
              {isPlaying ? (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>Pausar</>
              ) : (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Reproducir</>
              )}
            </button>
            <button
              onClick={() => setSpeed(s => Math.min(s * 2, 20))}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-indigo-300 hover:text-white flex items-center justify-center transition-all"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 12L5 12l7 7z" transform="rotate(-90 12 12)" /></svg>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        {viewMode === 'explore' && (selectedPlanet || showSunInfo) && (
          <div className="w-80 lg:w-96 bg-[#0a0a2e]/95 backdrop-blur-md border-l border-indigo-800/30 overflow-y-auto animate-slide-in z-10">
            {showSunInfo ? (
              <SunInfoPanel onClose={() => setShowSunInfo(false)} />
            ) : selectedPlanet ? (
              <PlanetInfoPanel
                planet={selectedPlanet}
                onClose={() => setSelectedPlanet(null)}
                onFollow={() => setFollowPlanet(followPlanet === selectedPlanet.id ? null : selectedPlanet.id)}
                isFollowed={followPlanet === selectedPlanet.id}
              />
            ) : null}
          </div>
        )}

        {/* Compare Panel */}
        {viewMode === 'compare' && (
          <div className="w-80 lg:w-96 bg-[#0a0a2e]/95 backdrop-blur-md border-l border-indigo-800/30 overflow-y-auto p-4 z-10">
            <h2 className="text-white text-lg font-bold mb-4">📊 Comparar Planetas</h2>
            <p className="text-indigo-400 text-xs mb-4">Selecciona planetas para comparar sus características</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {planetsRef.current.map(planet => (
                <button
                  key={planet.id}
                  onClick={() => toggleComparison(planet.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                    comparisonPlanets.includes(planet.id)
                      ? 'bg-indigo-600/50 text-white border border-indigo-400/50'
                      : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/30 border border-transparent'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: planet.color }} />
                  {planet.nameEs}
                </button>
              ))}
            </div>
            {comparisonPlanets.length > 0 && (
              <ComparisonChart planetIds={comparisonPlanets} />
            )}
          </div>
        )}

        {/* Quiz Panel */}
        {viewMode === 'quiz' && (
          <div className="w-80 lg:w-96 bg-[#0a0a2e]/95 backdrop-blur-md border-l border-indigo-800/30 overflow-y-auto p-4 z-10">
            <QuizPanel
              state={quizState}
              onAnswer={handleQuizAnswer}
              onNext={nextQuestion}
              onReset={resetQuiz}
            />
          </div>
        )}

        {/* Facts Panel */}
        {viewMode === 'facts' && (
          <div className="w-80 lg:w-96 bg-[#0a0a2e]/95 backdrop-blur-md border-l border-indigo-800/30 overflow-y-auto p-4 z-10">
            <FactsPanel currentFact={currentFact} setCurrentFact={setCurrentFact} />
          </div>
        )}
      </div>

      {/* Bottom planet bar */}
      <div className="bg-gradient-to-r from-[#0a0a2e] via-[#0d1045] to-[#0a0a2e] border-t border-indigo-800/30 px-4 py-2 flex items-center justify-center gap-1.5 overflow-x-auto z-10">
        <button
          onClick={() => { setShowSunInfo(true); setSelectedPlanet(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
            showSunInfo
              ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50'
              : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500" />
          Sol
        </button>
        {planetsRef.current.map((planet) => (
          <button
            key={planet.id}
            onClick={() => { setSelectedPlanet(planet); setShowSunInfo(false); }}
            onDoubleClick={() => setFollowPlanet(followPlanet === planet.id ? null : planet.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              selectedPlanet?.id === planet.id
                ? 'bg-indigo-600/50 text-white border border-indigo-400/50'
                : followPlanet === planet.id
                ? 'bg-green-600/30 text-green-200 border border-green-400/50'
                : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
            }`}
            title={`Click: info | Doble click: seguir`}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color }} />
            {planet.nameEs}
            {followPlanet === planet.id && <span className="text-[8px]">📌</span>}
          </button>
        ))}
      </div>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#0d1045] border border-indigo-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-lg font-bold mb-4">⌨️ Atajos de Teclado</h3>
            <div className="space-y-2">
              {[
                ['Espacio', 'Pausar / Reproducir'],
                ['↑ / +', 'Aumentar velocidad'],
                ['↓ / -', 'Reducir velocidad'],
                ['O', 'Mostrar/ocultar órbitas'],
                ['L', 'Mostrar/ocultar nombres'],
                ['R', 'Resetear vista'],
                ['F', 'Dejar de seguir planeta'],
                ['Esc', 'Cerrar panel'],
                ['Scroll', 'Zoom in/out'],
                ['Arrastrar', 'Mover la vista'],
                ['Doble click', 'Seguir planeta'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-3 py-1">
                  <kbd className="px-2 py-0.5 bg-indigo-900/50 border border-indigo-700/50 rounded text-xs text-indigo-200 font-mono min-w-[60px] text-center">{key}</kbd>
                  <span className="text-indigo-300 text-sm">{desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// === SUB-COMPONENTS ===

function PlanetInfoPanel({ planet, onClose, onFollow, isFollowed }: {
  planet: Planet & { angle: number; rotationAngle: number };
  onClose: () => void;
  onFollow: () => void;
  isFollowed: boolean;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full shadow-lg animate-pulse-slow"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 40)}, ${planet.colorDark})`,
              boxShadow: `0 0 20px ${planet.color}40`,
            }}
          />
          <div>
            <h2 className="text-white text-xl font-bold">{planet.nameEs}</h2>
            <p className="text-indigo-400 text-xs">{planet.name} • {planet.typeEs}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-indigo-400 hover:text-white transition-colors p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-indigo-200 text-sm mb-4 leading-relaxed">{planet.description}</p>

      {/* Follow button */}
      <button
        onClick={onFollow}
        className={`w-full mb-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isFollowed
            ? 'bg-green-600/30 text-green-300 border border-green-500/50'
            : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50 border border-indigo-600/30'
        }`}
      >
        {isFollowed ? '📌 Siguiendo planeta (click para dejar)' : '📌 Seguir este planeta'}
      </button>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard icon="📏" label="Radio" value={`${planet.realRadius.toLocaleString()} km`} />
        <StatCard icon="☀️" label="Dist. al Sol" value={`${planet.distanceFromSun.toLocaleString()} M km`} />
        <StatCard icon="🔄" label="Año orbital" value={planet.yearLength} />
        <StatCard icon="🌍" label="Día" value={planet.dayLength} />
        <StatCard icon="🌡️" label="Temperatura" value={planet.temperature} />
        <StatCard icon="⚖️" label="Gravedad" value={`${planet.gravity} m/s²`} />
        <StatCard icon="🌙" label="Lunas" value={`${planet.moons}`} />
        <StatCard icon="💨" label="Atmósfera" value={planet.atmosphere.split(',')[0]} />
      </div>

      {/* Additional info */}
      <div className="space-y-2 mb-4">
        <InfoRow icon="⚖️" label="Masa" value={planet.mass} />
        <InfoRow icon="🚀" label="Vel. escape" value={planet.escapeVelocity} />
        {planet.hasRings && <InfoRow icon="💍" label="Anillos" value="Sí" />}
      </div>

      {/* Fun facts */}
      <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-800/30">
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">💡 ¿Sabías que...?</h3>
        <ul className="space-y-1.5">
          {planet.funFacts.slice(0, 3).map((fact, i) => (
            <li key={i} className="text-indigo-200 text-xs flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Size comparison */}
      <div className="mt-4 p-3 bg-indigo-900/20 rounded-lg border border-indigo-800/20">
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">📐 Tamaño vs Tierra</h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{
                width: `${Math.max(8, Math.min(60, (planet.realRadius / 6371) * 20))}px`,
                height: `${Math.max(8, Math.min(60, (planet.realRadius / 6371) * 20))}px`,
                background: `radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 30)}, ${planet.color})`,
              }}
            />
            <span className="text-indigo-400 text-[10px] mt-1">{planet.nameEs}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-blue-500" />
            <span className="text-indigo-400 text-[10px] mt-1">Tierra</span>
          </div>
          <span className="text-indigo-300 text-xs">
            {(planet.realRadius / 6371).toFixed(2)}x
          </span>
        </div>
      </div>
    </div>
  );
}

function SunInfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 via-orange-400 to-red-500 shadow-lg shadow-orange-500/40" />
          <div>
            <h2 className="text-white text-xl font-bold">{SUN_DATA.nameEs}</h2>
            <p className="text-orange-400 text-xs">{SUN_DATA.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-indigo-400 hover:text-white transition-colors p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-indigo-200 text-sm mb-4 leading-relaxed">{SUN_DATA.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard icon="📏" label="Radio" value={`${SUN_DATA.radius.toLocaleString()} km`} />
        <StatCard icon="🌡️" label="Superficie" value={SUN_DATA.temperature} />
        <StatCard icon="🔥" label="Núcleo" value={SUN_DATA.temperatureCore} />
        <StatCard icon="⏳" label="Edad" value={SUN_DATA.age} />
      </div>

      <InfoRow icon="⚖️" label="Masa" value={SUN_DATA.mass} />
      <InfoRow icon="🧪" label="Composición" value={SUN_DATA.composition} />

      <div className="mt-4 bg-orange-900/20 rounded-lg p-3 border border-orange-800/30">
        <h3 className="text-orange-300 text-xs font-bold uppercase mb-2">💡 ¿Sabías que...?</h3>
        <ul className="space-y-1.5">
          {SUN_DATA.funFacts.map((fact, i) => (
            <li key={i} className="text-indigo-200 text-xs flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComparisonChart({ planetIds }: { planetIds: string[] }) {
  const planets = PLANETS_DATA.filter(p => planetIds.includes(p.id));
  if (planets.length === 0) return null;

  const maxRadius = Math.max(...planets.map(p => p.realRadius));
  const maxDistance = Math.max(...planets.map(p => p.distanceFromSun));
  const maxGravity = Math.max(...planets.map(p => p.gravity));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">📏 Radio (km)</h3>
        {planets.map(p => (
          <div key={p.id} className="flex items-center gap-2 mb-1.5">
            <span className="text-indigo-400 text-[10px] w-16 truncate">{p.nameEs}</span>
            <div className="flex-1 bg-indigo-900/30 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(p.realRadius / maxRadius) * 100}%`,
                  backgroundColor: p.color,
                }}
              />
            </div>
            <span className="text-indigo-300 text-[10px] w-16 text-right">{p.realRadius.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">☀️ Distancia al Sol (M km)</h3>
        {planets.map(p => (
          <div key={p.id} className="flex items-center gap-2 mb-1.5">
            <span className="text-indigo-400 text-[10px] w-16 truncate">{p.nameEs}</span>
            <div className="flex-1 bg-indigo-900/30 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(p.distanceFromSun / maxDistance) * 100}%`,
                  backgroundColor: p.color,
                }}
              />
            </div>
            <span className="text-indigo-300 text-[10px] w-16 text-right">{p.distanceFromSun.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">⚖️ Gravedad (m/s²)</h3>
        {planets.map(p => (
          <div key={p.id} className="flex items-center gap-2 mb-1.5">
            <span className="text-indigo-400 text-[10px] w-16 truncate">{p.nameEs}</span>
            <div className="flex-1 bg-indigo-900/30 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(p.gravity / maxGravity) * 100}%`,
                  backgroundColor: p.color,
                }}
              />
            </div>
            <span className="text-indigo-300 text-[10px] w-16 text-right">{p.gravity}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-2">🌙 Lunas</h3>
        {planets.map(p => (
          <div key={p.id} className="flex items-center gap-2 mb-1.5">
            <span className="text-indigo-400 text-[10px] w-16 truncate">{p.nameEs}</span>
            <span className="text-white text-sm font-bold">{p.moons}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizPanel({ state, onAnswer, onNext, onReset }: {
  state: { current: number; score: number; answered: boolean; selectedAnswer: number; finished: boolean };
  onAnswer: (i: number) => void;
  onNext: () => void;
  onReset: () => void;
}) {
  if (state.finished) {
    const percentage = Math.round((state.score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
        <h2 className="text-white text-xl font-bold mb-2">¡Quiz Completado!</h2>
        <p className="text-indigo-300 mb-4">
          Puntuación: <span className="text-white font-bold">{state.score}/{QUIZ_QUESTIONS.length}</span> ({percentage}%)
        </p>
        <div className="w-full bg-indigo-900/30 rounded-full h-3 mb-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-indigo-400 text-sm mb-4">
          {percentage >= 80 ? '¡Excelente! Eres un experto del sistema solar.' :
           percentage >= 50 ? '¡Buen trabajo! Sigue aprendiendo.' :
           '¡No te rindas! Explora los planetas y vuelve a intentarlo.'}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          🔄 Intentar de nuevo
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[state.current];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">🧠 Quiz Espacial</h2>
        <span className="text-indigo-400 text-xs bg-indigo-900/50 px-2 py-1 rounded-full">
          {state.current + 1}/{QUIZ_QUESTIONS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-indigo-900/30 rounded-full h-2 mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${((state.current + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="bg-indigo-900/30 rounded-lg p-4 mb-4 border border-indigo-800/30">
        <p className="text-white text-sm font-medium">{question.question}</p>
      </div>

      <div className="space-y-2 mb-4">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            disabled={state.answered}
            className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
              state.answered
                ? i === question.correct
                  ? 'bg-green-600/30 text-green-200 border border-green-500/50'
                  : i === state.selectedAnswer
                  ? 'bg-red-600/30 text-red-200 border border-red-500/50'
                  : 'bg-indigo-900/20 text-indigo-400 border border-transparent'
                : 'bg-indigo-900/30 text-indigo-200 hover:bg-indigo-800/50 hover:text-white border border-indigo-700/30'
            }`}
          >
            <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option}
            {state.answered && i === question.correct && ' ✓'}
            {state.answered && i === state.selectedAnswer && i !== question.correct && ' ✗'}
          </button>
        ))}
      </div>

      {state.answered && (
        <div className="mb-4">
          <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-800/30 mb-3">
            <p className="text-indigo-200 text-xs">{question.explanation}</p>
          </div>
          <button
            onClick={onNext}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            {state.current >= QUIZ_QUESTIONS.length - 1 ? 'Ver resultados' : 'Siguiente pregunta →'}
          </button>
        </div>
      )}

      <div className="text-center text-indigo-400 text-xs">
        Puntuación: {state.score}/{state.current + (state.answered ? 1 : 0)}
      </div>
    </div>
  );
}

function FactsPanel({ currentFact, setCurrentFact }: { currentFact: number; setCurrentFact: (n: number) => void }) {
  const allFacts = PLANETS_DATA.flatMap(p => p.funFacts.map(f => ({ fact: f, planet: p.nameEs, color: p.color })));
  allFacts.push(...SUN_DATA.funFacts.map(f => ({ fact: f, planet: 'Sol', color: '#ffcc00' })));

  const fact = allFacts[currentFact % allFacts.length];

  return (
    <div>
      <h2 className="text-white text-lg font-bold mb-4">✨ Datos Curiosos</h2>
      
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-xl p-5 border border-indigo-700/30 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fact.color }} />
          <span className="text-indigo-300 text-xs font-bold uppercase">{fact.planet}</span>
        </div>
        <p className="text-white text-base leading-relaxed">{fact.fact}</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentFact(Math.max(0, currentFact - 1))}
          disabled={currentFact === 0}
          className="px-4 py-2 bg-indigo-800/50 text-indigo-300 hover:text-white rounded-lg text-sm disabled:opacity-30 transition-all"
        >
          ← Anterior
        </button>
        <span className="text-indigo-400 text-xs">{currentFact + 1} / {allFacts.length}</span>
        <button
          onClick={() => setCurrentFact(Math.min(allFacts.length - 1, currentFact + 1))}
          disabled={currentFact >= allFacts.length - 1}
          className="px-4 py-2 bg-indigo-800/50 text-indigo-300 hover:text-white rounded-lg text-sm disabled:opacity-30 transition-all"
        >
          Siguiente →
        </button>
      </div>

      <button
        onClick={() => setCurrentFact(Math.floor(Math.random() * allFacts.length))}
        className="w-full mt-3 py-2 bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 rounded-lg text-sm transition-all border border-purple-500/30"
      >
        🎲 Dato aleatorio
      </button>

      {/* All facts list */}
      <div className="mt-6">
        <h3 className="text-indigo-300 text-xs font-bold uppercase mb-3">Todos los datos</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {allFacts.map((f, i) => (
            <button
              key={i}
              onClick={() => setCurrentFact(i)}
              className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                i === currentFact
                  ? 'bg-indigo-600/30 text-white border border-indigo-500/50'
                  : 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-800/30 border border-transparent'
              }`}
            >
              <span className="font-medium" style={{ color: f.color }}>● {f.planet}:</span> {f.fact}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-indigo-900/20 rounded-lg p-2 border border-indigo-800/20">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-sm">{icon}</span>
        <span className="text-indigo-400 text-[9px] uppercase font-semibold">{label}</span>
      </div>
      <p className="text-white text-xs font-medium leading-tight">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-900/20 border border-indigo-800/20">
      <span className="text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-indigo-400 text-[9px] uppercase font-semibold">{label}</p>
        <p className="text-white text-xs font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// === UTILITIES ===

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

function hexToRgb(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function formatTime(seconds: number): string {
  const days = seconds / 60; // 60 seconds = 1 year in simulation
  if (days < 1) return `${(days * 365).toFixed(0)} días`;
  if (days < 365) return `${days.toFixed(1)} días`;
  return `${(days / 365).toFixed(2)} años`;
}

export default App;
