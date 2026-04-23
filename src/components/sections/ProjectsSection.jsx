import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ExternalLink, X, ChevronRight, Clock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

// Inline GitHub brand SVG (lucide-react v1.8 doesn't export `Github`)
const Github = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.86-3.06.66-3.7-1.48-3.7-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.47-2.44-.28-5-1.22-5-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.24-2.57 5.16-5.02 5.43.4.34.74 1 .74 2.02 0 1.46-.01 2.64-.01 3 0 .29.2.64.76.53 4.36-1.46 7.5-5.58 7.5-10.44C23.02 5.24 18.27.5 12 .5z"/>
  </svg>
);


// Tag badge color cycling
const TAG_COLORS = [
  { bg: "rgba(0,212,255,0.12)",  border: "rgba(0,212,255,0.35)",  text: "#00D4FF" },
  { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.35)", text: "#a78bfa" },
  { bg: "rgba(0,255,136,0.12)",  border: "rgba(0,255,136,0.35)",  text: "#00FF88" },
  { bg: "rgba(255,45,120,0.12)", border: "rgba(255,45,120,0.35)", text: "#FF2D78" },
];

const tagColor = (i) => TAG_COLORS[i % TAG_COLORS.length];

// ─────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    id: "seed-1",
    title: "KJS News",
    description: "A news aggregation platform with read mode powered by Jina AI, embedded iFrame mode, and full source attribution with links to originals. Hosted on Vercel.",
    long_description: "KJS News is a full-featured news aggregation platform built with React. It intelligently scrapes news pages and presents them in a clean, readable interface. The platform features a Jina AI-powered Read Mode that extracts article content and renders it in a distraction-free modal, an Embedded Mode that displays the original news source in an iFrame, and full source attribution with direct links back to original articles. Deployed and live on Vercel.",
    tags: ["React", "Jina AI", "Web Scraping", "Vercel"],
    live_url: "#",
    github_url: "#",
    image_url: null,
    status: "completed",
    featured: true,
  },
  {
    id: "seed-2",
    title: "King Data Visualizer",
    description: "A desktop data visualization app with 9+ chart types, manual data entry, CSV and Excel upload. Available as a Windows .exe file.",
    long_description: "King Data Visualizer is a powerful desktop application built for intuitive data analysis and visualization. It supports over 9 chart types including bar, line, pie, scatter, area, radar, and more. Users can enter data manually through an interactive grid, or import existing datasets via CSV or Excel files. The app features a clean, modern UI with real-time chart rendering, export functionality, and a Windows .exe installer for easy distribution.",
    tags: ["Desktop App", "Java", "Charts", "CSV", "Excel"],
    live_url: null,
    github_url: "#",
    image_url: null,
    status: "completed",
    featured: true,
  },
];

// ─────────────────────────────────────────────
// 3D Tilt Card hook
// ─────────────────────────────────────────────
function useTilt(strength = 12) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 20 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);
  const rotateX = useTransform(sy, [-0.5, 0.5], [strength, -strength]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-strength, strength]);

  const onMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0); y.set(0);
  }, [x, y]);

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─────────────────────────────────────────────
// Project image placeholder
// ─────────────────────────────────────────────
function ProjectImage({ project, height = 200 }) {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const initials = project.title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (project.image_url) {
    return (
      <img
        src={project.image_url}
        alt={project.title}
        style={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <div style={{
      width: "100%", height,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${primary}18, ${accent}18)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${primary}22 1px, transparent 1px), linear-gradient(90deg, ${primary}22 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }} />
      <span style={{
        position: "relative",
        fontSize: "3rem", fontWeight: 900,
        color: primary, opacity: 0.5,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "-0.04em",
      }}>
        {initials}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Featured Card (large, 3D tilt)
// ─────────────────────────────────────────────
function FeaturedCard({ project, onClick }) {
  const tilt = useTilt(8);
  const [hovered, setHovered] = useState(false);
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text').trim();
  const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text-muted').trim();
  const glassBg = "rgba(255,255,255,0.04)";

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={() => { tilt.onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onClick={() => onClick(project)}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
        cursor: "pointer",
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{
        borderRadius: "1rem",
        border: `1px solid ${hovered ? primary + "88" : primary + "33"}`,
        background: glassBg,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        overflow: "hidden",
        boxShadow: hovered
          ? `0 0 40px ${primary}33, 0 20px 60px rgba(0,0,0,0.3)`
          : `0 0 0px transparent, 0 8px 32px rgba(0,0,0,0.2)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}>
        {/* Left: image */}
        <div style={{ position: "relative", minHeight: 280 }}>
          <ProjectImage project={project} height={280} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, transparent 50%, rgba(10,10,20,0.8) 100%)",
          }} />
          {/* Featured badge */}
          <div style={{
            position: "absolute", top: 12, left: 12,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 9999,
            background: `${primary}22`,
            border: `1px solid ${primary}55`,
            color: primary, fontSize: "0.7rem",
            fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <Sparkles size={10} />
            Featured
          </div>
        </div>

        {/* Right: content */}
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: textPrimary, fontFamily: "'Space Grotesk', sans-serif", margin: 0, letterSpacing: "-0.02em" }}>
            {project.title}
          </h3>
          <p style={{ fontSize: "0.9rem", color: textSecondary, margin: 0, lineHeight: 1.65 }}>
            {project.description}
          </p>
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {(project.tags || []).map((tag, i) => {
              const tc = tagColor(i);
              return (
                <span key={tag} style={{
                  padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem",
                  fontWeight: 600, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {tag}
                </span>
              );
            })}
          </div>
          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {project.live_url && project.live_url !== "#" && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.5rem 1.1rem", borderRadius: "0.4rem",
                  background: `${primary}18`,
                  border: `1px solid ${primary}55`,
                  color: primary, fontSize: "0.82rem", fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${primary}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${primary}18`; }}
              >
                <ExternalLink size={13} /> Live Demo
              </a>
            )}
            {project.github_url && project.github_url !== "#" && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.5rem 1.1rem", borderRadius: "0.4rem",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: textPrimary, fontSize: "0.82rem", fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                <Github size={13} /> GitHub
              </a>
            )}
            <button
              onClick={() => onClick(project)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "0.5rem 1rem", borderRadius: "0.4rem",
                background: "transparent", border: "none",
                color: primary, fontSize: "0.82rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              View Details <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Regular Project Card
// ─────────────────────────────────────────────
function ProjectCard({ project, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text').trim();
  const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text-muted').trim();
  const glassBg = "rgba(255,255,255,0.04)";
  const isUpcoming = project.status === "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(project)}
      style={{
        borderRadius: "0.875rem",
        border: `1px solid ${hovered ? primary + "66" : "rgba(255,255,255,0.08)"}`,
        background: glassBg,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? `0 0 28px ${primary}28, 0 12px 40px rgba(0,0,0,0.25)` : "0 4px 20px rgba(0,0,0,0.15)",
        transition: "border-color 0.25s, box-shadow 0.25s",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative" }}>
        <ProjectImage project={project} height={180} />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,20,0.85) 100%)",
        }} />
        {/* Upcoming overlay */}
        {isUpcoming && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(10,10,20,0.6)", backdropFilter: "blur(4px)",
            gap: "0.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: primary }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: primary, animation: "pulse-dot 1.5s infinite",
              }} />
              <span style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Coming Soon
              </span>
            </div>
            <Clock size={18} style={{ color: primary, opacity: 0.6 }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.65rem", flex: 1 }}>
        <h3 style={{
          fontSize: "1.05rem", fontWeight: 700, margin: 0,
          color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.01em",
        }}>
          {project.title}
        </h3>
        <p style={{
          fontSize: "0.83rem", color: textSecondary, margin: 0, lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {project.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {(project.tags || []).slice(0, 4).map((tag, i) => {
            const tc = tagColor(i);
            return (
              <span key={tag} style={{
                padding: "2px 8px", borderRadius: 9999, fontSize: "0.68rem",
                fontWeight: 600, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {tag}
              </span>
            );
          })}
          {(project.tags || []).length > 4 && (
            <span style={{ padding: "2px 8px", fontSize: "0.68rem", color: textSecondary }}>
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem" }}>
          {project.live_url && project.live_url !== "#" && !isUpcoming && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "0.4rem 0.85rem", borderRadius: "0.35rem",
                background: `${primary}16`, border: `1px solid ${primary}44`,
                color: primary, fontSize: "0.76rem", fontWeight: 600,
                textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${primary}28`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${primary}16`; }}
            >
              <ExternalLink size={11} /> Demo
            </a>
          )}
          {project.github_url && project.github_url !== "#" && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "0.4rem 0.85rem", borderRadius: "0.35rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: textPrimary, fontSize: "0.76rem", fontWeight: 600,
                textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}1A`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              <Github size={11} /> GitHub
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Project Detail Modal
// ─────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text').trim();
  const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text-muted').trim();
  const modalBg = "rgba(10,10,20,0.95)";
  const borderColor = "rgba(255,255,255,0.1)";

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720,
          maxHeight: "90vh", overflowY: "auto",
          borderRadius: "1.25rem",
          border: `1px solid ${primary}44`,
          background: modalBg,
          boxShadow: `0 0 60px ${primary}22, 0 30px 80px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Image */}
        <div style={{ position: "relative" }}>
          <ProjectImage project={project} height={260} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, rgba(10,10,20,1) 100%)",
          }} />
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${primary}55`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "2rem" }}>
          {/* Status badge */}
          <div style={{ marginBottom: "1rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 9999, fontSize: "0.72rem",
              fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em",
              background: project.status === "upcoming" ? `${accent}18` : `${primary}18`,
              border: `1px solid ${project.status === "upcoming" ? accent + "44" : primary + "44"}`,
              color: project.status === "upcoming" ? accent : primary,
            }}>
              {project.status === "upcoming" ? <Clock size={10} /> : <Sparkles size={10} />}
              {project.status === "upcoming" ? "Upcoming" : "Completed"}
            </span>
          </div>

          <h2 style={{
            fontSize: "2rem", fontWeight: 900, margin: "0 0 1rem",
            color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.03em",
          }}>
            {project.title}
          </h2>

          <p style={{
            fontSize: "0.95rem", color: textSecondary,
            lineHeight: 1.75, margin: "0 0 1.5rem",
          }}>
            {project.long_description || project.description}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem" }}>
            {(project.tags || []).map((tag, i) => {
              const tc = tagColor(i);
              return (
                <span key={tag} style={{
                  padding: "5px 13px", borderRadius: 9999, fontSize: "0.78rem",
                  fontWeight: 600, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {tag}
                </span>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: borderColor, marginBottom: "1.5rem" }} />

          {/* Links */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {project.live_url && project.live_url !== "#" && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "0.65rem 1.4rem", borderRadius: "0.5rem",
                  background: `${primary}20`,
                  border: `1px solid ${primary}55`,
                  color: primary, fontSize: "0.88rem", fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.2s",
                  boxShadow: `0 0 16px ${primary}22`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${primary}35`; e.currentTarget.style.boxShadow = `0 0 28px ${primary}44`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${primary}20`; e.currentTarget.style.boxShadow = `0 0 16px ${primary}22`; }}
              >
                <ExternalLink size={15} /> View Live Demo
              </a>
            )}
            {project.github_url && project.github_url !== "#" && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "0.65rem 1.4rem", borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${borderColor}`,
                  color: textPrimary, fontSize: "0.88rem", fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                <Github size={15} /> View on GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────
function SkeletonCard() {
  const bg = "rgba(255,255,255,0.04)";
  const shimmer = "rgba(255,255,255,0.07)";
  return (
    <div style={{
      borderRadius: "0.875rem", border: "1px solid rgba(255,255,255,0.07)",
      background: bg, overflow: "hidden",
    }}>
      <div style={{ height: 180, background: shimmer, animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ height: 18, borderRadius: 6, background: shimmer, width: "60%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 12, borderRadius: 6, background: shimmer, animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 12, borderRadius: 6, background: shimmer, width: "80%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {[40, 55, 48].map((w, i) => (
            <div key={i} style={{ height: 20, width: w, borderRadius: 9999, background: shimmer, animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter Tab Bar
// ─────────────────────────────────────────────
const TABS = ["All", "Completed", "Upcoming"];

function FilterTabs({ active, onChange }) {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const textColor = "#94a3b8";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "0.75rem", padding: "0.3rem", gap: "0.15rem",
      backdropFilter: "blur(10px)",
    }}>
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            position: "relative", padding: "0.45rem 1.1rem",
            borderRadius: "0.5rem", border: "none", background: "transparent",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            color: active === tab ? primary : textColor,
            transition: "color 0.2s",
            zIndex: 1,
          }}
        >
          {active === tab && (
            <motion.div
              layoutId="tab-pill"
              style={{
                position: "absolute", inset: 0, borderRadius: "0.5rem",
                background: `${primary}18`,
                border: `1px solid ${primary}44`,
                zIndex: -1,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ProjectsSection
// ─────────────────────────────────────────────
export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--mode-text').trim();
  const textSecondary = "#64748b";
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

  // Fetch from Supabase, fall back to seed data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data && data.length > 0 ? data : SEED_PROJECTS);
      } catch (err) {
        console.warn("[ProjectsSection] Supabase fetch failed, using seed data:", err.message);
        setProjects(SEED_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter
  const filtered = projects.filter(p => {
    if (activeTab === "All") return true;
    if (activeTab === "Completed") return p.status === "completed";
    if (activeTab === "Upcoming") return p.status === "upcoming";
    return true;
  });

  const featured = filtered.filter(p => p.featured);
  const regular  = filtered.filter(p => !p.featured);

  return (
    <section id="projects" style={{ padding: "6rem 0", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <span style={{
            display: "inline-block", marginBottom: "0.75rem",
            fontSize: "0.72rem", fontFamily: "monospace",
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: primaryColor,
          }}>
            // my work
          </span>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
            color: textPrimary, fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.03em", margin: "0 0 0.75rem",
          }}>
            Projects
          </h2>
          <p style={{ fontSize: "1rem", color: textSecondary, maxWidth: 480, margin: "0 auto 2rem" }}>
            A collection of things I've built — from web platforms to desktop applications.
          </p>

          {/* Filter tabs */}
          <FilterTabs active={activeTab} onChange={setActiveTab} />
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div>
            <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
              <SkeletonCard />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "4rem 0", color: textSecondary }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.4 }}>◎</div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem" }}>
              No {activeTab.toLowerCase()} projects yet.
            </p>
          </motion.div>
        )}

        {/* Featured projects */}
        {!loading && featured.length > 0 && (
          <motion.div
            layout
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}
          >
            <AnimatePresence mode="popLayout">
              {featured.map(project => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Responsive: use regular card on mobile, featured on desktop */}
                  <div className="featured-card-wrapper">
                    <FeaturedCard
                      project={project}
                      onClick={setSelectedProject}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Regular projects grid */}
        {!loading && regular.length > 0 && (
          <>
            {featured.length > 0 && regular.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem",
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: "0.75rem", color: textSecondary, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  More Projects
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>
            )}
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              <AnimatePresence mode="popLayout">
                {regular.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  >
                    <ProjectCard
                      project={project}
                      onClick={setSelectedProject}
                      index={i}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.6; }
          50%  { opacity: 1;   }
          100% { opacity: 0.6; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1);    box-shadow: 0 0 0 0 currentColor; }
          50%       { opacity: 0.7; transform: scale(1.2); box-shadow: 0 0 0 6px transparent; }
        }
        @media (max-width: 640px) {
          .featured-card-wrapper > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
