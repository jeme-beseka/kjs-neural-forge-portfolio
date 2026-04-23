// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [shaking,  setShaking]  = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    const correct = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === correct) {
      sessionStorage.setItem('nf_admin_token', 'authenticated');
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password. Access denied.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg-dark)' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(var(--color-primary-rgb),0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        animate={shaking ? {
          x: [-12, 12, -10, 10, -6, 6, -2, 2, 0],
        } : { x: 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="w-full max-w-sm"
      >
        <div className="glass-card p-8 flex flex-col gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ boxShadow: [
                '0 0 16px rgba(var(--color-primary-rgb),0.3)',
                '0 0 32px rgba(var(--color-primary-rgb),0.6)',
                '0 0 16px rgba(var(--color-primary-rgb),0.3)',
              ]}}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(var(--color-primary-rgb),0.1)',
                border: '1px solid rgba(var(--color-primary-rgb),0.35)',
              }}
            >
              <Zap size={26} style={{ color: 'var(--color-primary)' }} />
            </motion.div>
            <div className="text-center">
              <h1
                className="text-xl font-bold"
                style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Neural Forge
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mode-text-muted)' }}>
                Admin Panel
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          {/* Field */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Password
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-primary)', opacity: 0.7 }}
              >
                <Lock size={15} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter admin password"
                className="glass-input pl-9 pr-10"
                autoFocus
              />
              <button
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--mode-text-muted)' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs mt-0.5"
                  style={{ color: '#FF4D6D', fontFamily: 'Inter, sans-serif' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="glass-button glass-button--primary w-full justify-center py-3 font-semibold"
            style={{ fontSize: '0.9375rem' }}
          >
            Access Dashboard
          </motion.button>

          <p
            className="text-center text-xs"
            style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter, sans-serif' }}
          >
            Neural Forge © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
