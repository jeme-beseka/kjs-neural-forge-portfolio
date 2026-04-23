// src/context/ThemeContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '../lib/supabase';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
   ─────────────────────────────────────────────────────────────────────────── */

const VALID_THEMES = [
  'cyber-blue',
  'deep-space',
  'arctic-neural',
  'matrix-green',
  'bio-circuit',
  'toxic-forge',
];

const DEFAULT_THEME = 'cyber-blue';
const DARK_MODE_KEY  = 'neural-forge-dark-mode';
const SUPABASE_TABLE = 'site_settings';
const SUPABASE_KEY   = 'active_theme';

/* ─────────────────────────────────────────────────────────────────────────────
   THEME METADATA (used by admin panel theme swatches)
   ─────────────────────────────────────────────────────────────────────────── */

export const THEME_META = {
  'cyber-blue': {
    label:       'Cyber Blue',
    primary:     '#00D4FF',
    accent:      '#7C3AED',
    description: 'Tony Stark\'s lab meets neural network — particle hyperspace, hex grid, nebula blobs',
  },
  'deep-space': {
    label:       'Deep Space',
    primary:     '#4D9FFF',
    accent:      '#FF2D78',
    description: 'Interstellar, cosmic, hot pink sparks — parallax starfield, shooting stars, aurora bands',
  },
  'arctic-neural': {
    label:       'Arctic Neural',
    primary:     '#00B4D8',
    accent:      '#90E0EF',
    description: 'Ice-cold precision, supercomputer — neural network nodes, signal pulses, frost particles',
  },
  'matrix-green': {
    label:       'Matrix Green',
    primary:     '#00FF88',
    accent:      '#00E5FF',
    description: 'Hacker terminal, raw code energy — falling character columns, edge flash effects',
  },
  'bio-circuit': {
    label:       'Bio Circuit',
    primary:     '#39FF14',
    accent:      '#ADFF2F',
    description: 'Neon circuit boards, electric lime — self-drawing PCB traces, solder dots, arc flashes',
  },
  'toxic-forge': {
    label:       'Toxic Forge',
    primary:     '#00FFC8',
    accent:      '#7FFF00',
    description: 'Radioactive teal-green, futuristic lab — plasma blobs, ripple waves, rising bubbles',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   CONTEXT
   ─────────────────────────────────────────────────────────────────────────── */

const ThemeContext = createContext(null);

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ─────────────────────────────────────────────────────────────────────────── */

function applyThemeToDOM(theme, isDark) {
  const root = document.documentElement;

  // Apply theme transition class for smooth colour changes
  root.classList.add('theme-transitioning');
  setTimeout(() => root.classList.remove('theme-transitioning'), 500);

  // Set data-theme attribute (triggers CSS variable overrides in index.css)
  root.setAttribute('data-theme', theme);

  // Set dark / light class (Tailwind darkMode: 'class')
  root.classList.toggle('dark',  isDark);
  root.classList.toggle('light', !isDark);
}

function getStoredDarkMode() {
  try {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) return stored === 'true';
  } catch { /* localStorage unavailable */ }
  // Default: respect OS preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROVIDER
   ─────────────────────────────────────────────────────────────────────────── */

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveThemeState] = useState(DEFAULT_THEME);
  const [isDark, setIsDark]               = useState(true);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);

  /* ── Fetch active theme from Supabase on mount ──────────────────────── */
  useEffect(() => {
    async function fetchTheme() {
      try {
        const { data, error: sbError } = await supabase
          .from(SUPABASE_TABLE)
          .select('value')
          .eq('key', SUPABASE_KEY)
          .single();

        if (sbError) throw sbError;

        const theme = VALID_THEMES.includes(data?.value)
          ? data.value
          : DEFAULT_THEME;

        const darkMode = getStoredDarkMode();

        setActiveThemeState(theme);
        setIsDark(darkMode);
        applyThemeToDOM(theme, darkMode);
      } catch (err) {
        console.warn('[ThemeContext] Failed to fetch theme from Supabase, using default.', err);
        setError(err.message);

        // Graceful fallback
        const darkMode = getStoredDarkMode();
        setIsDark(darkMode);
        applyThemeToDOM(DEFAULT_THEME, darkMode);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTheme();
  }, []);

  /* ── setActiveTheme — updates state, DOM, and Supabase ──────────────── */
  const setActiveTheme = useCallback(async (theme) => {
    if (!VALID_THEMES.includes(theme)) {
      console.error(`[ThemeContext] Invalid theme: "${theme}". Valid themes:`, VALID_THEMES);
      return;
    }

    // Optimistic update
    setActiveThemeState(theme);
    applyThemeToDOM(theme, isDark);

    try {
      const { error: sbError } = await supabase
        .from(SUPABASE_TABLE)
        .upsert({ key: SUPABASE_KEY, value: theme }, { onConflict: 'key' });

      if (sbError) throw sbError;
    } catch (err) {
      console.error('[ThemeContext] Failed to persist theme to Supabase:', err);
      setError(err.message);
      // Don't revert UI — the theme change is still visible locally
    }
  }, [isDark]);

  /* ── toggleDarkMode — persisted in localStorage ─────────────────────── */
  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try {
        localStorage.setItem(DARK_MODE_KEY, String(next));
      } catch { /* ignore */ }
      applyThemeToDOM(activeTheme, next);
      return next;
    });
  }, [activeTheme]);

  /* ── Context value ───────────────────────────────────────────────────── */
  const value = useMemo(() => ({
    activeTheme,
    setActiveTheme,
    isDark,
    toggleDarkMode,
    isLoading,
    error,
    validThemes: VALID_THEMES,
    themeMeta:   THEME_META,
    // Convenience colour accessors (read from CSS variables at call time)
    getPrimary: () => getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim(),
    getAccent: () => getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim(),
  }), [activeTheme, setActiveTheme, isDark, toggleDarkMode, isLoading, error]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOOK
   ─────────────────────────────────────────────────────────────────────────── */

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

export default ThemeContext;
