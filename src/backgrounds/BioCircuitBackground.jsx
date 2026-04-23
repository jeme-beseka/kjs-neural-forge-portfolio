// src/backgrounds/BioCircuitBackground.jsx
// Theme: Bio Circuit — Self-Drawing PCB Traces + Solder Dots + Arc Flashes
import { useEffect, useRef } from 'react';

const PRIMARY = '#39FF14';
const ACCENT  = '#ADFF2F';
const BG      = '#020B01';

const GRID = 40; // grid cell size for PCB traces

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function gridSnap(v) { return Math.round(v / GRID) * GRID; }

function hexRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

/* ── PCB Trace ─────────────────────────────────────────────────────────────── */
class PCBTrace {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.points = [];
    this.drawProgress = 0; // 0→totalLength
    this.totalLength  = 0;
    this.done         = false;
    this.alpha        = 0.18 + Math.random() * 0.12;
    this.color        = Math.random() < 0.6 ? PRIMARY : ACCENT;
    this.generate();
  }

  generate() {
    // Start from a random grid-snapped point
    let x = gridSnap(Math.random() * this.w);
    let y = gridSnap(Math.random() * this.h);
    this.points.push({ x, y });

    const segCount = Math.floor(Math.random() * 8) + 4;
    let dir = Math.floor(Math.random() * 4); // 0=R, 1=D, 2=L, 3=U

    for (let i = 0; i < segCount; i++) {
      const len = (Math.floor(Math.random() * 5) + 1) * GRID;
      const dx = [1, 0, -1, 0][dir] * len;
      const dy = [0, 1, 0, -1][dir] * len;
      x = Math.max(0, Math.min(this.w, x + dx));
      y = Math.max(0, Math.min(this.h, y + dy));
      this.points.push({ x, y });
      this.totalLength += Math.abs(dx) + Math.abs(dy);
      // Turn 90° (randomly L or R)
      dir = (dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
    }
    this.speed = Math.random() * 3 + 2;
  }

  update() {
    if (this.done) return;
    this.drawProgress = Math.min(this.drawProgress + this.speed, this.totalLength);
    if (this.drawProgress >= this.totalLength) this.done = true;
  }

  draw(ctx) {
    if (this.points.length < 2) return;
    const [r, g, b] = hexRgb(this.color);
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'miter';

    // Draw only up to drawProgress
    let drawn = 0;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i-1].x;
      const dy = this.points[i].y - this.points[i-1].y;
      const segLen = Math.abs(dx) + Math.abs(dy);
      const remaining = this.drawProgress - drawn;

      if (remaining <= 0) break;

      if (remaining >= segLen) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
        drawn += segLen;
      } else {
        const t = remaining / segLen;
        ctx.lineTo(
          this.points[i-1].x + dx * t,
          this.points[i-1].y + dy * t
        );
        drawn = this.drawProgress;
        break;
      }
    }
    ctx.stroke();
  }

  getSolderPoints() {
    // Return completed junction points (for solder dots)
    const result = [];
    let drawn = 0;
    result.push(this.points[0]);
    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i-1].x;
      const dy = this.points[i].y - this.points[i-1].y;
      const segLen = Math.abs(dx) + Math.abs(dy);
      drawn += segLen;
      if (drawn <= this.drawProgress) {
        result.push(this.points[i]);
      } else {
        break;
      }
    }
    return result;
  }
}

/* ── Solder Dot ─────────────────────────────────────────────────────────────── */
function drawSolderDot(ctx, x, y, t, color) {
  const [r, g, b] = hexRgb(color);
  const pulse = (Math.sin(t * 0.05 + x * 0.01 + y * 0.01) + 1) * 0.5;
  const radius = 3 + pulse * 2;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
  grad.addColorStop(0,   `rgba(${r},${g},${b},${0.7 + pulse * 0.3})`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.2 + pulse * 0.1})`);
  grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

  ctx.beginPath();
  ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${0.8 + pulse * 0.2})`;
  ctx.fill();
}

/* ── Arc Flash ──────────────────────────────────────────────────────────────── */
class ArcFlash {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.life = 1;
    this.decay = Math.random() * 0.08 + 0.04;
    this.segments = Math.floor(Math.random() * 4) + 3;
  }

  update() {
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const [r, g, b] = hexRgb(ACCENT);
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.life})`;
    ctx.lineWidth = 1;

    // Jagged lightning path
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    for (let i = 1; i <= this.segments; i++) {
      const t  = i / (this.segments + 1);
      const mx = this.x1 + (this.x2 - this.x1) * t + (Math.random() - 0.5) * 20;
      const my = this.y1 + (this.y2 - this.y1) * t + (Math.random() - 0.5) * 20;
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function BioCircuitBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ raf: null, t: 0, traces: [], arcs: [], spawnTimer: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const MAX_TRACES = Math.floor(30 * particleMultiplier);

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      state.traces = [];
      state.arcs   = [];
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width, h = canvas.height;
      state.t++;
      state.spawnTimer++;

      // Slow background fade for glow accumulation
      ctx.fillStyle = 'rgba(2,11,1,0.25)';
      ctx.fillRect(0, 0, w, h);

      // Spawn new traces occasionally
      if (state.spawnTimer > 40 && state.traces.length < MAX_TRACES) {
        state.spawnTimer = 0;
        state.traces.push(new PCBTrace(w, h));
      }

      // Remove very faded or done-and-old traces
      if (state.traces.length > MAX_TRACES * 1.3) {
        state.traces.splice(0, 5);
      }

      // Draw & collect solder points
      const allSolderPoints = new Map();
      for (const trace of state.traces) {
        trace.update();
        trace.draw(ctx);

        for (const pt of trace.getSolderPoints()) {
          const key = `${pt.x},${pt.y}`;
          if (!allSolderPoints.has(key)) {
            allSolderPoints.set(key, { ...pt, color: trace.color });
          }
        }
      }

      // Draw solder dots
      for (const [, { x, y, color }] of allSolderPoints) {
        drawSolderDot(ctx, x, y, state.t, color);
      }

      // Spawn arc flashes between nearby solder points occasionally
      if (state.t % 45 === 0) {
        const pts = [...allSolderPoints.values()];
        if (pts.length > 1) {
          const a = pts[Math.floor(Math.random() * pts.length)];
          const b = pts[Math.floor(Math.random() * pts.length)];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120 && dist > 20) {
            state.arcs.push(new ArcFlash(a.x, a.y, b.x, b.y));
          }
        }
      }

      // Draw arcs
      state.arcs = state.arcs.filter(a => a.life > 0);
      for (const arc of state.arcs) {
        arc.update();
        arc.draw(ctx);
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
