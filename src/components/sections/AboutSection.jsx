// src/sections/AboutSection.jsx
import { useRef, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';
import {
  Globe,
  MonitorCheck,
  BarChart3,
  Plug2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   WHAT I DO — cards
   ─────────────────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    Icon: Globe,
    title: 'Web Development',
    desc: 'Crafting fast, accessible web apps end-to-end.',
  },
  {
    Icon: MonitorCheck,
    title: 'Desktop Apps',
    desc: 'High performance Desktop applications using native Java',
  },
  {
    Icon: BarChart3,
    title: 'Data Visualization',
    desc: 'Turning raw numbers into insightful, interactive charts.',
  },
  {
    Icon: Plug2,
    title: 'API Integration',
    desc: 'Bridging services with robust REST layers.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE CARD — hex pattern placeholder + 3-D tilt
   ─────────────────────────────────────────────────────────────────────────── */

function ProfileCard() {
  const cardRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-1, 1], [12, -12]), {
    stiffness: 220,
    damping: 28,
  });
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-12, 12]), {
    stiffness: 220,
    damping: 28,
  });

  const handleMouseMove = useCallback(
    (e) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
      className="relative mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.25 } }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent), var(--color-primary))',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 4s ease infinite',
          zIndex: 0,
          filter: 'blur(0px)',
        }}
      />
      {/* Inner card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '360px',
          maxWidth: '100%',
          height: '380px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'color-mix(in srgb, var(--color-bg-dark) 80%, var(--color-primary) 20%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        {/* Hex grid bg */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.12,
          }}
          aria-hidden="true"
        >
          <defs>
            <pattern id="hexPat" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
              <polygon
                points="20,2 36,11 36,29 20,38 4,29 4,11"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPat)" />
        </svg>

        {/* Radial glow center */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(var(--color-primary-rgb), 0.22) 0%, transparent 70%)',
          }}
        />

        {/* Avatar placeholder */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'rgba(var(--color-primary-rgb), 0.15)',
            border: '2px solid rgba(var(--color-primary-rgb), 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Silhouette SVG */}
          <svg viewBox="0 0 80 80" width="68" height="68" fill="none">
            <circle cx="40" cy="28" r="16" fill="rgba(var(--color-primary-rgb), 0.45)" />
            <path
              d="M10 68c0-16.569 13.431-30 30-30s30 13.431 30 30"
              fill="rgba(var(--color-primary-rgb), 0.45)"
            />
          </svg>
        </div>

        {/* Name + moniker */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--color-primary)',
              textShadow: '0 0 16px var(--color-glow)',
              letterSpacing: '0.04em',
            }}
          >
            Jeme Beseka
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.75rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--mode-text-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {'<FullStack Developer />'}
          </p>
        </div>

        {/* Status pill */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 14px',
            borderRadius: '100px',
            background: 'rgba(var(--color-primary-rgb), 0.1)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
            fontSize: '0.7rem',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--color-primary)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              animation: 'pulse 1.8s ease-in-out infinite',
              boxShadow: '0 0 6px var(--color-glow)',
            }}
          />
          Available for hire
        </div>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SERVICE CARD
   ─────────────────────────────────────────────────────────────────────────── */

function ServiceCard({ Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(var(--color-primary-rgb), 0.04)',
        border: '1px solid rgba(var(--color-primary-rgb), 0.14)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'default',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.45)';
        e.currentTarget.style.boxShadow   = '0 8px 32px rgba(var(--color-primary-rgb), 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.14)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(var(--color-primary-rgb), 0.12)',
          border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: 'var(--color-primary)',
        }}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p
        style={{
          margin: '0 0 6px',
          fontSize: '0.87rem',
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--mode-text)',
          letterSpacing: '0.01em',
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          lineHeight: 1.6,
          color: 'var(--mode-text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADING — with animated underline
   ─────────────────────────────────────────────────────────────────────────── */

function SectionHeading({ label, title }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} style={{ marginBottom: '56px' }}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        style={{
          margin: '0 0 10px',
          fontSize: '0.68rem',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--color-primary)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.08 }}
        style={{
          margin: 0,
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--mode-text)',
          lineHeight: 1.15,
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {title}
        {/* Animated underline */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          style={{
            display: 'block',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            boxShadow: '0 0 10px var(--color-glow)',
            transformOrigin: 'left',
            marginTop: '6px',
          }}
        />
      </motion.h2>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ABOUT SECTION
   ─────────────────────────────────────────────────────────────────────────── */

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 128px) 0',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%',
          right: '-120px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-80px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 40px)',
        }}
      >
        <SectionHeading label="// who i am" title="About Me" />

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'start',
          }}
        >
          {/* ── Left: Profile card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ProfileCard />
          </motion.div>

          {/* ── Right: Bio + service cards ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Bio */}
            <div style={{ marginBottom: '36px' }}>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  lineHeight: 1.8,
                  color: 'var(--mode-text)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Hey — I'm{' '}
                <strong style={{ color: 'var(--color-primary)' }}>Jeme Beseka</strong>, a
                full-stack developer based in Cameroon, passionate about turning complex
                problems into clean, intuitive digital experiences. I thrive at the
                intersection of design and engineering.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
                  lineHeight: 1.8,
                  color: 'var(--mode-text-muted)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                With a focus on the Cameroonian tech ecosystem, I build scalable platforms
                — from multi-vendor marketplaces to data pipelines — always with an eye
                on performance, accessibility, and pixel-perfect craft.
              </p>
            </div>

            {/* What I Do heading */}
            <p
              style={{
                margin: '0 0 18px',
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--color-primary)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              // what i do
            </p>

            {/* 2×2 Service card grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
              }}
            >
              {SERVICES.map((s, i) => (
                <ServiceCard
                  key={s.title}
                  {...s}
                  delay={0.15 + i * 0.08}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
