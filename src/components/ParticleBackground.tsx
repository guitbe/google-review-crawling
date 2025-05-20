import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 40;
const COLORS = ['#fff', '#bcb3fa', '#e3dfff', '#8c7cf0'];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
      r: random(1, 2),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      speed: random(0.1, 0.3),
      phase: random(0, Math.PI * 2),
    }));

    let animationId: number;

    function draw() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        p.y += Math.sin(Date.now() / 2000 + p.phase) * p.speed;
        p.x += Math.cos(Date.now() / 3000 + p.phase) * p.speed * 0.5;
        if (p.y > window.innerHeight) p.y = 0;
        if (p.x > window.innerWidth) p.x = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = 0.7;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground; 