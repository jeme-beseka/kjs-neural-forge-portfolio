// src/sections/SkillsSection.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import {
  Layers,
  Server,
  Wrench,
  Boxes,
  Cpu,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ─────────────────────────────────────────────────────────────────────────────
   FALLBACK DATA
   Used when Supabase is not configured or returns an empty set.
   Remove / replace once the real DB is populated.
   ─────────────────────────────────────────────────────────────────────────── */

const FALLBACK_SKILLS = [
  // Frontend
  { id: 1, name: 'React.js',      category: 'Frontend', proficiency_level: 90, icon_url: null },
  { id: 2, name: 'JavaScript',    category: 'Frontend', proficiency_level: 88, icon_url: null },
  // Backend
  { id: 3, name: 'Node.js',       category: 'Backend',  proficiency_level: 80, icon_url: null },
  { id: 4, name: 'Python',        category: 'Backend',  proficiency_level: 82, icon_url: null },
  { id: 5, name: 'Django',        category: 'Backend',  proficiency_level: 75, icon_url: null },
  { id: 6, name: 'Java',          category: 'Backend',  proficiency_level: 70, icon_url: null },
  // Tools / Data
  { id: 7, name: 'SQL',           category: 'Tools',    proficiency_level: 78, icon_url: null },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY META — icon + colour tint per category
   ─────────────────────────────────────────────────────────────────────────── */

const CATEGORY_META = {
  Frontend:  { Icon: Layers,  order: 0 },
  Backend:   { Icon: Server,  order: 1 },
  Tools:     { Icon: Wrench,  order: 2 },
  Other:     { Icon: Boxes,   order: 3 },
};

const getCategoryMeta = (cat) =>
  CATEGORY_META[cat] ?? { Icon: Cpu, order: 99 };

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADING
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
   ANIMATED PROGRESS BAR
   ─────────────────────────────────────────────────────────────────────────── */

function ProgressBar({ value }) {
  const barRef   = useRef(null);
  const inView   = useInView(barRef, { once: true, margin: '-40px' });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // small delay so the card entrance animation settles first
    const timer = setTimeout(() => {
      const controls = animate(0, value, {
        duration: 1.1,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => setWidth(v),
      });
      return () => controls.stop();
    }, 200);
    return () => clearTimeout(timer);
  }, [inView, value]);

  return (
    <div
      ref={barRef}
      style={{
        flex: 1,
        height: '5px',
        borderRadius: '4px',
        background: 'rgba(var(--color-primary-rgb), 0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          borderRadius: '4px',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          boxShadow: '0 0 8px var(--color-glow)',
          transition: 'none',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILL BADGE (pill with name + bar)
   ─────────────────────────────────────────────────────────────────────────── */

function SkillBadge({ name, proficiency_level }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '100px',
        background: 'rgba(var(--color-primary-rgb), 0.06)',
        border: '1px solid rgba(var(--color-primary-rgb), 0.14)',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--mode-text)',
          whiteSpace: 'nowrap',
          minWidth: '70px',
        }}
      >
        {name}
      </span>

      <ProgressBar value={proficiency_level} />

      <span
        style={{
          fontSize: '0.65rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--color-primary)',
          whiteSpace: 'nowrap',
          minWidth: '28px',
          textAlign: 'right',
        }}
      >
        {Math.round(proficiency_level)}%
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CARD
   ─────────────────────────────────────────────────────────────────────────── */

function CategoryCard({ category, skills, delay }) {
  const { Icon } = getCategoryMeta(category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      style={{
        padding: '24px',
        borderRadius: '18px',
        background: 'rgba(var(--color-primary-rgb), 0.03)',
        border: '1px solid rgba(var(--color-primary-rgb), 0.13)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.35)';
        e.currentTarget.style.boxShadow   = '0 8px 40px rgba(var(--color-primary-rgb), 0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.13)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {/* Category header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.1)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(var(--color-primary-rgb), 0.12)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--mode-text)',
              letterSpacing: '0.02em',
            }}
          >
            {category}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.65rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--mode-text-muted)',
            }}
          >
            {skills.length} skill{skills.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Skills list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {skills.map((skill) => (
          <SkillBadge key={skill.id} {...skill} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
   ─────────────────────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '18px',
        background: 'rgba(var(--color-primary-rgb), 0.03)',
        border: '1px solid rgba(var(--color-primary-rgb), 0.1)',
        animation: 'skeletonPulse 1.6s ease-in-out infinite',
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.08)' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(var(--color-primary-rgb), 0.08)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '12px', width: '80px', borderRadius: '6px', background: 'rgba(var(--color-primary-rgb), 0.08)', marginBottom: '6px' }} />
          <div style={{ height: '9px', width: '50px', borderRadius: '6px', background: 'rgba(var(--color-primary-rgb), 0.05)' }} />
        </div>
      </div>
      {/* Skill rows skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '100px', background: 'rgba(var(--color-primary-rgb), 0.05)', marginBottom: '8px' }}>
          <div style={{ width: '70px', height: '10px', borderRadius: '5px', background: 'rgba(var(--color-primary-rgb), 0.08)' }} />
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: 'rgba(var(--color-primary-rgb), 0.06)' }} />
          <div style={{ width: '28px', height: '10px', borderRadius: '5px', background: 'rgba(var(--color-primary-rgb), 0.06)' }} />
        </div>
      ))}
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY STATE
   ─────────────────────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        borderRadius: '18px',
        border: '1px dashed rgba(var(--color-primary-rgb), 0.25)',
        gap: '14px',
        textAlign: 'center',
      }}
    >
      <Boxes size={36} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
      <p
        style={{
          margin: 0,
          fontSize: '0.9rem',
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--mode-text-muted)',
        }}
      >
        No skills added yet.
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '0.72rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--mode-text-muted)',
          opacity: 0.6,
        }}
      >
        Add rows to the <code>skills</code> table in Supabase to populate this section.
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS SECTION
   ─────────────────────────────────────────────────────────────────────────── */

export default function SkillsSection() {
  const [skills,  setSkills]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSkills = async () => {
      // If Supabase isn't configured, skip straight to fallback
      if (!supabase) {
        setSkills(FALLBACK_SKILLS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name, category, proficiency_level, icon_url')
          .order('category')
          .order('proficiency_level', { ascending: false });

        if (cancelled) return;

        if (error) throw error;

        // Use fallback if DB is genuinely empty
        setSkills(data && data.length > 0 ? data : FALLBACK_SKILLS);
      } catch {
        if (!cancelled) setSkills(FALLBACK_SKILLS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSkills();
    return () => { cancelled = true; };
  }, []);

  /* Group by category */
  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  // Sort categories by predefined order
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (getCategoryMeta(a).order ?? 99) - (getCategoryMeta(b).order ?? 99)
  );

  return (
    <section
      id="skills"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 128px) 0',
        overflow: 'hidden',
      }}
    >
      {/* Ambient blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(var(--color-primary-rgb), 0.07) 0%, transparent 70%)',
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
        <SectionHeading label="// what i know" title="My Skills" />

        {loading ? (
          /* ── Skeleton grid ─────────────────────────────────── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : sortedCategories.length === 0 ? (
          /* ── Empty state ───────────────────────────────────── */
          <div style={{ display: 'grid' }}>
            <EmptyState />
          </div>
        ) : (
          /* ── Category cards ────────────────────────────────── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {sortedCategories.map((cat, i) => (
              <CategoryCard
                key={cat}
                category={cat}
                skills={grouped[cat]}
                delay={i * 0.1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
