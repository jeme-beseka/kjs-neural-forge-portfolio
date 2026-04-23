// src/pages/BlogPost.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Calendar, Copy, Check, User, Tag, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

// Inline X/Twitter logo (lucide-react removed the `Twitter` icon)
const TwitterIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2H21.5l-7.19 8.21L23 22h-6.77l-5.3-6.93L4.86 22H1.6l7.69-8.78L1 2h6.91l4.79 6.33L18.244 2zm-1.186 18h1.87L7.03 4H5.05l12.008 16z" />
  </svg>
);

// ─────────────────────────────────────────────
// Theme colors
// ─────────────────────────────────────────────
const THEME_COLORS = {
  "cyber-blue":    { primary: "#00D4FF", accent: "#7C3AED" },
  "deep-space":    { primary: "#4D9FFF", accent: "#FF2D78" },
  "arctic-neural": { primary: "#00B4D8", accent: "#90E0EF" },
  "matrix-green":  { primary: "#00FF88", accent: "#00E5FF" },
  "bio-circuit":   { primary: "#39FF14", accent: "#ADFF2F" },
  "toxic-forge":   { primary: "#00FFC8", accent: "#7FFF00" },
};
const getColors = (t) => THEME_COLORS[t] || THEME_COLORS["cyber-blue"];

// ─────────────────────────────────────────────
// Seed post (used if fetching fails or by ID)
// ─────────────────────────────────────────────
const SEED_POST = {
  id: "seed-1",
  title: "Building a Futuristic Portfolio with React Three Fiber",
  excerpt: "How I combined React Three Fiber, Framer Motion, and Supabase to create an animated, theme-switching developer portfolio that feels alive.",
  cover_image: null,
  type: "internal",
  tags: ["React", "Three.js", "Framer Motion", "Portfolio"],
  published: true,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  content: `# Building a Futuristic Portfolio with React Three Fiber

When I set out to build my portfolio, I didn't want the typical static page with a hero image and a grid of projects. I wanted something that *breathed* — a site that felt like stepping into a command center.

## Why React Three Fiber?

React Three Fiber (R3F) is a React renderer for Three.js. It lets you declare 3D scenes using JSX, which means you get all the power of Three.js with the ergonomics of React. For a portfolio, this opens up incredible possibilities: rotating 3D meshes, particle systems, and shader-based effects — all driven by component state.

The library sits on top of Three.js, so anything you can do in Three.js you can do in R3F. But instead of imperative scene management, you write:

\`\`\`jsx
<Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
  <ambientLight intensity={0.3} />
  <pointLight position={[4, 4, 4]} color="#00D4FF" />
  <mesh rotation={[0, time * 0.2, 0]}>
    <icosahedronGeometry args={[2, 1]} />
    <meshBasicMaterial color="#00D4FF" wireframe />
  </mesh>
</Canvas>
\`\`\`

It's declarative, reactive, and integrates cleanly with Framer Motion for hybrid 2D/3D animations.

## The Theme System

One of the core design decisions was making the portfolio **theme-switchable in real time**, with each theme having its own living background animation. I built six themes total, each with a distinct color palette and ambient canvas animation.

The active theme is stored in Supabase, so when I change it from the admin panel, it applies globally for every visitor instantly — no rebuild required.

\`\`\`javascript
// ThemeContext.jsx — simplified
export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState("cyber-blue");

  const applyTheme = async (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    await supabase
      .from("site_settings")
      .upsert({ key: "active_theme", value: theme });
    setActiveTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

## Living Backgrounds

Each theme's background is a full-screen canvas component that renders behind all content using \`pointer-events: none\`. The animations are paused using the Page Visibility API when the tab is inactive, and particle counts are reduced by 60% on mobile.

> The key insight here: backgrounds should be **atmospheric, not distracting**. Think 10–20% opacity on particles, slightly blurred, so the foreground content always remains the star.

### The Six Background Types

| Theme | Animation |
|-------|-----------|
| Cyber Blue | Particle hyperspace + hexagonal grid |
| Deep Space | Parallax starfield + shooting stars |
| Arctic Neural | Neural network with signal pulses |
| Matrix Green | Falling character rain columns |
| Bio Circuit | Self-drawing PCB traces |
| Toxic Forge | Morphing plasma blobs |

## 3D Hero Shapes

Each theme maps to a distinct Three.js geometry in the hero section:

- **Cyber Blue** → Icosahedron wireframe with inner glow
- **Matrix Green** → Wireframe globe with rotating meridian rings
- **Toxic Forge** → Torus knot with animated emissive intensity

The shapes auto-rotate using \`useFrame\` and respond to the theme's primary color via emissive material properties.

## Performance Considerations

Building this taught me a lot about React + Canvas performance:

1. **Always \`useMemo\` for geometries** — recreating BufferGeometry every render causes noticeable frame drops
2. **\`useSpring\` for 3D tilt** — Framer Motion's spring physics feel significantly better than linear CSS transitions
3. **Page Visibility API** — pausing \`requestAnimationFrame\` loops when the tab is hidden saves real battery and CPU

\`\`\`javascript
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) cancelAnimationFrame(rafRef.current);
    else startAnimation();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);
\`\`\`

## What's Next

I'm planning to add a shader-based distortion effect to the Toxic Forge theme, and a proper blog system — which you're reading right now. The admin panel makes it trivial to add new content without touching any code.

If you're building something similar, the React Three Fiber documentation is excellent, and the community on Discord is genuinely helpful. Go for it.`,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function readTime(content) {
  if (!content) return 1;
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const TAG_PALETTE = [
  { bg: "rgba(0,212,255,0.12)",  border: "rgba(0,212,255,0.3)",  text: "#00D4FF" },
  { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)", text: "#a78bfa" },
  { bg: "rgba(0,255,136,0.12)",  border: "rgba(0,255,136,0.3)",  text: "#00FF88" },
  { bg: "rgba(255,45,120,0.12)", border: "rgba(255,45,120,0.3)", text: "#FF6B9D" },
];
const tagStyle = (i) => TAG_PALETTE[i % TAG_PALETTE.length];

// ─────────────────────────────────────────────
// Reading progress bar (fixed bottom)
// ─────────────────────────────────────────────
function ReadingProgress({ colors }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 3, background: "rgba(255,255,255,0.08)",
    }}>
      <motion.div
        style={{
          height: "100%",
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
          boxShadow: `0 0 8px ${colors.primary}88`,
        }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Table of Contents
// ─────────────────────────────────────────────
function extractHeadings(content) {
  if (!content) return [];
  const lines = content.split("\n");
  const headings = [];
  lines.forEach((line, i) => {
    const m2 = line.match(/^##\s+(.+)/);
    const m3 = line.match(/^###\s+(.+)/);
    if (m2) {
      const text = m2[1].trim();
      headings.push({ level: 2, text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    } else if (m3) {
      const text = m3[1].trim();
      headings.push({ level: 3, text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    }
  });
  return headings;
}

function TableOfContents({ headings, colors, isDark, activeId }) {
  if (headings.length === 0) return null;

  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{
      position: "sticky", top: "6rem",
      padding: "1.25rem",
      borderRadius: "0.75rem",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        fontSize: "0.68rem", fontFamily: "monospace", letterSpacing: "0.15em",
        textTransform: "uppercase", color: colors.primary, marginBottom: "0.875rem",
      }}>
        // Contents
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={e => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 6,
              padding: "0.3rem 0.5rem",
              borderRadius: "0.35rem",
              paddingLeft: h.level === 3 ? "1.25rem" : "0.5rem",
              textDecoration: "none",
              fontSize: h.level === 3 ? "0.75rem" : "0.8rem",
              fontWeight: activeId === h.id ? 600 : 400,
              color: activeId === h.id ? colors.primary : textColor,
              background: activeId === h.id ? `${colors.primary}12` : "transparent",
              borderLeft: activeId === h.id ? `2px solid ${colors.primary}` : "2px solid transparent",
              transition: "all 0.18s",
              lineHeight: 1.4,
            }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────
// Markdown renderers
// ─────────────────────────────────────────────
function buildRenderers(colors, isDark) {
  const textPrimary  = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const codeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const codeBlockBg = isDark ? "#0d1117" : "#f6f8fa";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return {
    h1: ({ children }) => (
      <h1 id={String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
        style={{
          fontSize: "2rem", fontWeight: 900, margin: "2.5rem 0 1rem",
          color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.03em", lineHeight: 1.15,
          borderBottom: `2px solid ${colors.primary}44`, paddingBottom: "0.5rem",
        }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        <h2 id={id} style={{
          fontSize: "1.5rem", fontWeight: 800, margin: "2.25rem 0 0.875rem",
          color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          <span style={{ color: colors.primary, marginRight: "0.4rem", opacity: 0.6, fontWeight: 400 }}>#</span>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        <h3 id={id} style={{
          fontSize: "1.15rem", fontWeight: 700, margin: "1.75rem 0 0.6rem",
          color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
        }}>
          <span style={{ color: colors.accent, marginRight: "0.35rem", opacity: 0.6, fontWeight: 400 }}>##</span>
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p style={{ fontSize: "1rem", lineHeight: 1.85, color: textPrimary, margin: "0 0 1.25rem", }}>
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: `3px solid ${colors.accent}`,
        margin: "1.75rem 0", padding: "1rem 1.25rem",
        background: `${colors.accent}0c`,
        borderRadius: "0 0.5rem 0.5rem 0",
      }}>
        <div style={{ color: textSecondary, fontStyle: "italic", lineHeight: 1.7, fontSize: "0.97rem" }}>
          {children}
        </div>
      </blockquote>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: "0.85em", padding: "2px 6px", borderRadius: "4px",
            background: codeBg,
            border: `1px solid ${borderColor}`,
            color: colors.primary,
          }}>
            {children}
          </code>
        );
      }
      return (
        <pre style={{
          background: codeBlockBg, borderRadius: "0.625rem", padding: "1.25rem 1.5rem",
          overflowX: "auto", margin: "1.5rem 0",
          border: `1px solid ${isDark ? colors.primary + "22" : "rgba(0,0,0,0.1)"}`,
          boxShadow: isDark ? `0 0 20px ${colors.primary}0a` : "0 2px 12px rgba(0,0,0,0.08)",
        }}>
          <code style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: "0.85rem", lineHeight: 1.75,
            color: isDark ? "#e2e8f0" : "#1e293b",
          }}>
            {children}
          </code>
        </pre>
      );
    },
    ul: ({ children }) => (
      <ul style={{ margin: "0.75rem 0 1.25rem", paddingLeft: "1.5rem", color: textPrimary }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ margin: "0.75rem 0 1.25rem", paddingLeft: "1.5rem", color: textPrimary }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ fontSize: "1rem", lineHeight: 1.8, marginBottom: "0.35rem", color: textPrimary }}>
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: textPrimary }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em style={{ color: textSecondary, fontStyle: "italic" }}>
        {children}
      </em>
    ),
    hr: () => (
      <hr style={{
        border: "none", borderTop: `1px solid ${borderColor}`, margin: "2.5rem 0",
      }} />
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{
        color: colors.primary, textDecoration: "underline",
        textDecorationColor: `${colors.primary}55`, textUnderlineOffset: "3px",
        transition: "color 0.18s",
      }}>
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse",
          fontSize: "0.9rem", color: textPrimary,
        }}>
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th style={{
        padding: "0.6rem 1rem", textAlign: "left",
        background: `${colors.primary}14`,
        border: `1px solid ${colors.primary}22`,
        fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em",
        color: colors.primary,
      }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{
        padding: "0.6rem 1rem",
        border: `1px solid ${borderColor}`,
        lineHeight: 1.6,
      }}>
        {children}
      </td>
    ),
  };
}

// ─────────────────────────────────────────────
// Cover image / placeholder
// ─────────────────────────────────────────────
function CoverImage({ post, colors }) {
  if (post.cover_image) {
    return (
      <img src={post.cover_image} alt={post.title}
        style={{ width: "100%", height: 360, objectFit: "cover", display: "block", borderRadius: "0.875rem" }} />
    );
  }
  return (
    <div style={{
      width: "100%", height: 300, borderRadius: "0.875rem",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${colors.primary}14, ${colors.accent}14)`,
      border: `1px solid ${colors.primary}22`, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.primary}1A 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}1A 1px, transparent 1px)`,
        backgroundSize: "36px 36px",
      }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900,
          color: colors.primary, opacity: 0.35,
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em",
          maxWidth: 500, padding: "0 2rem", lineHeight: 1.3,
        }}>
          {post.title}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Author card
// ─────────────────────────────────────────────
function AuthorCard({ colors, isDark }) {
  const textPrimary  = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{
      borderRadius: "0.875rem", padding: "1.5rem",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", gap: "1.25rem",
    }}>
      {/* Avatar */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${colors.primary}55`,
        boxShadow: `0 0 16px ${colors.primary}33`,
        fontSize: "1.25rem", fontWeight: 900, color: "#fff",
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        JB
      </div>
      <div>
        <div style={{
          fontSize: "1rem", fontWeight: 700, color: textPrimary,
          fontFamily: "'Space Grotesk', sans-serif", marginBottom: "0.25rem",
        }}>
          Jeme Beseka
        </div>
        <div style={{ fontSize: "0.82rem", color: textSecondary, lineHeight: 1.5 }}>
          Software Developer building futuristic web experiences, desktop tools, and data visualisation apps.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Share buttons
// ─────────────────────────────────────────────
function ShareButtons({ title, colors, isDark }) {
  const [copied, setCopied] = useState(false);
  const textColor = isDark ? "#94a3b8" : "#64748b";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const tweetShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const btnBase = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "0.5rem 1.1rem", borderRadius: "0.45rem",
    fontSize: "0.82rem", fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer",
    transition: "all 0.2s",
  };

  return (
    <div>
      <div style={{
        fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.15em",
        textTransform: "uppercase", color: textColor, marginBottom: "0.75rem",
      }}>
        Share this article
      </div>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <button
          onClick={copyLink}
          style={{
            ...btnBase,
            background: copied ? `${colors.primary}20` : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${copied ? colors.primary + "55" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            color: copied ? colors.primary : textColor,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={tweetShare}
          style={{
            ...btnBase,
            background: "rgba(29,161,242,0.12)",
            border: "1px solid rgba(29,161,242,0.3)",
            color: "#1DA1F2",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(29,161,242,0.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(29,161,242,0.12)"; }}
        >
          <TwitterIcon size={13} /> Share on Twitter
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BlogPost page
// ─────────────────────────────────────────────
export default function BlogPost({ activeTheme = "cyber-blue", isDark = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const colors = getColors(activeTheme);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHeadingId, setActiveHeadingId] = useState("");

  const textPrimary   = isDark ? "#f1f5f9"  : "#0f172a";
  const textSecondary = isDark ? "#94a3b8"  : "#64748b";
  const pageBg        = isDark ? "#0a0a14"  : "#f0f4ff";
  const borderColor   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Fetch post
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      // Use seed post if id matches
      if (id && id.startsWith("seed-")) {
        const seeds = [SEED_POST];
        const found = seeds.find(s => s.id === id);
        setPost(found || SEED_POST);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .eq("published", true)
          .single();
        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.warn("[BlogPost] Falling back to seed post:", err.message);
        setPost(SEED_POST);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Active heading tracker
  useEffect(() => {
    if (!post) return;
    const headings = extractHeadings(post.content);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveHeadingId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [post]);

  const headings = post ? extractHeadings(post.content) : [];
  const renderers = post ? buildRenderers(colors, isDark) : {};

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: pageBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: `3px solid ${colors.primary}33`,
              borderTop: `3px solid ${colors.primary}`,
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: textSecondary, fontFamily: "monospace", fontSize: "0.8rem" }}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: textSecondary, marginBottom: "1rem" }}>Article not found.</p>
          <Link to="/blog" style={{ color: colors.primary, textDecoration: "none" }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const rt = readTime(post.content);

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <ReadingProgress colors={colors} />

      {/* Back button */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "calc(64px + 1.5rem) 1.5rem 0" }}>
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate("/blog")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.45rem 1rem", borderRadius: "0.45rem",
            background: "transparent",
            border: `1px solid ${borderColor}`,
            color: textSecondary, fontSize: "0.82rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = colors.primary; e.currentTarget.style.borderColor = colors.primary + "55"; }}
          onMouseLeave={e => { e.currentTarget.style.color = textSecondary; e.currentTarget.style.borderColor = borderColor; }}
        >
          <ArrowLeft size={14} /> Back to Blog
        </motion.button>
      </div>

      {/* Main layout: article + ToC sidebar */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 6rem",
        display: "grid",
        gridTemplateColumns: "1fr min(340px, 28%)",
        gap: "3rem",
        alignItems: "start",
      }}>

        {/* ── Article ── */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ minWidth: 0 }}
        >
          {/* Cover */}
          <div style={{ marginBottom: "2rem" }}>
            <CoverImage post={post} colors={colors} />
          </div>

          {/* Meta */}
          <div style={{ marginBottom: "2rem" }}>
            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
              {(post.tags || []).map((tag, i) => {
                const tc = tagStyle(i);
                return (
                  <span key={tag} style={{
                    padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem",
                    fontWeight: 600, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 900,
              color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 1rem",
            }}>
              {post.title}
            </h1>

            {/* Date + read time */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: textSecondary }}>
                <Calendar size={13} style={{ color: colors.primary, opacity: 0.7 }} />
                {formatDate(post.created_at)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: textSecondary }}>
                <Clock size={13} style={{ color: colors.primary, opacity: 0.7 }} />
                {rt} min read
              </span>
            </div>
          </div>

          {/* Article divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${colors.primary}55, transparent)`, marginBottom: "2.5rem" }} />

          {/* Markdown content */}
          <div style={{ lineHeight: 1.85 }}>
            <ReactMarkdown components={renderers}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Bottom divider */}
          <div style={{ height: 1, background: borderColor, margin: "3rem 0" }} />

          {/* Share */}
          <div style={{ marginBottom: "2rem" }}>
            <ShareButtons title={post.title} colors={colors} isDark={isDark} />
          </div>

          {/* Author */}
          <AuthorCard colors={colors} isDark={isDark} />
        </motion.main>

        {/* ── ToC Sidebar (desktop only) ── */}
        <aside style={{ display: "block" }} className="toc-sidebar">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TableOfContents
              headings={headings}
              colors={colors}
              isDark={isDark}
              activeId={activeHeadingId}
            />
          </motion.div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .toc-sidebar { display: none !important; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
