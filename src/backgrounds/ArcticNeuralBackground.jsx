// src/backgrounds/ArcticNeuralBackground.jsx
// Theme: Arctic Neural — Neural Network + Signal Pulses + Frost Particles
import { useEffect, useRef } from 'react';

const PRIMARY = '#00B4D8';
const ACCENT  = '#90E0EF';
const BG      = '#03111A';

const MAX_DIST = 180; // max distance to draw a connection

/* ── Neural Node ──────────────────────────────────────────────────────────── */
class NeuralNode {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.x  = Math.random() * w;
    this.y  = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 2.5 + 1;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Bounce
    if (this.x < 0 || this.x > this.w) this.vx *= -1;
    if (this.y < 0 || this.y > this.h) this.vy *= -1;
    this.pulsePhase += 0.02;
  }

  draw(ctx, t) {
    const pulse = (Math.sin(this.pulsePhase) + 1) * 0.5;
    const r = parseInt(PRIMARY.slice(1,3),16);
    const g = parseInt(PRIMARY.slice(3,5),16);
    const b = parseInt(PRIMARY.slice(5,7),16);

    // Outer glow
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4 + pulse * 4);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${0.4 + pulse * 0.3})`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.1 + pulse * 0.1})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 4 + pulse * 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${0.7 + pulse * 0.3})`;
    ctx.fill();
  }
}

/* ── Signal Pulse ─────────────────────────────────────────────────────────── */
class SignalPulse {
  constructor(fromNode, toNode) {
    this.from = fromNode;
    this.to   = toNode;
    this.t    = 0; // 0→1 progress along the edge
    this.speed = Math.random() * 0.008 + 0.004;
    this.done  = false;
  }

  update() {
    this.t += this.speed;
    if (this.t >= 1) this.done = true;
  }

  draw(ctx) {
    if (this.done) return;
    const x = this.from.x + (this.to.x - this.from.x) * this.t;
    const y = this.from.y + (this.to.y - this.from.y) * this.t;
    const r = parseInt(ACCENT.slice(1,3),16);
    const g = parseInt(ACCENT.slice(3,5),16);
    const b = parseInt(ACCENT.slice(5,7),16);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

/* ── Frost Particle ───────────────────────────────────────────────────────── */
class FrostParticle {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.reset();
  }

  reset() {
    this.x     = Math.random() * this.w;
    this.y     = -10;
    this.size  = Math.random() * 3 + 1;
    this.vy    = Math.random() * 0.5 + 0.2;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.4 + 0.2;
    this.spin  = Math.random() * 0.05 - 0.025;
    this.angle = 0;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.y * 0.02) * 0.2;
    this.angle += this.spin;
    if (this.y > this.h + 10) this.reset();
  }

  draw(ctx) {
    const r = parseInt(ACCENT.slice(1,3),16);
    const g = parseInt(ACCENT.slice(3,5),16);
    const b = parseInt(ACCENT.slice(5,7),16);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // Draw a tiny 6-pointed crystal
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * this.size, Math.sin(a) * this.size);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function ArcticNeuralBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ raf: null, t: 0, nodes: [], pulses: [], frost: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    let pulseTimer = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const w = canvas.width, h = canvas.height;

      const nodeCount  = Math.floor(55 * particleMultiplier);
      const frostCount = Math.floor(120 * particleMultiplier);
      state.nodes = Array.from({ length: nodeCount  }, () => new NeuralNode(w, h));
      state.frost  = Array.from({ length: frostCount }, () => {
        const p = new FrostParticle(w, h);
        p.y = Math.random() * h; // init spread
        return p;
      });
      state.pulses = [];
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width, h = canvas.height;
      state.t++;
      pulseTimer++;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const [pr, pg, pb] = [parseInt(PRIMARY.slice(1,3),16), parseInt(PRIMARY.slice(3,5),16), parseInt(PRIMARY.slice(5,7),16)];

      // Draw connections between nearby nodes
      for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
          const a = state.nodes[i], b = state.nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Spawn pulses every ~90 frames
      if (pulseTimer > 90 && state.nodes.length > 1) {
        pulseTimer = 0;
        const from = state.nodes[Math.floor(Math.random() * state.nodes.length)];
        const to   = state.nodes[Math.floor(Math.random() * state.nodes.length)];
        if (from !== to) state.pulses.push(new SignalPulse(from, to));
      }

      // Update & draw nodes
      for (const node of state.nodes) {
        node.update();
        node.draw(ctx, state.t);
      }

      // Update & draw pulses
      state.pulses = state.pulses.filter(p => !p.done);
      for (const pulse of state.pulses) {
        pulse.update();
        pulse.draw(ctx);
      }

      // Frost
      for (const f of state.frost) {
        f.update();
        f.draw(ctx);
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
