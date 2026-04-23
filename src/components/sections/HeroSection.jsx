import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { ChevronDown, Download, ArrowRight } from "lucide-react";
import * as THREE from "three";

// Deterministic PRNG (mulberry32) — used in useMemo factories so random-based
// geometry stays pure/idempotent per the React compiler rules.
function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────
// useTypewriter hook
// ─────────────────────────────────────────────
function useTypewriter(words, { typingSpeed = 80, deletingSpeed = 40, pauseDuration = 1800 } = {}) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;
    if (phase === "typing") {
      if (displayed.length < current.length) {
        timeout = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          typingSpeed
        );
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseDuration);
      }
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        timeout = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deletingSpeed
        );
      } else {
        timeout = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        }, 0);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return displayed;
}

// ─────────────────────────────────────────────
// Theme colors
// ─────────────────────────────────────────────
const THEME_COLORS = {
  "cyber-blue":    { primary: "#00D4FF", accent: "#7C3AED", emissive: "#003a4d" },
  "deep-space":    { primary: "#4D9FFF", accent: "#FF2D78", emissive: "#0a1a33" },
  "arctic-neural": { primary: "#00B4D8", accent: "#90E0EF", emissive: "#002b36" },
  "matrix-green":  { primary: "#00FF88", accent: "#00E5FF", emissive: "#003322" },
  "bio-circuit":   { primary: "#39FF14", accent: "#ADFF2F", emissive: "#0a1f00" },
  "toxic-forge":   { primary: "#00FFC8", accent: "#7FFF00", emissive: "#003322" },
};

const getColors = (theme) => THEME_COLORS[theme] || THEME_COLORS["cyber-blue"];

// ─────────────────────────────────────────────
// 3D Shapes
// ─────────────────────────────────────────────

// Cyber Blue — Icosahedron wireframe + inner glow
function IcosahedronShape({ colors }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.18;
      outerRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.12;
      innerRef.current.rotation.z = t * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 1.2) * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial color={colors.primary} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.emissive}
          emissiveIntensity={0.8}
          transparent opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.6, 16, 16]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Deep Space — Galaxy spiral
function GalaxySpiralShape({ colors }) {
  const pointsRef = useRef();
  const ringRef = useRef();

  const geo = useMemo(() => {
    const rand = createRng(1337);
    const count = 2400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 10;
      const r = (i / count) * 3.2;
      const arm = i % 2 === 0 ? 0 : Math.PI;
      pos[i * 3]     = Math.cos(t + arm) * r + (rand() - 0.5) * 0.4;
      pos[i * 3 + 1] = (rand() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(t + arm) * r + (rand() - 0.5) * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pointsRef.current) pointsRef.current.rotation.y = t * 0.08;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.05;
      ringRef.current.rotation.x = Math.sin(t * 0.07) * 0.1;
    }
  });

  return (
    <group>
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial color={colors.primary} size={0.035} transparent opacity={0.85} sizeAttenuation />
      </points>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.8, 0.04, 8, 80]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Arctic Neural — Neural node sphere
function NeuralSphereShape({ colors }) {
  const groupRef = useRef();

  const { nodeGeo, lineGeo } = useMemo(() => {
    const rand = createRng(2024);
    const nodeCount = 60;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(2 * rand() - 1);
      const theta = rand() * Math.PI * 2;
      const r = 1.8 + rand() * 0.5;
      nodes.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }

    const linePos = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.4) {
          linePos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    const nodePosArr = new Float32Array(nodeCount * 3);
    nodes.forEach((n, i) => { nodePosArr[i*3]=n.x; nodePosArr[i*3+1]=n.y; nodePosArr[i*3+2]=n.z; });

    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute("position", new THREE.BufferAttribute(nodePosArr, 3));

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));

    return { nodeGeo: nGeo, lineGeo: lGeo };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.07) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={colors.primary} transparent opacity={0.35} />
      </lineSegments>
      <points geometry={nodeGeo}>
        <pointsMaterial color={colors.primary} size={0.08} sizeAttenuation />
      </points>
      <mesh>
        <sphereGeometry args={[1.75, 16, 16]} />
        <meshBasicMaterial color={colors.primary} wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

// Matrix Green — Wireframe globe
function WireframeGlobeShape({ colors }) {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) outerRef.current.rotation.y = t * 0.15;
    if (innerRef.current) innerRef.current.rotation.y = -t * 0.08;
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <sphereGeometry args={[2, 18, 12]} />
        <meshBasicMaterial color={colors.primary} wireframe transparent opacity={0.65} />
      </mesh>
      <mesh ref={innerRef}>
        <sphereGeometry args={[2.05, 6, 18]} />
        <meshBasicMaterial color={colors.accent} wireframe transparent opacity={0.25} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.95, 32, 32]} />
        <meshStandardMaterial
          color={colors.primary}
          transparent opacity={0.04}
          emissive={colors.emissive}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Bio Circuit — CPU chip cluster
function BioCpuShape({ colors }) {
  const groupRef = useRef();

  const boxes = useMemo(() => {
    const rand = createRng(42);
    const result = [];
    const grid = [-1.4, -0.7, 0, 0.7, 1.4];
    grid.forEach(x => grid.forEach(z => {
      result.push({ x, z, h: 0.1 + rand() * 0.9, s: 0.25 + rand() * 0.28, wire: rand() > 0.75 });
    }));
    return result;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.15 - 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {boxes.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.5, b.z]}>
          <boxGeometry args={[b.s, b.h, b.s]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.emissive}
            emissiveIntensity={1.2}
            transparent opacity={0.75}
            wireframe={b.wire}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 3.6, 8, 8]} />
        <meshBasicMaterial color={colors.primary} wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// Toxic Forge — Torus knot
function ToxicTorusKnotShape({ colors }) {
  const outerRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.14;
      outerRef.current.rotation.x = t * 0.07;
      outerRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.3;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.1;
      wireRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <torusKnotGeometry args={[1.4, 0.38, 160, 16, 2, 3]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={0.6}
          transparent opacity={0.82}
          roughness={0.1} metalness={0.8}
        />
      </mesh>
      <mesh ref={wireRef}>
        <torusKnotGeometry args={[1.4, 0.44, 80, 8, 2, 3]} />
        <meshBasicMaterial color={colors.accent} wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function ThemeShape({ theme }) {
  const colors = getColors(theme);
  switch (theme) {
    case "deep-space":    return <GalaxySpiralShape colors={colors} />;
    case "arctic-neural": return <NeuralSphereShape colors={colors} />;
    case "matrix-green":  return <WireframeGlobeShape colors={colors} />;
    case "bio-circuit":   return <BioCpuShape colors={colors} />;
    case "toxic-forge":   return <ToxicTorusKnotShape colors={colors} />;
    default:              return <IcosahedronShape colors={colors} />;
  }
}

function Scene({ theme }) {
  const colors = getColors(theme);
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={colors.primary} />
      <pointLight position={[-4, -2, -4]} intensity={0.6} color={colors.accent} />
      <pointLight position={[0, -4, 0]} intensity={0.4} color={colors.primary} />
      <ThemeShape theme={theme} />
      <OrbitControls
        autoRotate autoRotateSpeed={0.5}
        enableZoom={false} enablePan={false} enableRotate={false}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Glitch text
// ─────────────────────────────────────────────
function GlitchText({ text }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const CHARS = "!<>-_\\/[]{}—=+*^?#";
    let iter = 0;
    let iv;
    const start = () => {
      iv = setInterval(() => {
        setDisplay(
          text.split("").map((ch, idx) => {
            if (ch === " ") return " ";
            if (idx < iter) return text[idx];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        iter += 0.45;
        if (iter >= text.length) { clearInterval(iv); setDisplay(text); }
      }, 36);
    };
    const delay = setTimeout(start, 400);
    return () => { clearTimeout(delay); clearInterval(iv); };
  }, [text]);

  return <>{display}</>;
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────
export default function HeroSection({ activeTheme = "cyber-blue", isDark = true }) {
  const colors = getColors(activeTheme);
  const [cvUrl, setCvUrl] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'cv_url')
      .single()
      .then(({ data }) => { if (data?.value) setCvUrl(data.value); });
  }, []);

  const typed = useTypewriter(
    ["Software Developer", "Full Stack Engineer", "Problem Solver", "Creative Technologist"],
    { typingSpeed: 75, deletingSpeed: 38, pauseDuration: 2000 }
  );

  const scrollToProjects = useCallback(() => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollDown = useCallback(() => {
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.4 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const textColor  = isDark ? "#ffffff" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#475569";
  const glassBg    = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const glassBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <section
      id="hero"
      style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* 3D Canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent", width: "100%", height: "100%" }}
        >
          <Scene theme={activeTheme} />
        </Canvas>
      </div>

      {/* Radial vignette */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: isDark
            ? "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, rgba(10,10,20,0.75) 100%)"
            : "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, rgba(240,244,255,0.75) 100%)",
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.03,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
        }}
      />

      {/* Content overlay */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center",
          padding: "0 1.5rem", width: "100%", maxWidth: "900px", margin: "0 auto",
        }}
      >
        {/* Welcome pill */}
        <motion.div variants={item} style={{ marginBottom: "1.25rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            fontSize: "0.75rem", fontFamily: "monospace", letterSpacing: "0.2em",
            textTransform: "uppercase", padding: "0.375rem 1rem", borderRadius: "9999px",
            border: `1px solid ${colors.primary}44`,
            background: `${colors.primary}14`,
            color: colors.primary,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: colors.primary,
              animation: "pulse 2s infinite",
            }} />
            Welcome to my portfolio
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={item}
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: textColor,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: "0.75rem",
          }}
        >
          <GlitchText text="Jeme Beseka" />
        </motion.h1>

        {/* Gradient accent line */}
        <motion.div variants={item} style={{ marginBottom: "1.5rem" }}>
          <div style={{
            height: 2, width: "clamp(160px, 30vw, 280px)", margin: "0 auto",
            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.accent}, transparent)`,
          }} />
        </motion.div>

        {/* Typewriter subtitle */}
        <motion.div
          variants={item}
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 300,
            color: subColor,
            height: "2rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            marginBottom: "2.5rem",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <span style={{ color: colors.primary, fontFamily: "monospace", opacity: 0.7, fontSize: "0.9em" }}>&gt;</span>
          <span>{typed}</span>
          <span style={{
            display: "inline-block", width: 2, height: "1.2em",
            background: colors.primary, marginLeft: 2,
            animation: "blink 1s step-end infinite",
          }} />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={item}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {/* View My Work */}
          <button
            onClick={scrollToProjects}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.5rem",
              border: `1px solid ${colors.primary}`,
              background: `${colors.primary}18`,
              color: colors.primary,
              fontWeight: 600, fontSize: "0.95rem",
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "all 0.2s ease",
              boxShadow: `0 0 20px ${colors.primary}22`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${colors.primary}30`;
              e.currentTarget.style.boxShadow = `0 0 32px ${colors.primary}44`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${colors.primary}18`;
              e.currentTarget.style.boxShadow = `0 0 20px ${colors.primary}22`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            View My Work
            <ArrowRight size={16} />
          </button>

          {/* Download CV */}
          <a
            href={cvUrl || undefined}
            download={cvUrl ? 'Jeme_Beseka_CV.pdf' : undefined}
            target={cvUrl ? '_blank' : undefined}
            rel={cvUrl ? 'noopener noreferrer' : undefined}
            onClick={!cvUrl ? e => e.preventDefault() : undefined}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.5rem",
              border: `1px solid ${glassBorder}`,
              background: glassBg,
              color: cvUrl ? textColor : 'rgba(255,255,255,0.3)',
              fontWeight: 600, fontSize: "0.95rem",
              fontFamily: "'Space Grotesk', sans-serif",
              textDecoration: "none",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "all 0.2s ease",
              cursor: cvUrl ? 'pointer' : 'default',
            }}
            onMouseEnter={e => {
              if (!cvUrl) return;
              e.currentTarget.style.background = `${colors.accent}18`;
              e.currentTarget.style.borderColor = `${colors.accent}66`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              if (!cvUrl) return;
              e.currentTarget.style.background = glassBg;
              e.currentTarget.style.borderColor = glassBorder;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Download size={16} />
            {cvUrl ? 'Download CV' : 'CV Coming Soon'}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll-down indicator */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        style={{
          position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 2, background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
          color: colors.primary, opacity: 0.7,
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </motion.button>

      {/* Inline keyframes */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
      `}</style>
    </section>
  );
}