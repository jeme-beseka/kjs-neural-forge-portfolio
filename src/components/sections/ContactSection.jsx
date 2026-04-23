// src/components/sections/ContactSection.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────────────
   SOCIAL SVG ICONS (GitHub, LinkedIn, Twitter/X)
   ─────────────────────────────────────────────────────────────────────────── */
const GitHubIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedInIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterXIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FLOATING GEOMETRIC SHAPES — background decoration
   ─────────────────────────────────────────────────────────────────────────── */
const SHAPES = [
  { type: 'triangle', size: 60,  top: '8%',  left: '3%',  duration: 18, delay: 0 },
  { type: 'circle',   size: 40,  top: '22%', left: '88%', duration: 24, delay: 3 },
  { type: 'triangle', size: 35,  top: '65%', left: '5%',  duration: 20, delay: 6 },
  { type: 'circle',   size: 70,  top: '75%', left: '92%', duration: 28, delay: 1 },
  { type: 'triangle', size: 25,  top: '45%', left: '95%', duration: 16, delay: 9 },
  { type: 'circle',   size: 28,  top: '88%', left: '12%', duration: 22, delay: 4 },
  { type: 'triangle', size: 50,  top: '15%', left: '50%', duration: 26, delay: 7 },
  { type: 'circle',   size: 18,  top: '55%', left: '78%', duration: 14, delay: 2 },
];

function ShapeTriangle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <polygon
        points="30,4 56,52 4,52"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeOpacity="0.04"
      />
    </svg>
  );
}

function ShapeCircle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <circle
        cx="30" cy="30" r="26"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeOpacity="0.05"
      />
      <circle
        cx="30" cy="30" r="12"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1"
        strokeOpacity="0.03"
      />
    </svg>
  );
}

function FloatingShape({ shape }) {
  return (
    <motion.div
      style={{ position: 'absolute', top: shape.top, left: shape.left }}
      animate={{
        y: [0, -24, 0],
        rotate: shape.type === 'triangle' ? [0, 15, -8, 0] : [0, 360],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: shape.duration,
        delay: shape.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {shape.type === 'triangle' ? <ShapeTriangle size={shape.size} /> : <ShapeCircle size={shape.size} />}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTACT INFO CARD
   ─────────────────────────────────────────────────────────────────────────── */
function ContactCard({ icon: Icon, label, value, href, delay }) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -48 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="glass-card flex items-center gap-4 px-5 py-4 group no-underline block"
        style={{ textDecoration: 'none' }}
      >
        {/* Icon glow wrapper */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'rgba(var(--color-primary-rgb), 0.1)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
            color: 'var(--color-primary)',
            boxShadow: '0 0 0 0 rgba(var(--color-primary-rgb), 0.3)',
          }}
        >
          <motion.div
            whileHover={{ filter: 'drop-shadow(0 0 8px var(--color-primary))' }}
          >
            <Icon size={20} />
          </motion.div>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {label}
          </p>
          <p
            className="text-sm font-medium truncate transition-colors duration-200 group-hover:text-[var(--color-primary)]"
            style={{ color: 'var(--mode-text)', fontFamily: 'Inter, sans-serif' }}
          >
            {value}
          </p>
        </div>

        {/* Arrow indicator */}
        <motion.div
          className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: 'var(--color-primary)' }}
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </a>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AVAILABILITY BADGE
   ─────────────────────────────────────────────────────────────────────────── */
function AvailabilityBadge({ delay }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full"
      style={{
        background: 'rgba(0, 200, 83, 0.08)',
        border: '1px solid rgba(0, 200, 83, 0.25)',
      }}
    >
      {/* Pulsing green dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: '#00C853' }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ background: '#00C853' }}
        />
      </span>
      <span
        className="text-sm font-medium"
        style={{ color: '#00C853', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Available for freelance work
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOCIAL LINKS ROW
   ─────────────────────────────────────────────────────────────────────────── */
const SOCIALS = [
  { icon: GitHubIcon,   href: 'https://github.com/jeme-beseka',   label: 'GitHub' },
  { icon: LinkedInIcon, href: 'https://linkedin.com/in/jemebeseka', label: 'LinkedIn' },
  { icon: TwitterXIcon, href: 'https://x.com/king_jaysheval',  label: 'Twitter / X' },
];

function SocialLinks({ delay }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="flex items-center gap-3"
    >
      {SOCIALS.map(({ icon: Icon, href, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            background: 'rgba(var(--color-primary-rgb), 0.06)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.18)',
            color: 'var(--mode-text-muted)',
          }}
          whileHover={{
            scale: 1.15,
            color: 'var(--color-primary)',
            boxShadow: '0 0 18px rgba(var(--color-primary-rgb), 0.35)',
            borderColor: 'rgba(var(--color-primary-rgb), 0.6)',
            background: 'rgba(var(--color-primary-rgb), 0.12)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon size={18} />
        </motion.a>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORM FIELD
   ─────────────────────────────────────────────────────────────────────────── */
function FormField({ label, type = 'text', value, onChange, error, placeholder, rows }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = type === 'textarea';
  const Tag = isTextarea ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: focused
            ? 'var(--color-primary)'
            : 'var(--mode-text-muted)',
          fontFamily: 'Space Grotesk, sans-serif',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      <Tag
        type={isTextarea ? undefined : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={isTextarea ? rows : undefined}
        className="glass-input resize-none"
        style={{
          borderColor: error
            ? '#FF4D6D'
            : focused
            ? 'rgba(var(--color-primary-rgb), 0.65)'
            : undefined,
          boxShadow: error
            ? '0 0 0 3px rgba(255,77,109,0.12)'
            : focused
            ? '0 0 0 3px rgba(var(--color-primary-rgb), 0.14), 0 0 16px rgba(var(--color-primary-rgb), 0.08)'
            : undefined,
          padding: '5px 5px',
        }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: '#FF4D6D', fontFamily: 'Inter, sans-serif' }}
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUCCESS STATE
   ─────────────────────────────────────────────────────────────────────────── */
function SuccessState() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center gap-5 py-16 text-center"
    >
      {/* Animated checkmark circle */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(var(--color-primary-rgb), 0.1)',
          border: '2px solid var(--color-primary)',
          boxShadow: '0 0 32px rgba(var(--color-primary-rgb), 0.3)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ color: 'var(--color-primary)' }}
        >
          <CheckCircle size={38} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h3
          className="text-2xl font-bold"
          style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Message sent!
        </h3>
        <p style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter, sans-serif' }}>
          I will get back to you soon.
        </p>
      </motion.div>

      {/* Decorative glow ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.12) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
   ─────────────────────────────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0,  y: 16,  scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl max-w-sm"
      style={{
        background: 'rgba(20, 4, 8, 0.95)',
        border: '1px solid rgba(255,77,109,0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <AlertCircle size={18} color="#FF4D6D" className="flex-shrink-0" />
      <p
        className="text-sm flex-1"
        style={{ color: '#FFC0CB', fontFamily: 'Inter, sans-serif' }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: '#FF4D6D' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTACT FORM
   ─────────────────────────────────────────────────────────────────────────── */
function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [toast,  setToast ] = useState(null);

  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const setField = useCallback((key) => (val) => {
    setFields(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }, []);

  function validate() {
    const errs = {};
    if (!fields.name.trim())    errs.name    = 'Name is required';
    if (!fields.email.trim())   errs.email   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                errs.email   = 'Enter a valid email address';
    if (!fields.subject.trim()) errs.subject = 'Subject is required';
    if (!fields.message.trim()) errs.message = 'Message cannot be empty';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading');
    try {
      const { error } = await supabase.from('messages').insert([{
        name:    fields.name.trim(),
        email:   fields.email.trim(),
        subject: fields.subject.trim(),
        message: fields.message.trim(),
        read:    false,
      }]);
      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('[ContactForm]', err);
      setStatus('idle');
      setToast(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 48 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-7 relative overflow-hidden"
      >
        {/* Inner top accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', opacity: 0.4 }}
        />

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <SuccessState key="success" />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <div 
                style={{
                  padding: '12px'
                }}
              >
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Send a message
                </h3>
                <p className="text-sm" style={{ color: 'var(--mode-text-muted)' }}>
                  I'll reply within 24 hours.
                </p>
              </div>

              {/* Two-up row: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                   style={{
                    padding: '12px'
                   }}
              >
                <FormField
                  label="Name"
                  value={fields.name}
                  onChange={setField('name')}
                  error={errors.name}
                  placeholder="Jeme Beseka"
                />
                <FormField
                  label="Email"
                  type="email"
                  value={fields.email}
                  onChange={setField('email')}
                  error={errors.email}
                  placeholder="jeme@example.com"
                />
              </div>

              <FormField
                label="Subject"
                value={fields.subject}
                onChange={setField('subject')}
                error={errors.subject}
                placeholder="Let's work together"
                style={{
                  padding: '12px',
                  margin: '12px'
                }}
              />

              <FormField
                label="Message"
                type="textarea"
                rows={5}
                value={fields.message}
                onChange={setField('message')}
                error={errors.message}
                placeholder="Tell me about your project..."
                style={{
                  padding: '12px',
                  margin: '12px'
                }}
              />

              {/* Submit button */}
              <motion.div
                onClick={status === 'loading' ? undefined : handleSubmit}
                className="glass-button glass-button--primary w-full justify-center py-3.5 cursor-pointer select-none"
                whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                whileTap={status  !== 'loading' ? { scale: 0.98 } : {}}
                style={{
                  opacity: status === 'loading' ? 0.8 : 1,
                  cursor:  status === 'loading' ? 'not-allowed' : 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  margin: '12px'
                }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key="toast"
            message={toast}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADING
   ─────────────────────────────────────────────────────────────────────────── */
function SectionHeading() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center"
      style={{ marginBottom: '4rem' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{
          color: 'var(--color-primary)',
          fontFamily: 'Space Grotesk, sans-serif',
          marginBottom: '0.75rem',
        }}
      >
        — Get in touch
      </p>
      <h2
        className="section-heading text-4xl md:text-5xl font-bold"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'var(--mode-text)',
          marginBottom: '1rem',
        }}
      >
        Let's Work Together
      </h2>
      <p
        className="text-base"
        style={{
          color: 'var(--mode-text-muted)',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.7,
          maxWidth: '36rem',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        Have a project in mind or just want to say hello? Drop me a message —
        I'm always open to new opportunities and collaborations.
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   ─────────────────────────────────────────────────────────────────────────── */
export default function ContactSection() {
  const CONTACT_CARDS = [
    {
      icon: Mail,
      label: 'Email',
      value: 'j.beseka@gmail.com',
      href:  'mailto:j.beseka@gmail.com',
    },
    {
      icon: LinkedInIcon,
      label: 'LinkedIn',
      value: 'linkedin.com/in/jemebeseka',
      href:  'https://linkedin.com/in/jemebeseka',
    },
    {
      icon: GitHubIcon,
      label: 'GitHub',
      value: 'Jeme Beseka',
      href:  'https://github.com/jeme-beseka',
    },
  ];

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Floating geometric background shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SHAPES.map((shape, i) => (
          <FloatingShape key={i} shape={shape} />
        ))}
      </div>

      {/* Subtle radial spotlight at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(var(--color-primary-rgb), 0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Left edge ambient glow — sits outside content, no layout impact */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute left-0 top-1/3 w-72 h-72 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.07) 0%, transparent 70%)',
          filter: 'blur(30px)',
          transform: 'translateX(-40%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
        }}
      >
        <SectionHeading />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Contact cards */}
            {CONTACT_CARDS.map((card, i) => (
              <ContactCard
                key={card.label}
                {...card}
                delay={i * 0.1}
              />
            ))}

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background:
                  'linear-gradient(90deg, rgba(var(--color-primary-rgb),0.3), transparent)',
              }}
            />

            {/* Availability badge */}
            <AvailabilityBadge delay={0.75} />

            {/* Social links */}
            <div className="flex flex-col gap-2.5">
              <p
                className="text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Find me on
              </p>
              <SocialLinks delay={0.45} />
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────── */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}