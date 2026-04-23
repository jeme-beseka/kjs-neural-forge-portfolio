// src/pages/Home.jsx
// Assembles all portfolio sections in order.
import { useEffect }  from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme }   from '../context/ThemeContext';

import HeroSection       from '../components/sections/HeroSection';
import AboutSection      from '../components/sections/AboutSection';
import SkillsSection     from '../components/sections/SkillsSection';
import ProjectsSection   from '../components/sections/ProjectsSection';
// import BlogPreviewSection from '../components/sections/BlogPreviewSection';
import ContactSection    from '../components/sections/ContactSection';

/* ─────────────────────────────────────────────────────────────────────────────
   HOME PAGE
   ─────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { activeTheme, isDark } = useTheme();
  const location = useLocation();

  // Scroll to a section when arriving from another route via `state.scrollTo`
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    const t = setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState({}, document.title);
    }, 50);
    return () => clearTimeout(t);
  }, [location.state]);

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <HeroSection     activeTheme={activeTheme} isDark={isDark} />
      <AboutSection    activeTheme={activeTheme} isDark={isDark} />
      <SkillsSection   activeTheme={activeTheme} isDark={isDark} />
      <ProjectsSection activeTheme={activeTheme} isDark={isDark} />
      {/* <BlogPreviewSection /> */}
      <ContactSection  activeTheme={activeTheme} isDark={isDark} />
    </main>
  );
}
