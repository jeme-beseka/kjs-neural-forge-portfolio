// src/backgrounds/DeepSpaceBackground.jsx
// Theme: Deep Space — Parallax Starfield + Shooting Stars + Aurora Bands
import { useEffect, useRef } from 'react';

const PRIMARY = '#4D9FFF';
const ACCENT  = '#FF2D78';
const BG      = '#040816';

/* ── Star layers (parallax depth) ─────────────────────────────────────────── */
const LAYER_CONFIGS = [
  { count: 80,  speed: 0.05, rMin: 0.4, rMax: 0.9 },  // far — slowest
  { count: 50,  speed: 0.15, rMin: 0.8, rMax: 1.4 },  // mid
  { count: 25,  speed: 0.30, rMin: 1.2, rMax: 2.0 },  // near — fastest
];

function makeStar(w, h, speed, rMin, rMax) {
  return {
    x:      Math.random() * w,
    y:      Math.random() * h,
    r:      Math.random() * (rMax - rMin) + rMin,
    speed,
    alpha:  Math.random() * 0.6 + 0.3,
    twinkle: Math.random() * Math.PI * 2, // phase offset
  };
}

/* ── Shooting star ─────────────────────────────────────────────────────────── */
class ShootingStar {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.respawn();
  }

  respawn() {
    this.x     = Math.random() * this.w * 0.7;
    this.y     = Math.random() * this.h * 0.4;
    this.len   = Math.random() * 150 + 80;
    this.speed = Math.random() * 14 + 8;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    this.life  = 1;
    this.decay = Math.random() * 0.015 + 0.008;
    this.width = Math.random() * 1.5 + 0.5;
    // Random: primary or accent colour
    this.color = Math.random() < 0.7 ? PRIMARY : ACCENT;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life -= this.decay;
    if (this.life <= 0 || this.x > this.w + 50 || this.y > this.h + 50) {
      this.respawn();
    }
  }

  draw(ctx) {
    const r = parseInt(this.color.slice(1, 3), 16);
    const g = parseInt(this.color.slice(3, 5), 16);
    const b = parseInt(this.color.slice(5, 7), 16);
    const tailX = this.x - Math.cos(this.angle) * this.len;
    const tailY = this.y - Math.sin(this.angle) * this.len;

    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${this.life * 0.9})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.width * this.life;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bright tip
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * this.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.life * 0.8})`;
    ctx.fill();
  }
}

/* ── Aurora bands ─────────────────────────────────────────────────────────── */
function drawAurora(ctx, w, h, t) {
  // Top band (primary blue)
  {
    const r = parseInt(PRIMARY.slice(1,3),16);
    const g = parseInt(PRIMARY.slice(3,5),16);
    const b = parseInt(PRIMARY.slice(5,7),16);
    const height = h * 0.18 + Math.sin(t * 0.003) * h * 0.03;
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.12)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, height);
  }
  // Bottom-right band (accent pink)
  {
    const r = parseInt(ACCENT.slice(1,3),16);
    const g = parseInt(ACCENT.slice(3,5),16);
    const b = parseInt(ACCENT.slice(5,7),16);
    const ht = h * 0.22 + Math.cos(t * 0.004) * h * 0.03;
    const grad = ctx.createLinearGradient(0, h, 0, h - ht);
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.10)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},0.04)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - ht, w, ht);
  }
  // Right edge band
  {
    const r = parseInt(PRIMARY.slice(1,3),16);
    const g = parseInt(PRIMARY.slice(3,5),16);
    const b = parseInt(PRIMARY.slice(5,7),16);
    const wd = w * 0.12;
    const grad = ctx.createLinearGradient(w, 0, w - wd, 0);
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.07)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(w - wd, 0, wd, h);
  }
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function DeepSpaceBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ raf: null, t: 0, layers: [], shooters: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const w = canvas.width, h = canvas.height;

      state.layers = LAYER_CONFIGS.map(({ count, speed, rMin, rMax }) =>
        Array.from(
          { length: Math.floor(count * particleMultiplier) },
          () => makeStar(w, h, speed, rMin, rMax)
        )
      );
      const shooterCount = Math.floor(4 * particleMultiplier);
      state.shooters = Array.from({ length: shooterCount }, () => new ShootingStar(w, h));
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width, h = canvas.height;
      state.t++;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // Aurora bands (below stars)
      drawAurora(ctx, w, h, state.t);

      // Stars — each layer scrolls at different speed (parallax)
      state.layers.forEach((layer, li) => {
        const speed = LAYER_CONFIGS[li].speed;
        for (const star of layer) {
          // Twinkle
          star.twinkle += 0.02;
          const a = star.alpha * (0.7 + 0.3 * Math.sin(star.twinkle));

          // Subtle drift (parallax on scroll approximated by y movement)
          star.y += star.speed;
          if (star.y > h) { star.y = 0; star.x = Math.random() * w; }

          const [r, g, b] = li === 2
            ? [255, 255, 255]
            : [parseInt(PRIMARY.slice(1,3),16), parseInt(PRIMARY.slice(3,5),16), parseInt(PRIMARY.slice(5,7),16)];

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fill();
        }
      });

      // Shooting stars
      for (const s of state.shooters) {
        s.update();
        s.draw(ctx);
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

  return <canvas ref={canvasRef} className="living-bg-canvas" />;
}
