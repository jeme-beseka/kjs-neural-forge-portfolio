// src/components/ui/ScrollToTop.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-to-top"
          onClick={scrollUp}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{    opacity: 0, scale: 0.6,  y: 20 }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{  scale: 0.92 }}
          aria-label="Scroll to top"
          style={{
            position:     'fixed',
            bottom:       '2rem',
            right:        '2rem',
            zIndex:       90,
            width:        '48px',
            height:       '48px',
            borderRadius: '14px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            background:   'rgba(var(--color-primary-rgb), 0.12)',
            border:       '1px solid rgba(var(--color-primary-rgb), 0.35)',
            color:        'var(--color-primary)',
            cursor:       'pointer',
            backdropFilter: 'blur(12px)',
            boxShadow:    '0 0 20px rgba(var(--color-primary-rgb), 0.25), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {/* Animated chevron — bounces upward on loop */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronUp size={22} strokeWidth={2.5} />
          </motion.div>

          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position:     'absolute',
              inset:        '-4px',
              borderRadius: '18px',
              border:       '1px solid rgba(var(--color-primary-rgb), 0.3)',
              pointerEvents: 'none',
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
