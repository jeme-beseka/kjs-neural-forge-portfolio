// src/backgrounds/ToxicForgeBackground.jsx
// Theme: Toxic Forge — Morphing Plasma Blobs + Ripple Waves + Rising Bubbles
import { useEffect, useRef } from 'react';

const PRIMARY = '#00FFC8';
const ACCENT  = '#7FFF00';
const BG      = '#011A10';

function hexRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

/* ── Plasma Blob ───────────────────────────────────────────────────────────── */
class PlasmaBlob {
  constructor(w, h, index) {
    this.w = w; this.h = h;
    this.cx = w * (0.2 + Math.random() * 0.6);
    this.cy = h * (0.2 + Math.random() * 0.6);
    this.baseR  = Math.min(w, h) * (0.15 + Math.random() * 0.15);
    this.vx     = (Math.random() - 0.5) * 0.3;
    this.vy     = (Math.random() - 0.5) * 0.3;
    this.phase  = index * (Math.PI * 2 / 3);
    this.morphSpeed = Math.random() * 0.008 + 0.004;
    this.color  = index % 2 === 0 ? PRIMARY : ACCENT;
  }

  update(t) {
    this.cx += this.vx + Math.sin(t * 0.003 + this.phase) * 0.4;
    this.cy += this.vy + Math.cos(t * 0.004 + this.phase) * 0.3;

    // Soft bounce
    if (this.cx < -this.baseR) this.vx = Math.abs(this.vx);
    if (this.cx > this.w + this.baseR) this.vx = -Math.abs(this.vx);
    if (this.cy < -this.baseR) this.vy = Math.abs(this.vy);
    if (this.cy > this.h + this.baseR) this.vy = -Math.abs(this.vy);
  }

  draw(ctx, t) {
    const morphT = t * this.morphSpeed;
    const [r, g, b] = hexRgb(this.color);

    // Build a morphing blob using multiple radial gradients at offset centres
    const offsets = [
      { dx: Math.sin(morphT)         * this.baseR * 0.3, dy: Math.cos(morphT * 1.1)     * this.baseR * 0.3 },
      { dx: Math.cos(morphT * 0.7)   * this.baseR * 0.2, dy: Math.sin(morphT * 0.9)     * this.baseR * 0.2 },
      { dx: Math.sin(morphT * 1.3)   * this.baseR * 0.15,dy: Math.cos(morphT * 0.8)     * this.baseR * 0.15},
    ];

    for (const off of offsets) {
      const grad = ctx.createRadialGradient(
        this.cx + off.dx, this.cy + off.dy, 0,
        this.cx + off.dx, this.cy + off.dy, this.baseR
      );
      grad.addColorStop(0,   `rgba(${r},${g},${b},0.07)`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},0.03)`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.cx + off.dx, this.cy + off.dy, this.baseR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

/* ── Ripple Wave ───────────────────────────────────────────────────────────── */
class Ripple {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.r     = 0;
    this.maxR  = 120 + Math.random() * 80;
    this.speed = Math.random() * 1.5 + 0.8;
    this.life  = 1;
  }

  update() {
    this.r    += this.speed;
    this.life  = Math.max(0, 1 - this.r / this.maxR);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const [r, g, b] = hexRgb(PRIMARY);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.life * 0.3})`;
    ctx.lineWidth = 1.5 * this.life;
    ctx.stroke();

    // Second ring slightly behind
    if (this.r > 20) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${this.life * 0.15})`;
      ctx.lineWidth = this.life;
      ctx.stroke();
    }
  }
}

/* ── Bubble ───────────────────────────────────────────────────────────────── */
class Bubble {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.reset();
  }

  reset() {
    this.x     = Math.random() * this.w;
    this.y     = this.h + 10;
    this.r     = Math.random() * 4 + 2;
    this.vy    = -(Math.random() * 0.8 + 0.4);
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.wobble = Math.random() * Math.PI * 2;
    this.alpha = Math.random() * 0.4 + 0.15;
    this.color = Math.random() < 0.6 ? PRIMARY : ACCENT;
  }

  update() {
    this.y      += this.vy;
    this.wobble += 0.03;
    this.x      += this.vx + Math.sin(this.wobble) * 0.4;
    if (this.y < -10) this.reset();
  }

  draw(ctx) {
    const [r, g, b] = hexRgb(this.color);

    // Bubble outline
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Tiny highlight
    ctx.beginPath();
    ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.5})`;
    ctx.fill();
  }
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function ToxicForgeBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ raf: null, t: 0, blobs: [], ripples: [], bubbles: [], rippleTimer: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const w = canvas.width, h = canvas.height;

      state.blobs   = Array.from({ length: 3 }, (_, i) => new PlasmaBlob(w, h, i));
      state.ripples = [];
      const bubbleCount = Math.floor(60 * particleMultiplier);
      state.bubbles = Array.from({ length: bubbleCount }, () => {
        const b = new Bubble(w, h);
        b.y = Math.random() * h; // start spread vertically
        return b;
      });
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width, h = canvas.height;
      state.t++;
      state.rippleTimer++;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // Plasma blobs
      for (const blob of state.blobs) {
        blob.update(state.t);
        blob.draw(ctx, state.t);
      }

      // Spawn ripple randomly
      if (state.rippleTimer > 120) {
        state.rippleTimer = 0;
        if (Math.random() < 0.7) {
          state.ripples.push(new Ripple(
            Math.random() * w,
            Math.random() * h
          ));
        }
      }

      // Ripples
      state.ripples = state.ripples.filter(rip => rip.life > 0);
      for (const rip of state.ripples) {
        rip.update();
        rip.draw(ctx);
      }

      // Bubbles
      for (const b of state.bubbles) {
        b.update();
        b.draw(ctx);
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
