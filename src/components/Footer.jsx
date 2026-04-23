// src/components/Footer.jsx
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────────────
   BRAND ICONS — inline SVGs
   ─────────────────────────────────────────────────────────────────────────── */

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.86-3.06.66-3.7-1.48-3.7-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.47-2.44-.28-5-1.22-5-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.24-2.57 5.16-5.02 5.43.4.34.74 1 .74 2.02 0 1.46-.01 2.64-.01 3 0 .29.2.64.76.53 4.36-1.46 7.5-5.58 7.5-10.44C23.02 5.24 18.27.5 12 .5z"/>
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
   ─────────────────────────────────────────────────────────────────────────── */

const FOOTER_LINKS = [
  { label: 'Home',     target: '#hero',     type: 'anchor' },
  { label: 'About',    target: '#about',    type: 'anchor' },
  { label: 'Skills',   target: '#skills',   type: 'anchor' },
  { label: 'Projects', target: '#projects', type: 'anchor' },
  { label: 'Blog',     target: '/blog',     type: 'route'  },
  { label: 'Contact',  target: '#contact',  type: 'anchor' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub',   href: 'https://github.com/jeme-beseka',      Icon: GithubIcon   },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/jemebeseka', Icon: LinkedinIcon },
  { label: 'Twitter',  href: 'https://x.com/king_jaysheval',     Icon: TwitterIcon  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
   ─────────────────────────────────────────────────────────────────────────── */

export default function Footer() {
  const { isDark } = useTheme();

  const handleAnchorClick = useCallback((e, link) => {
    if (link.type === 'route') return;
    e.preventDefault();
    const el = document.getElementById(link.target.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <footer
      style={{
        position: 'relative',
        marginTop: '96px',
        background: 'color-mix(in srgb, var(--color-bg-dark) 88%, var(--color-primary) 12%)',
        color: 'var(--mode-text)',
        borderTop: '1px solid rgba(var(--color-primary-rgb), 0.25)',
        boxShadow: '0 -1px 30px rgba(var(--color-primary-rgb), 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(var(--color-primary-rgb), 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Glow top-center blob */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '180px',
          background: 'radial-gradient(ellipse, rgba(var(--color-primary-rgb), 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '56px 32px 0',
        }}
      >
        {/* Top section: 3 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* ── Col 1: Brand ─────────────────────────────────────────── */}
          <div>
            {/* Hex + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <svg width="36" height="36" viewBox="0 0 44 44">
                <defs>
                  <linearGradient id="footer-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-accent)" />
                  </linearGradient>
                </defs>
                <polygon
                  points="22,2 40,12 40,32 22,42 4,32 4,12"
                  fill="rgba(var(--color-primary-rgb), 0.08)"
                  stroke="url(#footer-hex-grad)"
                  strokeWidth="1.8"
                />
                <text
                  x="22" y="27"
                  textAnchor="middle"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="700"
                  fontSize="13"
                  fill="var(--color-primary)"
                >
                  JB
                </text>
              </svg>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--color-primary)',
                  textShadow: '0 0 16px var(--color-glow)',
                  letterSpacing: '0.02em',
                }}
              >
                Jeme Beseka
              </h3>
            </div>

            <p
              style={{
                margin: '0 0 20px',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                color: 'var(--mode-text-muted)',
                maxWidth: '220px',
              }}
            >
              Building the future,<br />one line at a time.
            </p>

            {/* Social icons below tagline */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
                    background: 'rgba(var(--color-primary-rgb), 0.05)',
                    color: 'var(--mode-text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color       = 'var(--color-primary)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.background  = 'rgba(var(--color-primary-rgb), 0.12)';
                    e.currentTarget.style.boxShadow   = '0 0 16px var(--color-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color       = 'var(--mode-text-muted)';
                    e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.2)';
                    e.currentTarget.style.background  = 'rgba(var(--color-primary-rgb), 0.05)';
                    e.currentTarget.style.boxShadow   = 'none';
                  }}
                >
                  <Icon width={16} height={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Navigation ────────────────────────────────────── */}
          <div>
            <h4
              style={{
                margin: '0 0 20px',
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--color-primary)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Navigate
            </h4>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px 24px',
              }}
            >
              {FOOTER_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.target}
                    onClick={(e) => handleAnchorClick(e, link)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem',
                      color: 'var(--mode-text-muted)',
                      textDecoration: 'none',
                      padding: '5px 0',
                      transition: 'color 0.2s',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--mode-text-muted)'; }}
                  >
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        opacity: 0.5,
                        flexShrink: 0,
                      }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Connect ───────────────────────────────────────── */}
          <div>
            <h4
              style={{
                margin: '0 0 20px',
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--color-primary)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Connect
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--mode-text-muted)',
                    textDecoration: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: 'color 0.2s',
                    padding: '4px 0',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--mode-text-muted)'; }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: 'rgba(var(--color-primary-rgb), 0.08)',
                      border: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon width={14} height={14} />
                  </span>
                  {label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div
          style={{
            margin: '40px 0 0',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(var(--color-primary-rgb), 0.3) 30%, rgba(var(--color-primary-rgb), 0.3) 70%, transparent)',
          }}
        />

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px 0 24px',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--mode-text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.04em',
            }}
          >
            Jeme Beseka © 2025 &nbsp;·&nbsp; Built with React &amp; ☕
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.06em',
              color: 'var(--color-primary)',
              opacity: 0.75,
            }}
          >
            King jay Sheval
          </span>
        </div>
      </div>
    </footer>
  );
}