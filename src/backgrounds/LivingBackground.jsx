// src/backgrounds/LivingBackground.jsx
import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────────────
   Lazy-load each background to keep initial bundle light
   ─────────────────────────────────────────────────────────────────────────── */
const CyberBlueBackground    = lazy(() => import('./CyberBlueBackground'));
const DeepSpaceBackground    = lazy(() => import('./DeepSpaceBackground'));
const ArcticNeuralBackground = lazy(() => import('./ArcticNeuralBackground'));
const MatrixGreenBackground  = lazy(() => import('./MatrixGreenBackground'));
const BioCircuitBackground   = lazy(() => import('./BioCircuitBackground'));
const ToxicForgeBackground   = lazy(() => import('./ToxicForgeBackground'));

/* ─────────────────────────────────────────────────────────────────────────────
   Derive whether we're on a narrow viewport (mobile)
   ─────────────────────────────────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Track document visibility (Page Visibility API)
   ─────────────────────────────────────────────────────────────────────────── */
function useIsVisible() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handler = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return isVisible;
}

/* ─────────────────────────────────────────────────────────────────────────────
   THEME → COMPONENT MAP
   ─────────────────────────────────────────────────────────────────────────── */
const BACKGROUND_MAP = {
  'cyber-blue':    CyberBlueBackground,
  'deep-space':    DeepSpaceBackground,
  'arctic-neural': ArcticNeuralBackground,
  'matrix-green':  MatrixGreenBackground,
  'bio-circuit':   BioCircuitBackground,
  'toxic-forge':   ToxicForgeBackground,
};

/* ─────────────────────────────────────────────────────────────────────────────
   FALLBACK (renders while Suspense loads or if theme is unknown)
   ─────────────────────────────────────────────────────────────────────────── */
function NullBackground() {
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LIVING BACKGROUND
   ─────────────────────────────────────────────────────────────────────────── */
export default function LivingBackground() {
  const { activeTheme, isLoading } = useTheme();
  const isMobile   = useIsMobile();
  const isVisible  = useIsVisible();

  if (isLoading) return null;

  const BackgroundComponent = BACKGROUND_MAP[activeTheme] ?? NullBackground;

  // On mobile, reduce particle counts by 60%
  const particleMultiplier = isMobile ? 0.4 : 1.0;

  return (
    /* Fixed full-screen wrapper — z-index 0, pointer-events none */
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <BackgroundComponent
          paused={!isVisible}
          particleMultiplier={particleMultiplier}
        />
      </Suspense>
    </div>
  );
}
