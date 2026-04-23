// src/components/Navbar.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme, THEME_META } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────────────
   NAV LINKS CONFIG
   ─────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Home',     target: '#hero',     type: 'anchor' },
  { label: 'About',    target: '#about',    type: 'anchor' },
  { label: 'Skills',   target: '#skills',   type: 'anchor' },
  { label: 'Projects', target: '#projects', type: 'anchor' },
  { label: 'Blog',     target: '/blog',     type: 'route'  },
  { label: 'Contact',  target: '#contact',  type: 'anchor' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HEX LOGO — 'JB' monogram inside glowing hexagon
   ─────────────────────────────────────────────────────────────────────────── */

function HexLogo({ onClick }) {
  return (
    <motion.a
      href="/#hero"
      onClick={onClick}
      aria-label="Jeme Beseka — Home"
      className="relative inline-flex items-center justify-center gap-3 group"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 44 44"
        style={{ animation: 'hex-pulse 2.8s ease-in-out infinite' }}
      >
        <defs>
          <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <polygon
          points="22,2 40,12 40,32 22,42 4,32 4,12"
          fill="rgba(var(--color-primary-rgb), 0.08)"
          stroke="url(#hex-grad)"
          strokeWidth="1.8"
        />
        <text
          x="22"
          y="27"
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="14"
          fill="var(--color-primary)"
          letterSpacing="0.5"
        >
          JB
        </text>
      </svg>

      {/* Wordmark — visible on md+ */}
      <span
        className="hidden lg:block text-sm font-semibold tracking-widest uppercase"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--color-primary)',
          letterSpacing: '0.2em',
          opacity: 0.9,
        }}
      >
        JEME<span style={{ color: 'var(--mode-text)', opacity: 0.6 }}>BESEKA</span>
      </span>

      <style>{`
        @keyframes hex-pulse {
          0%, 100% { filter: drop-shadow(0 0 5px var(--color-glow)); }
          50%      { filter: drop-shadow(0 0 14px var(--color-glow)); }
        }
      `}</style>
    </motion.a>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DARK / LIGHT TOGGLE
   ─────────────────────────────────────────────────────────────────────────── */

function ModeToggle({ isDark, toggleDarkMode }) {
  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
      style={{
        border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
        background: 'rgba(var(--color-primary-rgb), 0.06)',
        color: 'var(--color-primary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = 'rgba(var(--color-primary-rgb), 0.15)';
        e.currentTarget.style.borderColor  = 'var(--color-primary)';
        e.currentTarget.style.boxShadow    = '0 0 12px var(--color-glow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background   = 'rgba(var(--color-primary-rgb), 0.06)';
        e.currentTarget.style.borderColor  = 'rgba(var(--color-primary-rgb), 0.25)';
        e.currentTarget.style.boxShadow    = 'none';
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: 90,  opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22 }}
          >
            <Moon size={16} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90,  opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22 }}
          >
            <Sun size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
   ─────────────────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const { activeTheme, isDark, toggleDarkMode, themeMeta } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled,   setScrolled]   = useState(false);
  const [activeId,   setActiveId]   = useState('hero');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ── Scroll state ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Active section observer (only on home route) ─────────────────────── */
  useEffect(() => {
    if (!isHome) {
      setActiveId('');
      return;
    }
    const ids = NAV_LINKS.filter(l => l.type === 'anchor').map(l => l.target.slice(1));
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, location.pathname]);

  /* ── Lock body scroll while drawer open ───────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* ── Click handler (route-aware) ──────────────────────────────────────── */
  const handleNavClick = useCallback((e, link) => {
    e.preventDefault();
    setDrawerOpen(false);

    if (link.type === 'route') {
      // SPA navigation to a full route (e.g. /blog)
      navigate(link.target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Anchor link
    const id = link.target.slice(1);
    if (isHome) {
      // Already on home — just scroll
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    } else {
      // Navigate to home first, pass target via router state so Home can scroll after mount
      navigate('/', { state: { scrollTo: id } });
    }
  }, [isHome, navigate]);

  /* ── Logo click: behaves like the Home anchor link ─────────────────────── */
  const handleLogoClick = useCallback((e) => {
    handleNavClick(e, { type: 'anchor', target: '#hero' });
  }, [handleNavClick]);

  const isLinkActive = (link) => {
    if (link.type === 'route') return location.pathname.startsWith(link.target);
    return isHome && link.target === `#${activeId}`;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
          background: scrolled
            ? 'rgba(var(--color-bg-dark-rgb, 8, 18, 30), 0.82)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(1.4)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(var(--color-primary-rgb), 0.18)'
            : '1px solid transparent',
          boxShadow: scrolled
            ? '0 4px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(var(--color-primary-rgb), 0.1)'
            : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <HexLogo onClick={handleLogoClick} />

          {/* Desktop links — pill container */}
          <ul
            className="hidden md:flex items-center"
            style={{
              gap: '2px',
              background: 'rgba(var(--color-primary-rgb), 0.04)',
              borderRadius: '100px',
              padding: '4px',
              border: '1px solid rgba(var(--color-primary-rgb), 0.1)',
            }}
          >
            {NAV_LINKS.map(link => {
              const active = isLinkActive(link);
              return (
                <li key={link.label}>
                  <a
                    href={link.target}
                    onClick={(e) => handleNavClick(e, link)}
                    style={{
                      position: 'relative',
                      display: 'block',
                      padding: '6px 16px',
                      borderRadius: '100px',
                      fontSize: '0.82rem',
                      fontWeight: active ? 600 : 500,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '0.02em',
                      textDecoration: 'none',
                      color: active ? 'var(--color-primary)' : 'var(--mode-text)',
                      background: active
                        ? 'rgba(var(--color-primary-rgb), 0.14)'
                        : 'transparent',
                      boxShadow: active
                        ? 'inset 0 0 12px rgba(var(--color-primary-rgb), 0.08), 0 0 10px rgba(var(--color-primary-rgb), 0.15)'
                        : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color      = 'var(--color-primary)';
                        e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.07)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color      = 'var(--mode-text)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        style={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '16px',
                          height: '2px',
                          borderRadius: '2px',
                          background: 'var(--color-primary)',
                          boxShadow: '0 0 6px var(--color-glow)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ModeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />

            <button
              className="md:hidden"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
                background: 'rgba(var(--color-primary-rgb), 0.06)',
                color: 'var(--color-primary)',
                cursor: 'pointer',
              }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setDrawerOpen(false)}
            />

            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{    x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 70,
                width: '80%',
                maxWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                background: 'color-mix(in srgb, var(--color-bg-dark) 90%, var(--color-primary) 10%)',
                borderLeft: '1px solid rgba(var(--color-primary-rgb), 0.2)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
              }}
            >
              {/* Drawer header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  height: '64px',
                  borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-primary)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Neural Forge
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(var(--color-primary-rgb), 0.1)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                  }}
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer links */}
              <ul style={{ flex: 1, padding: '16px 12px', listStyle: 'none', margin: 0 }}>
                {NAV_LINKS.map((link, i) => {
                  const active = isLinkActive(link);
                  return (
                    <motion.li
                      key={link.label}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                    >
                      <a
                        href={link.target}
                        onClick={(e) => handleNavClick(e, link)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontWeight: active ? 600 : 400,
                          fontFamily: "'Space Grotesk', sans-serif",
                          textDecoration: 'none',
                          color: active ? 'var(--color-primary)' : 'var(--mode-text)',
                          background: active ? 'rgba(var(--color-primary-rgb), 0.12)' : 'transparent',
                          borderLeft: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                          marginBottom: '4px',
                          transition: 'all 0.2s',
                        }}
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Drawer footer */}
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    color: 'var(--mode-text-muted)',
                    fontSize: '0.75rem',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {themeMeta?.[activeTheme]?.label ?? activeTheme} · {isDark ? 'Dark' : 'Light'}
                </span>
                <ModeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}