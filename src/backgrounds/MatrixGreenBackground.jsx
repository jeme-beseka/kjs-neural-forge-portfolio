// src/backgrounds/MatrixGreenBackground.jsx
// Theme: Matrix Green — Falling Character Columns + Edge Flash Effects
import { useEffect, useRef } from 'react';

const PRIMARY    = '#00FF88';
const PRIMARY_DIM = '#003320';
const BG         = '#010D05';

// Characters to rain — katakana + digits + symbols for that hacker aesthetic
const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
  'ハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  '0123456789ABCDEF<>{}[]|#@$%^&*+=~';

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

/* ── Column ───────────────────────────────────────────────────────────────── */
class Column {
  constructor(x, h, fontSize) {
    this.x        = x;
    this.h        = h;
    this.fontSize = fontSize;
    this.maxCells = Math.ceil(h / fontSize);
    this.reset();
  }

  reset() {
    // Start each column at a random y so rain starts staggered
    this.y     = -Math.floor(Math.random() * this.maxCells);
    this.speed = Math.random() * 0.5 + 0.3; // fractional cell steps per frame
    this.acc   = 0;
    this.trail = Math.floor(Math.random() * 14) + 8; // length of bright trail
    this.chars = Array.from({ length: this.maxCells + this.trail }, () => randChar());
    this.mutationTimer = 0;
  }

  update() {
    this.acc += this.speed;
    if (this.acc >= 1) {
      this.y++;
      this.acc -= 1;
      // Occasionally mutate a random character in the trail
      if (++this.mutationTimer > 3) {
        this.mutationTimer = 0;
        const idx = Math.floor(Math.random() * this.chars.length);
        this.chars[idx] = randChar();
      }
    }
    // Respawn after column scrolls off screen
    if ((this.y - this.trail) * this.fontSize > this.h) {
      this.reset();
    }
  }

  draw(ctx) {
    const fs = this.fontSize;
    for (let i = 0; i < this.trail; i++) {
      const cellY = this.y - i;
      if (cellY < 0) continue;
      const screenY = cellY * fs;
      if (screenY > this.h) continue;

      const ch = this.chars[cellY % this.chars.length];

      if (i === 0) {
        // Leading character — bright white
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = PRIMARY;
        ctx.shadowBlur = 8;
      } else if (i < 3) {
        // Near top of trail — bright primary
        const alpha = 1 - i * 0.25;
        ctx.fillStyle = `rgba(0,255,136,${alpha})`;
        ctx.shadowColor = PRIMARY;
        ctx.shadowBlur = 4;
      } else {
        // Rest of trail — fades out
        const alpha = Math.max(0, 1 - i / this.trail);
        ctx.fillStyle = `rgba(0,255,136,${alpha * 0.6})`;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(ch, this.x, screenY);
    }
    ctx.shadowBlur = 0;
  }
}

/* ── Edge Flash ────────────────────────────────────────────────────────────── */
class EdgeFlash {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.respawn();
  }

  respawn() {
    // Pick a random edge (0=top,1=bottom,2=left,3=right)
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0)      { this.x = Math.random() * this.w; this.y = 0; }
    else if (edge === 1) { this.x = Math.random() * this.w; this.y = this.h; }
    else if (edge === 2) { this.x = 0; this.y = Math.random() * this.h; }
    else                 { this.x = this.w; this.y = Math.random() * this.h; }

    this.char  = randChar();
    this.alpha = 1;
    this.decay = Math.random() * 0.04 + 0.02;
    this.size  = Math.floor(Math.random() * 12) + 8;
    this.timer = Math.floor(Math.random() * 60);
  }

  update() {
    if (this.timer > 0) { this.timer--; return; }
    this.alpha -= this.decay;
    if (this.alpha <= 0) this.respawn();
  }

  draw(ctx) {
    if (this.timer > 0 || this.alpha <= 0) return;
    ctx.font = `${this.size}px 'Courier New', monospace`;
    ctx.fillStyle = `rgba(0,255,136,${this.alpha * 0.7})`;
    ctx.fillText(this.char, this.x, this.y);
  }
}

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function MatrixGreenBackground({ paused, particleMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ raf: null, columns: [], flashes: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const FONT_SIZE = 14;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const w = canvas.width, h = canvas.height;

      const totalCols = Math.floor(w / FONT_SIZE);
      // Skip some columns on mobile to maintain performance
      const density = particleMultiplier < 1 ? 0.6 : 1;
      state.columns = [];
      for (let i = 0; i < totalCols; i++) {
        if (Math.random() < density) {
          state.columns.push(new Column(i * FONT_SIZE, h, FONT_SIZE));
        }
      }

      const flashCount = Math.floor(20 * particleMultiplier);
      state.flashes = Array.from({ length: flashCount }, () => new EdgeFlash(w, h));
    }

    function draw() {
      if (paused) { state.raf = requestAnimationFrame(draw); return; }

      const w = canvas.width, h = canvas.height;

      // Fade background (creates the trail smear effect)
      ctx.fillStyle = 'rgba(1,13,5,0.15)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (const col of state.columns) {
        col.update();
        col.draw(ctx);
      }

      // Edge flashes
      for (const f of state.flashes) {
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
