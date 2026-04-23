import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LivingBackground  from './backgrounds/LivingBackground';
import Navbar            from './components/Navbar';
import Footer            from './components/Footer';
import ProtectedRoute    from './components/admin/ProtectedRoute';
import ScrollToTop       from './components/ui/ScrollToTop';
import Home              from './pages/Home';
import BlogList          from './pages/BlogList';
import BlogPost          from './pages/BlogPost';
import AdminLogin        from './pages/admin/AdminLogin';
import AdminDashboard    from './pages/admin/AdminDashboard';

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE TRANSITION WRAPPER
   ─────────────────────────────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter:   { opacity: 1, y: 0,   transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   404 PAGE
   ─────────────────────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <p
        className="text-7xl font-bold"
        style={{
          color: 'var(--color-primary)',
          fontFamily: 'Space Grotesk, sans-serif',
          textShadow: '0 0 40px rgba(var(--color-primary-rgb), 0.4)',
        }}
      >
        404
      </p>
      <h1
        className="text-2xl font-semibold"
        style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Page not found
      </h1>
      <p style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter, sans-serif' }}>
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="glass-button glass-button--primary px-6 py-2.5"
        style={{ textDecoration: 'none' }}
      >
        Back to Home
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED ROUTES
   ─────────────────────────────────────────────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Living canvas background — always visible */}
      <LivingBackground />

      {!isAdmin && <Navbar />}

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>

          {/* ── Public routes ──────────────────────────────── */}
          <Route path="/"        element={<PageTransition><Home     /></PageTransition>} />
          <Route path="/blog"    element={<PageTransition><BlogList /></PageTransition>} />
          <Route path="/blog/:id" element={<PageTransition><BlogPost /></PageTransition>} />

          {/* ── Admin routes ───────────────────────────────── */}
          <Route path="/admin" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          {/* ── 404 fallback ───────────────────────────────── */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />

        </Routes>
      </AnimatePresence>

      {!isAdmin && <Footer />}
      {!isAdmin && <ScrollToTop />}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT APP
   ─────────────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}