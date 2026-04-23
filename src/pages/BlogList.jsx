// src/pages/BlogList.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ExternalLink, Tag, BookOpen, ArrowRight, Rss } from "lucide-react";
import { supabase } from "../lib/supabase";

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
// Seed / dummy article (shown when DB is empty)
// ─────────────────────────────────────────────
const SEED_POSTS = [
  {
    id: "seed-1",
    title: "Building a Futuristic Portfolio with React Three Fiber",
    excerpt:
      "How I combined React Three Fiber, Framer Motion, and Supabase to create an animated, theme-switching developer portfolio that feels alive — and what I learned along the way.",
    cover_image: null,
    type: "internal",
    external_url: null,
    tags: ["React", "Three.js", "Framer Motion", "Portfolio"],
    published: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Building a Futuristic Portfolio with React Three Fiber

When I set out to build my portfolio, I didn't want the typical static page with a hero image and a grid of projects. I wanted something that *breathed* — a site that felt like stepping into a command center.

## Why React Three Fiber?

React Three Fiber (R3F) is a React renderer for Three.js. It lets you declare 3D scenes using JSX, which means you get all the power of Three.js with the ergonomics of React. For a portfolio, this opens up incredible possibilities: rotating 3D meshes, particle systems, and shader-based effects — all driven by component state.

## The Theme System

One of the core design decisions was making the portfolio **theme-switchable in real time**, with each theme having its own living background animation. I built six themes total, each with a distinct color palette and a unique ambient canvas animation.

The active theme is stored in Supabase, so when I change it from the admin panel, it applies globally for every visitor instantly.

\`\`\`javascript
// ThemeContext.jsx — simplified
const ThemeContext = createContext();

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

Each theme's background is a full-screen canvas component that renders behind all content using \`pointer-events: none\`. The animations are paused using the Page Visibility API when the tab is not active, and throttled on mobile.

> The key insight: backgrounds should be atmospheric, not distracting. Think 10–20% opacity on particles, and always blur them slightly so the foreground content remains the star.

## 3D Hero Shapes

Each theme maps to a distinct Three.js geometry:

- **Cyber Blue** → Icosahedron wireframe with inner glow
- **Matrix Green** → Wireframe globe with rotating meridian rings
- **Toxic Forge** → Torus knot with animated emissive intensity

The shapes auto-rotate using \`useFrame\` and respond to the theme's primary color via emissive material properties.

## What I Learned

Building this portfolio taught me a lot about performance in React with heavy canvas elements. A few key takeaways:

1. Always use \`useMemo\` for Three.js geometries — recreating them every render is expensive
2. \`useSpring\` from Framer Motion is perfect for smooth 3D tilt effects on cards
3. Supabase's real-time subscriptions are perfect for live theme switching

## What's Next

I'm planning to add a shader-based distortion effect to the Toxic Forge theme, and a proper blog system (which you're reading right now). The admin panel makes it trivial to add new content without touching any code.

If you're thinking about building something similar, go for it. The React Three Fiber documentation is excellent, and the community is incredibly helpful.`,
  },
  {
    id: "seed-2",
    title: "King Data Visualizer: Lessons from Building a Desktop App",
    excerpt:
      "Reflections on building a cross-platform desktop data visualization tool with 9+ chart types, CSV/Excel support, and a Windows .exe — and why I chose Java.",
    cover_image: null,
    type: "internal",
    external_url: null,
    tags: ["Java", "Desktop", "Data Viz", "Charts"],
    published: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# King Data Visualizer: Lessons from Building a Desktop App

Most developers default to web apps. I did too — until I needed a tool that could handle large Excel files offline, render charts instantly, and run on a client's locked-down Windows machine with no internet access.

## Why a Desktop App?

The requirements were clear: offline-first, fast file handling, and distributable as a single .exe with no installer dependencies. A web app wasn't the right tool. Java + Swing/JavaFX was.

## Chart Types Supported

King Data Visualizer ships with 9+ chart types out of the box, including bar, line, pie, scatter, area, radar, bubble, histogram, and candlestick charts.

## The Architecture

The app is built around a data model that supports both manual entry and file imports. When a user imports a CSV or Excel file, the data is parsed into a unified table structure that any chart type can consume.

\`\`\`java
public class DataTable {
  private final List<String> headers;
  private final List<List<Object>> rows;

  public DataTable(List<String> headers) {
    this.headers = headers;
    this.rows = new ArrayList<>();
  }

  public void addRow(List<Object> row) {
    if (row.size() != headers.size())
      throw new IllegalArgumentException("Row size mismatch");
    rows.add(row);
  }
}
\`\`\`

## Distribution

Packaging a Java app as a Windows .exe without requiring the JRE to be pre-installed is non-trivial. The solution was using **jpackage** (bundled with JDK 14+) to create a self-contained installer.

> The final .exe includes a bundled JRE, so users never have to install anything separately.

## What I'd Do Differently

If I were building this today, I might consider Electron + D3.js for the charting layer — the web ecosystem has better chart libraries. But Java's performance with large datasets is genuinely hard to beat.`,
  },
  {
    id: "seed-3",
    title: "My Journey into Web Scraping with Jina AI",
    excerpt:
      "Building KJS News taught me everything I needed to know about ethical web scraping, Jina AI's Reader API, and how to present scraped content responsibly.",
    cover_image: null,
    type: "internal",
    external_url: null,
    tags: ["Web Scraping", "Jina AI", "React", "News"],
    published: true,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# My Journey into Web Scraping with Jina AI

Building KJS News was my first serious dive into web scraping at scale. The goal: aggregate news from multiple sources, show source attribution prominently, and offer a clean reading experience without the clutter of ads and pop-ups.

## The Jina AI Reader API

Jina AI's Reader API is a game-changer for content extraction. You prefix any URL with \`https://r.jina.ai/\` and it returns clean, structured markdown of the article content. No parsing HTML, no dealing with paywalls, no fighting JavaScript-rendered content.

\`\`\`javascript
const fetchArticleContent = async (url) => {
  const jinaUrl = \`https://r.jina.ai/\${url}\`;
  const response = await fetch(jinaUrl, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json();
  return data.data.content; // Clean markdown
};
\`\`\`

## Read Mode vs Embed Mode

KJS News offers two reading experiences:

- **Read Mode**: Uses Jina AI to extract the article content and renders it in a clean modal
- **Embed Mode**: Loads the original URL in an iFrame

> Always show where content comes from. Every article in KJS News links directly back to the original source. Transparency is not optional.

## What's Next for KJS News

I'm planning to add user accounts, saved articles, and personalised news feeds. The Vercel deployment has been rock-solid so far.`,
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function readTime(content) {
  if (!content) return 1;
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const TAG_PALETTE = [
  { bg: "rgba(0,212,255,0.12)",  border: "rgba(0,212,255,0.3)",  text: "#00D4FF" },
  { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)", text: "#a78bfa" },
  { bg: "rgba(0,255,136,0.12)",  border: "rgba(0,255,136,0.3)",  text: "#00FF88" },
  { bg: "rgba(255,45,120,0.12)", border: "rgba(255,45,120,0.3)", text: "#FF6B9D" },
];
const tagStyle = (i) => TAG_PALETTE[i % TAG_PALETTE.length];

// ─────────────────────────────────────────────
// Animated hero grid background
// ─────────────────────────────────────────────
function HeroBg({ colors }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.primary}18 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}18 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />
      {/* Glow orbs */}
      {[
        { x: "20%", y: "30%", c: colors.primary },
        { x: "80%", y: "60%", c: colors.accent },
        { x: "50%", y: "80%", c: colors.primary },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute", left: orb.x, top: orb.y,
            width: 300, height: 300, borderRadius: "50%",
            background: orb.c,
            filter: "blur(80px)",
            opacity: 0.07,
            transform: "translate(-50%, -50%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 4 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton card
// ─────────────────────────────────────────────
function SkeletonCard({ isDark }) {
  const s = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  return (
    <div style={{
      borderRadius: "0.875rem",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      overflow: "hidden",
      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
    }}>
      <div style={{ height: 180, background: s, animation: "blog-shimmer 1.6s infinite" }} />
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ height: 10, width: "40%", borderRadius: 6, background: s, animation: "blog-shimmer 1.6s infinite" }} />
        <div style={{ height: 18, borderRadius: 6, background: s, animation: "blog-shimmer 1.6s infinite" }} />
        <div style={{ height: 12, borderRadius: 6, background: s, width: "85%", animation: "blog-shimmer 1.6s infinite" }} />
        <div style={{ height: 12, borderRadius: 6, background: s, width: "70%", animation: "blog-shimmer 1.6s infinite" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {[50, 60, 45].map((w, i) => (
            <div key={i} style={{ height: 20, width: w, borderRadius: 9999, background: s, animation: "blog-shimmer 1.6s infinite" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Cover image / placeholder
// ─────────────────────────────────────────────
function CoverPlaceholder({ post, colors, height = 200 }) {
  if (post.cover_image) {
    return (
      <img src={post.cover_image} alt={post.title}
        style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
    );
  }
  const initials = post.title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${colors.primary}14, ${colors.accent}14)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.primary}20 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}20 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <BookOpen size={28} style={{ color: colors.primary, opacity: 0.4, marginBottom: 6 }} />
        <div style={{ fontSize: "0.65rem", fontFamily: "monospace", color: colors.primary, opacity: 0.5, letterSpacing: "0.15em" }}>
          ARTICLE
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Blog Card
// ─────────────────────────────────────────────
function BlogCard({ post, colors, isDark, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isExternal = post.type === "external";
  const rt = readTime(post.content);
  const glassBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const textPrimary  = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(post)}
      style={{
        borderRadius: "0.875rem",
        border: `1px solid ${hovered ? colors.primary + "55" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"}`,
        background: glassBg,
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
        boxShadow: hovered ? `0 0 28px ${colors.primary}22, 0 12px 40px rgba(0,0,0,0.2)` : "0 4px 20px rgba(0,0,0,0.12)",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative" }}>
        <CoverPlaceholder post={post} colors={colors} height={190} />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent 50%, ${isDark ? "rgba(10,10,20,0.8)" : "rgba(248,250,252,0.8)"} 100%)`,
        }} />
        {/* External badge */}
        {isExternal && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 9999, fontSize: "0.68rem",
            fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.08em",
            background: "rgba(255,107,53,0.25)", border: "1px solid rgba(255,107,53,0.5)",
            color: "#FF6B35",
          }}>
            <ExternalLink size={9} /> External
          </div>
        )}
        {/* Read time chip */}
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          color: "rgba(255,255,255,0.8)", fontSize: "0.65rem", fontFamily: "monospace",
        }}>
          <Clock size={9} /> {rt} min read
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
        {/* Date */}
        <time style={{ fontSize: "0.7rem", color: colors.primary, fontFamily: "monospace", letterSpacing: "0.08em" }}>
          {formatDate(post.created_at)}
        </time>

        {/* Title */}
        <h3 style={{
          fontSize: "1rem", fontWeight: 700, margin: 0,
          color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.01em", lineHeight: 1.35,
        }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontSize: "0.82rem", color: textSecondary, margin: 0, lineHeight: 1.65,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {post.excerpt}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "auto", paddingTop: "0.4rem" }}>
          {(post.tags || []).slice(0, 3).map((tag, i) => {
            const tc = tagStyle(i);
            return (
              <span key={tag} onClick={e => { e.stopPropagation(); }} style={{
                padding: "2px 8px", borderRadius: 9999, fontSize: "0.67rem",
                fontWeight: 600, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
              }}>
                {tag}
              </span>
            );
          })}
          {(post.tags || []).length > 3 && (
            <span style={{ fontSize: "0.67rem", color: textSecondary, padding: "2px 4px" }}>+{post.tags.length - 3}</span>
          )}
        </div>

        {/* CTA row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "0.5rem", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          marginTop: "0.25rem",
        }}>
          <span style={{
            fontSize: "0.76rem", fontWeight: 600, color: colors.primary,
            fontFamily: "'Space Grotesk', sans-serif",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {isExternal ? "Read on source" : "Read article"}
            {isExternal ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function EmptyState({ colors, isDark }) {
  const textColor = isDark ? "#64748b" : "#94a3b8";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "5rem 2rem" }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginBottom: "1.5rem" }}
      >
        {/* Illustrated placeholder */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ margin: "0 auto", display: "block" }}>
          <rect x="10" y="20" width="100" height="80" rx="8"
            fill="none" stroke={colors.primary} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
          <rect x="20" y="32" width="45" height="6" rx="3" fill={colors.primary} opacity="0.25" />
          <rect x="20" y="44" width="80" height="4" rx="2" fill={colors.primary} opacity="0.15" />
          <rect x="20" y="54" width="70" height="4" rx="2" fill={colors.primary} opacity="0.12" />
          <rect x="20" y="64" width="55" height="4" rx="2" fill={colors.primary} opacity="0.1" />
          <circle cx="95" cy="32" r="12" fill={colors.accent} opacity="0.15" stroke={colors.accent} strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="95" y="37" textAnchor="middle" fontSize="12" fill={colors.accent} opacity="0.5">✦</text>
        </svg>
      </motion.div>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.2rem", color: isDark ? "#e2e8f0" : "#1e293b", marginBottom: "0.5rem" }}>
        Articles coming soon
      </h3>
      <p style={{ fontSize: "0.88rem", color: textColor, maxWidth: 320, margin: "0 auto" }}>
        I'm working on something worth reading. Check back shortly.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// BlogList page
// ─────────────────────────────────────────────
export default function BlogList({ activeTheme = "cyber-blue", isDark = true }) {
  const navigate = useNavigate();
  const colors = getColors(activeTheme);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");

  const textPrimary   = isDark ? "#f1f5f9"  : "#0f172a";
  const textSecondary = isDark ? "#64748b"  : "#64748b";
  const pageBg        = isDark ? "#0a0a14"  : "#f0f4ff";

  // Fetch posts
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setPosts(data && data.length > 0 ? data : SEED_POSTS);
      } catch (err) {
        console.warn("[BlogList] Falling back to seed posts:", err.message);
        setPosts(SEED_POSTS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // All unique tags
  const allTags = useMemo(() => {
    const s = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => s.add(t)));
    return ["All", ...Array.from(s)];
  }, [posts]);

  // Filtered posts
  const filtered = useMemo(() =>
    activeTag === "All" ? posts : posts.filter(p => (p.tags || []).includes(activeTag)),
    [posts, activeTag]
  );

  const handleClick = (post) => {
    if (post.type === "external" && post.external_url) {
      window.open(post.external_url, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/blog/${post.id}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>

      {/* ── Hero banner ── */}
      <section style={{ position: "relative", padding: "7rem 1.5rem 5rem", overflow: "hidden" }}>
        <HeroBg colors={colors} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "0.75rem" }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "4px 14px", borderRadius: 9999,
              background: `${colors.primary}14`, border: `1px solid ${colors.primary}44`,
              color: colors.primary, fontSize: "0.72rem",
              fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              <Rss size={11} /> Jeme's Blog
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900,
              color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.03em", margin: "0 0 1rem",
            }}
          >
            Thoughts &{" "}
            <span style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Articles
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "1.05rem", color: textSecondary, maxWidth: 480, margin: "0 auto" }}
          >
            Writing about software development, creative coding, and the things I build.
          </motion.p>
        </div>
      </section>

      {/* ── Tag filter bar ── */}
      {!loading && allTags.length > 1 && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 2rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}
          >
            <Tag size={14} style={{ color: colors.primary, opacity: 0.6, flexShrink: 0 }} />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  position: "relative", padding: "5px 14px", borderRadius: 9999,
                  border: `1px solid ${activeTag === tag ? colors.primary + "88" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
                  background: activeTag === tag ? `${colors.primary}20` : "transparent",
                  color: activeTag === tag ? colors.primary : textSecondary,
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.18s",
                }}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── Posts grid ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 6rem" }}>
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} isDark={isDark} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState colors={colors} isDark={isDark} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {filtered.map((post, i) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  colors={colors}
                  isDark={isDark}
                  index={i}
                  onClick={handleClick}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`
        @keyframes blog-shimmer {
          0%,100% { opacity:0.5 } 50% { opacity:1 }
        }
      `}</style>
    </div>
  );
}