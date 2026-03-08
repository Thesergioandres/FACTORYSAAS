import { useEffect, useRef } from 'react';
import { gsap } from '../../shared/animations/gsapConfig';

type BackgroundType = 'NEBULA' | 'GEOMETRIC' | 'NONE';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export function DynamicBackground({ type }: { type: BackgroundType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === 'NONE') return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let frameActive = true;
    let particles: Particle[] = [];
    let nodes: Node[] = [];

    const getColor = (value: string, fallback: string) => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(value).trim();
      return computed || fallback;
    };

    const colors = {
      primary: getColor('--primary', '#00F0FF'),
      secondary: getColor('--secondary', '#8A2BE2'),
      glow: getColor('--primary-glow', 'rgba(0, 240, 255, 0.2)')
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };

    const initNebula = () => {
      const count = Math.max(40, Math.floor((canvas.width * canvas.height) / 35000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 80 + Math.random() * 120,
        alpha: 0.08 + Math.random() * 0.12
      }));
    };

    const initGeometric = () => {
      const count = Math.max(24, Math.floor((canvas.width * canvas.height) / 50000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      }));
    };

    const renderNebula = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = canvas.height + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `${colors.primary}66`);
        gradient.addColorStop(0.6, colors.glow);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const renderGeometric = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            ctx.globalAlpha = 0.18 * (1 - dist / 180);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.5;
      nodes.forEach((node) => {
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const render = () => {
      if (!frameActive) return;
      if (type === 'NEBULA') {
        renderNebula();
      } else {
        renderGeometric();
      }
    };

    resize();
    if (type === 'NEBULA') {
      initNebula();
    } else {
      initGeometric();
    }

    gsap.ticker.add(render);
    window.addEventListener('resize', resize);

    return () => {
      frameActive = false;
      gsap.ticker.remove(render);
      window.removeEventListener('resize', resize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-40"
      style={{ filter: 'blur(80px)' }}
    />
  );
}
