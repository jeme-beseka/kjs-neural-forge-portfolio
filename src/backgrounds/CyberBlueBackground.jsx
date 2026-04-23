// src/backgrounds/CyberBlueBackground.jsx
// Theme: Cyber Blue — Particle Hyperspace + Hex Grid + Nebula Blobs
import { useEffect, useRef } from 'react';

const PRIMARY  = '#00D4FF';
const ACCENT   = '#7C3AED';
const BG       = '#050B1A';

/* ── helpers ──────────────────────────────────────────────────────────────── */
function hexRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* ── Particle ─────────────────────────────────────────────────────────────── */
class Particle {
  constructor(w, h, multiplier) {
    this.w = w; this.h = h;
    this.reset(true, multiplier);
  }

  reset(init = false, multiplier = 1) {
    this.x  = Math.random() * this.w;
    this.y  = init ? Math.random() * this.h : -4;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = Math.random() * 0.6 + 0.2;
    this.r  = Math.random() * 1.8 + 0.4;
    this.a  = Math.random() * 0.7 + 0.2;
    this.isHyperspace = Math.random() < 0.04; // 4% shoot like stars
    if (this.isHyperspace) {
      this.vy *= 12;
      this.r  *= 0.5;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > this.h + 10 || this.x < -10 || this.x > this.w + 10) {
      this.reset(false);
    }
  }

  draw(ctx) {
    if (this.isHyperspace) {
      // Draw a streak
      const [r, g, b] = hexRgb(PRIMARY);
      const len = this.vy * 4;
      const grad = ctx.createLinearGradient(this.x, this.y - len, this.x, this.y);
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${this.a})`);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - len);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.r;
      ctx.stroke();
    } else {
      const [r, g, b] = Math.random() < 0.3 ? hexRgb(ACCENT) : hexRgb(PRIMARY);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.a})`;
      ctx.fill();
    }
  }
}

/* ── Hex Grid ─────────────────────────────────────────────────────────────── */
function drawHexGrid(ctx, w, h, t) {
  const size   = 40;
  const cols   = Math.ceil(w / (size * 1.5)) + 2;
  const rows   = Math.ceil(h / (size * Math.sqrt(3))) + 2;
  const [r, g, b] = hexRgb(PRIMARY);

  ctx.save();
  for (let col = -1; col < cols; col++) {
    for (let row = -1; row < rows; row++) {
      const offsetX = col % 2 === 0 ? 0 : size * Math.sqrt(3) * 0.5;
      const cx = col * size * 1.5;
      const cy = row * size * Math.sqrt(3) + offsetX;
      // Pulse opacity based on time and position
      const pulse = (Math.sin(t * 0.5 + col * 0.3 + row * 0.4) + 1) * 0.5;
      const alpha = pulse * 0.06 + 0.01;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ── Nebula Blobs ─────────────────────────────────────────────────────────── */
const BLOBS = [
  { xRatio: 0.15, yRatio: 0.25, speed: 0.0008, size: 0.45, color: PRIMARY },
  { xRatio: 0.80, yRatio: 0.60, speed: 0.0006, size: 0.38, color: ACCENT  },
  { xRatio: 0.50, yRatio: 0.85, speed: 0.0010, size: 0.30, color: PRIMARY },
];

function drawNebulaBlobs(ctx, w, h, t) {
  BLOBS.forEach((blob) => {
    const cx   = w * blob.xRatio + Math.sin(t * blob.speed * 100) * w * 0.04;
    const cy   = h * blob.yRatio + Math.cos(t * blob.speed * 80)  * h * 0.04;
    const rad  = Math.min(w, h) * blob.size;
    const [r, g, b] = hexRgb(blob.color);
    // Breathing: alpha oscillates
    const breathe = (Math.sin(t * blob.speed * 1000) + 1) * 0.5;
    const alpha   = 0.04 + breathe * 0.06;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.4})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function CyberBlueBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    particles: [],
    raf: null,
    t: 0,
    lastW: 0,
    lastH: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      state.lastW   = canvas.width;
      state.lastH   = canvas.height;

      const count = Math.floor(280 * particleMultiplier);
      state.particles = Array.from(
        { length: count },
        () => new Particle(canvas.width, canvas.height, particleMultiplier)
      );
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width;
      const h = canvas.height;
      state.t += 1;

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // Hex grid
      drawHexGrid(ctx, w, h, state.t);

      // Nebula blobs (drawn before particles for layering)
      drawNebulaBlobs(ctx, w, h, state.t);

      // Particles
      for (const p of state.particles) {
        p.update();
        p.draw(ctx);
      }

      state.raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    state.raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(state.raf);
    };
  }, [paused, particleMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="living-bg-canvas"
      style={{ display: 'block' }}
    />
  );
}
