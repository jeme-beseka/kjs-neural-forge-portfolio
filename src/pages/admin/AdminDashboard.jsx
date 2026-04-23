// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, FileText, Zap, MessageSquare, Clock,
  Palette, User, LogOut, Menu, X, Plus, Edit2, Trash2,
  Check, Eye, EyeOff, ExternalLink, Home,
  Star, StarOff, CheckCircle, AlertCircle, Loader2, Save,
  FileUp, Download, Trash2 as Trash2Alt,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */

function Badge({ children, color = 'primary' }) {
  const styles = {
    primary:  { bg: 'rgba(var(--color-primary-rgb),0.12)', color: 'var(--color-primary)',  border: 'rgba(var(--color-primary-rgb),0.3)'  },
    accent:   { bg: 'rgba(var(--color-accent-rgb),0.12)',  color: 'var(--color-accent)',    border: 'rgba(var(--color-accent-rgb),0.3)'    },
    green:    { bg: 'rgba(0,200,83,0.1)',                  color: '#00C853',                border: 'rgba(0,200,83,0.3)'                   },
    orange:   { bg: 'rgba(255,160,0,0.1)',                 color: '#FFA000',                border: 'rgba(255,160,0,0.3)'                  },
    red:      { bg: 'rgba(255,77,109,0.1)',                color: '#FF4D6D',                border: 'rgba(255,77,109,0.3)'                 },
    muted:    { bg: 'rgba(255,255,255,0.06)',              color: 'var(--mode-text-muted)', border: 'rgba(255,255,255,0.12)'               },
  };
  const s = styles[color] || styles.primary;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  );
}

function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: 'var(--color-primary)' }} />;
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl max-w-xs"
      style={{
        background: type === 'success' ? 'rgba(0,30,10,0.95)' : 'rgba(30,4,8,0.95)',
        border: `1px solid ${type === 'success' ? 'rgba(0,200,83,0.4)' : 'rgba(255,77,109,0.4)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {type === 'success'
        ? <CheckCircle size={16} color="#00C853" />
        : <AlertCircle size={16} color="#FF4D6D" />}
      <p className="text-sm flex-1" style={{ color: type === 'success' ? '#00C853' : '#FF4D6D', fontFamily: 'Inter,sans-serif' }}>
        {message}
      </p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity"><X size={14} style={{ color: 'var(--mode-text-muted)' }} /></button>
    </motion.div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);
  const hide = useCallback(() => setToast(null), []);
  const el = (
    <AnimatePresence>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hide} />}
    </AnimatePresence>
  );
  return { show, el };
}

/* Modal overlay */
function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1,   opacity: 1, y: 0 }}
            exit={{ scale: 0.9,    opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="glass-modal w-full overflow-hidden flex flex-col"
            style={{ maxWidth: wide ? 760 : 520, maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>{title}</h2>
              <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/5">
                <X size={18} style={{ color: 'var(--mode-text-muted)' }} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Confirm modal */
function ConfirmModal({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm mb-6" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter,sans-serif' }}>{description}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="glass-button px-4 py-2 text-sm">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.4)', color: '#FF4D6D' }}
        >
          {loading ? <Spinner size={14} /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>
    </Modal>
  );
}

/* Field wrapper */
function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <label
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--mode-text-muted)',
          fontFamily: 'Space Grotesk,sans-serif',
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: '0.7rem', color: 'var(--mode-text-muted)', opacity: 0.75, marginTop: 2 }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{ fontSize: '0.72rem', color: '#FF4D6D', marginTop: 2 }}>{error}</p>
      )}
    </div>
  );
}

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  color: 'var(--mode-text)',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
};

/* Input / Textarea */
function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="glass-input"
      style={INPUT_STYLE}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb),0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb),0.12)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="glass-input"
      style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.55, minHeight: 80 }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb),0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb),0.12)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

/* Toggle switch */
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{
          background: checked ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)',
          boxShadow: checked ? '0 0 10px rgba(var(--color-primary-rgb),0.4)' : 'none',
        }}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        />
      </div>
      {label && <span className="text-sm" style={{ color: 'var(--mode-text-muted)' }}>{label}</span>}
    </label>
  );
}

/* Tag pills input */
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  function add() {
    const val = input.trim();
    if (val && !tags.includes(val)) { onChange([...tags, val]); }
    setInput('');
  }
  function remove(t) { onChange(tags.filter(x => x !== t)); }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          placeholder="Type tag, press Enter"
          className="glass-input text-sm flex-1"
        />
        <button onClick={add} className="glass-button px-3 py-2 text-xs"><Plus size={14} /></button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(var(--color-primary-rgb),0.1)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb),0.25)' }}
            >
              {t}
              <button onClick={() => remove(t)} className="opacity-60 hover:opacity-100 transition-opacity"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* Row action buttons */
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg transition-all hover:scale-110"
        style={{ color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb),0.08)' }}
      >
        <Edit2 size={14} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg transition-all hover:scale-110"
        style={{ color: '#FF4D6D', background: 'rgba(255,77,109,0.08)' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* Table wrapper */
function Table({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(var(--color-primary-rgb),0.04)' }}>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk,sans-serif', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="px-4 py-10 text-center"><Spinner size={20} /></td></tr>
          ) : empty ? (
            <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--mode-text-muted)' }}>No records yet.</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function Tr({ children, onClick, clickable }) {
  return (
    <tr
      onClick={onClick}
      className="transition-colors"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: clickable ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </tr>
  );
}

function Td({ children, muted }) {
  return (
    <td className="px-4 py-3" style={{ color: muted ? 'var(--mode-text-muted)' : 'var(--mode-text)', fontFamily: 'Inter,sans-serif' }}>
      {children}
    </td>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_PROJECT = { title: '', description: '', long_description: '', tags: [], live_url: '', github_url: '', image_url: '', status: 'completed', featured: false };

function ProjectsTab({ toast }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | { mode:'add'|'edit', data }
  const [confirm, setConfirm] = useState(null); // null | id
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [form,    setForm]    = useState(EMPTY_PROJECT);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY_PROJECT); setModal({ mode: 'add' }); }
  function openEdit(row) { setForm({ ...row, tags: row.tags || [] }); setModal({ mode: 'edit', id: row.id }); }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('projects').insert([{ ...form }]);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Project added'); setModal(null); load(); }
    } else {
      const { error } = await supabase.from('projects').update({ ...form }).eq('id', modal.id);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Project updated'); setModal(null); load(); }
    }
    setSaving(false);
  }

  async function del() {
    setDeleting(true);
    await supabase.from('projects').delete().eq('id', confirm);
    setConfirm(null); setDeleting(false);
    toast.show('Project deleted'); load();
  }

  async function toggleFeatured(row) {
    await supabase.from('projects').update({ featured: !row.featured }).eq('id', row.id);
    load();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Projects</h2>
        <button onClick={openAdd} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Add Project
        </button>
      </div>

      <Table headers={['Title', 'Status', 'Featured', 'Created', 'Actions']} loading={loading} empty={!loading && rows.length === 0}>
        {rows.map(row => (
          <Tr key={row.id}>
            <Td><span className="font-medium">{row.title}</span></Td>
            <Td><Badge color={row.status === 'completed' ? 'green' : 'orange'}>{row.status}</Badge></Td>
            <Td>
              <button onClick={() => toggleFeatured(row)} style={{ color: row.featured ? '#FFA000' : 'var(--mode-text-muted)' }}>
                {row.featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
              </button>
            </Td>
            <Td muted>{fmtDate(row.created_at)}</Td>
            <Td><ActionButtons onEdit={() => openEdit(row)} onDelete={() => setConfirm(row.id)} /></Td>
          </Tr>
        ))}
      </Table>

      {/* Add/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Project' : 'Edit Project'} wide>
        <div className="flex flex-col gap-4">
          <Field label="Title"><Input value={form.title} onChange={set('title')} placeholder="Project name" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="Short description" rows={2} /></Field>
          <Field label="Long Description"><Textarea value={form.long_description} onChange={set('long_description')} placeholder="Full description for modal view" rows={4} /></Field>
          <Field label="Tags"><TagInput tags={form.tags || []} onChange={set('tags')} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Live URL"><Input value={form.live_url} onChange={set('live_url')} placeholder="https://..." /></Field>
            <Field label="GitHub URL"><Input value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/..." /></Field>
          </div>
          <Field label="Image URL"><Input value={form.image_url} onChange={set('image_url')} placeholder="https://..." /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => set('status')(e.target.value)}
                className="glass-input text-sm"
              >
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </Field>
            <Field label="Featured">
              <div className="flex items-center h-10">
                <Toggle checked={form.featured} onChange={set('featured')} label={form.featured ? 'Featured' : 'Not featured'} />
              </div>
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(null)} className="glass-button px-4 py-2 text-sm">Cancel</button>
            <button
              onClick={save}
              disabled={saving}
              className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {saving ? <Spinner size={14} /> : <Save size={14} />}
              {modal?.mode === 'add' ? 'Add Project' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} loading={deleting}
        title="Delete Project"
        description="This will permanently delete the project and cannot be undone."
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — BLOG POSTS
   ═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_POST = { title: '', excerpt: '', cover_image: '', type: 'internal', external_url: '', content: '', tags: [], published: false };

function BlogTab({ toast }) {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form,     setForm]     = useState(EMPTY_POST);
  const [preview,  setPreview]  = useState(false);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('blog_posts').insert([{ ...form }]);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Post created'); setModal(null); load(); }
    } else {
      const { error } = await supabase.from('blog_posts').update({ ...form }).eq('id', modal.id);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Post updated'); setModal(null); load(); }
    }
    setSaving(false);
  }

  async function del() {
    setDeleting(true);
    await supabase.from('blog_posts').delete().eq('id', confirm);
    setConfirm(null); setDeleting(false);
    toast.show('Post deleted'); load();
  }

  async function togglePublished(row) {
    await supabase.from('blog_posts').update({ published: !row.published }).eq('id', row.id);
    load();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Blog Posts</h2>
        <button onClick={() => { setForm(EMPTY_POST); setModal({ mode: 'add' }); setPreview(false); }} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Add Post
        </button>
      </div>

      <Table headers={['Title', 'Type', 'Published', 'Created', 'Actions']} loading={loading} empty={!loading && rows.length === 0}>
        {rows.map(row => (
          <Tr key={row.id}>
            <Td><span className="font-medium">{row.title}</span></Td>
            <Td><Badge color={row.type === 'external' ? 'orange' : 'primary'}>{row.type}</Badge></Td>
            <Td>
              <button onClick={() => togglePublished(row)}>
                <Toggle checked={row.published} onChange={() => togglePublished(row)} />
              </button>
            </Td>
            <Td muted>{fmtDate(row.created_at)}</Td>
            <Td><ActionButtons onEdit={() => { setForm({ ...row, tags: row.tags || [] }); setModal({ mode: 'edit', id: row.id }); setPreview(false); }} onDelete={() => setConfirm(row.id)} /></Td>
          </Tr>
        ))}
      </Table>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Post' : 'Edit Post'} wide>
        <div className="flex flex-col gap-4">
          <Field label="Title"><Input value={form.title} onChange={set('title')} placeholder="Post title" /></Field>
          <Field label="Excerpt"><Textarea value={form.excerpt} onChange={set('excerpt')} placeholder="Short excerpt shown on blog list" rows={2} /></Field>
          <Field label="Cover Image URL"><Input value={form.cover_image} onChange={set('cover_image')} placeholder="https://..." /></Field>

          {/* Type toggle */}
          <Field label="Type">
            <div className="flex gap-3">
              {['internal','external'].map(t => (
                <button
                  key={t}
                  onClick={() => set('type')(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: form.type === t ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.type === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: form.type === t ? 'var(--color-primary)' : 'var(--mode-text-muted)',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </Field>

          {form.type === 'external' && (
            <Field label="External URL"><Input value={form.external_url} onChange={set('external_url')} placeholder="https://..." /></Field>
          )}

          {form.type === 'internal' && (
            <Field label="Content">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setPreview(false)}
                  className="text-xs px-3 py-1 rounded-lg transition-all"
                  style={{ background: !preview ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.05)', color: !preview ? 'var(--color-primary)' : 'var(--mode-text-muted)', border: '1px solid var(--color-border)' }}
                >
                  Write
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className="text-xs px-3 py-1 rounded-lg transition-all"
                  style={{ background: preview ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.05)', color: preview ? 'var(--color-primary)' : 'var(--mode-text-muted)', border: '1px solid var(--color-border)' }}
                >
                  Preview
                </button>
              </div>
              {preview ? (
                <div
                  className="rounded-xl p-4 text-sm min-h-[120px] prose-forge"
                  style={{ background: 'rgba(var(--color-primary-rgb),0.04)', border: '1px solid var(--color-border)', color: 'var(--mode-text)', fontFamily: 'Inter,sans-serif', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                >
                  {form.content || <span style={{ color: 'var(--mode-text-muted)' }}>Nothing to preview yet.</span>}
                </div>
              ) : (
                <Textarea value={form.content} onChange={set('content')} placeholder="Write your post in Markdown..." rows={8} />
              )}
            </Field>
          )}

          <Field label="Tags"><TagInput tags={form.tags || []} onChange={set('tags')} /></Field>
          <Toggle checked={form.published} onChange={set('published')} label="Published" />

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(null)} className="glass-button px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving ? <Spinner size={14} /> : <Save size={14} />}
              {modal?.mode === 'add' ? 'Create Post' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} loading={deleting} title="Delete Post" description="This will permanently delete the blog post." />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — SKILLS
   ═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_SKILL = { name: '', category: '', icon_url: '', proficiency_level: 80 };

function SkillsTab({ toast }) {
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_SKILL);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const categories = [...new Set(rows.map(r => r.category).filter(Boolean))];

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('skills').select('*').order('category');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('skills').insert([{ ...form }]);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Skill added'); setModal(null); load(); }
    } else {
      const { error } = await supabase.from('skills').update({ ...form }).eq('id', modal.id);
      if (error) { toast.show(error.message, 'error'); }
      else        { toast.show('Skill updated'); setModal(null); load(); }
    }
    setSaving(false);
  }

  async function del() {
    setDeleting(true);
    await supabase.from('skills').delete().eq('id', confirm);
    setConfirm(null); setDeleting(false);
    toast.show('Skill deleted'); load();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Skills</h2>
        <button onClick={() => { setForm(EMPTY_SKILL); setModal({ mode: 'add' }); }} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Add Skill
        </button>
      </div>

      <Table headers={['Name', 'Category', 'Proficiency', 'Actions']} loading={loading} empty={!loading && rows.length === 0}>
        {rows.map(row => (
          <Tr key={row.id}>
            <Td><span className="font-medium">{row.name}</span></Td>
            <Td><Badge color="muted">{row.category || '—'}</Badge></Td>
            <Td>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full max-w-[120px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.proficiency_level}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--mode-text-muted)' }}>{row.proficiency_level}%</span>
              </div>
            </Td>
            <Td><ActionButtons onEdit={() => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); }} onDelete={() => setConfirm(row.id)} /></Td>
          </Tr>
        ))}
      </Table>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Skill' : 'Edit Skill'}>
        <div className="flex flex-col gap-4">
          <Field label="Skill Name"><Input value={form.name} onChange={set('name')} placeholder="e.g. React" /></Field>

          <Field label="Category">
            <div className="flex flex-col gap-2">
              <Input value={form.category} onChange={set('category')} placeholder="e.g. Frontend" />
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button key={c} onClick={() => set('category')(c)}
                      className="text-xs px-2.5 py-1 rounded-full transition-all"
                      style={{ background: form.category === c ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.06)', color: form.category === c ? 'var(--color-primary)' : 'var(--mode-text-muted)', border: '1px solid var(--color-border)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="Icon URL (optional)"><Input value={form.icon_url} onChange={set('icon_url')} placeholder="https://..." /></Field>

          <Field label={`Proficiency — ${form.proficiency_level}%`}>
            <div className="flex flex-col gap-2">
              <input
                type="range" min={0} max={100}
                value={form.proficiency_level}
                onChange={e => set('proficiency_level')(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${form.proficiency_level}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
              </div>
            </div>
          </Field>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(null)} className="glass-button px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving ? <Spinner size={14} /> : <Save size={14} />}
              {modal?.mode === 'add' ? 'Add Skill' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} loading={deleting} title="Delete Skill" description="This will permanently delete this skill." />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — MESSAGES
   ═══════════════════════════════════════════════════════════════════════════ */

function MessagesTab({ toast, onUnreadCount }) {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    onUnreadCount((data || []).filter(r => !r.read).length);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(row) {
    await supabase.from('messages').update({ read: !row.read }).eq('id', row.id);
    load();
  }

  async function del() {
    setDeleting(true);
    await supabase.from('messages').delete().eq('id', confirm);
    setConfirm(null); setDeleting(false);
    if (selected?.id === confirm) setSelected(null);
    toast.show('Message deleted'); load();
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Messages</h2>

      <Table headers={['Name', 'Email', 'Subject', 'Date', 'Status', 'Actions']} loading={loading} empty={!loading && rows.length === 0}>
        {rows.map(row => (
          <Tr key={row.id} clickable onClick={() => setSelected(row)}>
            <Td>
              <span className="font-medium flex items-center gap-2">
                {!row.read && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-primary)' }} />}
                {row.name}
              </span>
            </Td>
            <Td muted>{row.email}</Td>
            <Td>{row.subject}</Td>
            <Td muted>{fmtDate(row.created_at)}</Td>
            <Td><Badge color={row.read ? 'muted' : 'primary'}>{row.read ? 'Read' : 'Unread'}</Badge></Td>
            <Td>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => toggleRead(row)}
                  className="p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{ color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb),0.08)' }}
                  title={row.read ? 'Mark unread' : 'Mark read'}
                >
                  {row.read ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => setConfirm(row.id)}
                  className="p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{ color: '#FF4D6D', background: 'rgba(255,77,109,0.08)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      {/* Message detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Message" wide>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[['From', selected.name], ['Email', selected.email], ['Subject', selected.subject], ['Date', fmtDate(selected.created_at)]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk,sans-serif' }}>{l}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="h-px" style={{ background: 'var(--color-border)' }} />
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk,sans-serif' }}>Message</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--mode-text)', fontFamily: 'Inter,sans-serif' }}>{selected.message}</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => { toggleRead(selected); setSelected(null); }} className="glass-button flex items-center gap-2 px-4 py-2 text-sm">
                {selected.read ? <EyeOff size={14} /> : <Eye size={14} />}
                Mark as {selected.read ? 'Unread' : 'Read'}
              </button>
              <button onClick={() => { setConfirm(selected.id); setSelected(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: '#FF4D6D' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} loading={deleting} title="Delete Message" description="This will permanently delete this message." />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 5 — UPCOMING PROJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

function UpcomingTab({ toast }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').eq('status', 'upcoming').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markCompleted(id) {
    setMarking(id);
    await supabase.from('projects').update({ status: 'completed' }).eq('id', id);
    toast.show('Marked as completed!');
    setMarking(null); load();
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>
        Upcoming Projects <Badge color="orange">{rows.length}</Badge>
      </h2>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={24} /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-14" style={{ color: 'var(--mode-text-muted)' }}>
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No upcoming projects. Add one from the Projects tab.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(row => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>{row.title}</h3>
                <Badge color="orange">Upcoming</Badge>
              </div>
              {row.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter,sans-serif' }}>{row.description}</p>
              )}
              {row.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {row.tags.map(t => <Badge key={t} color="muted">{t}</Badge>)}
                </div>
              )}
              <button
                onClick={() => markCompleted(row.id)}
                disabled={marking === row.id}
                className="glass-button glass-button--primary flex items-center justify-center gap-2 py-2 text-sm mt-1"
              >
                {marking === row.id ? <Spinner size={14} /> : <CheckCircle size={14} />}
                Mark as Completed
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 6 — THEME MANAGER
   ═══════════════════════════════════════════════════════════════════════════ */

function ThemeTab({ toast }) {
  const { activeTheme, setActiveTheme, themeMeta } = useTheme();
  const [saving, setSaving] = useState(null);

  async function applyTheme(key) {
    setSaving(key);
    await setActiveTheme(key);
    toast.show(`Theme switched to ${themeMeta[key].label}`);
    setSaving(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Theme Manager</h2>
        <p className="text-sm" style={{ color: 'var(--mode-text-muted)' }}>Changes apply instantly site-wide and are saved to Supabase.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(themeMeta).map(([key, meta]) => {
          const isActive = key === activeTheme;
          return (
            <motion.button
              key={key}
              onClick={() => applyTheme(key)}
              disabled={saving === key}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-5 text-left flex flex-col gap-4 relative overflow-hidden transition-all"
              style={{
                border: isActive ? `1px solid ${meta.primary}` : undefined,
                boxShadow: isActive ? `0 0 24px ${meta.primary}33` : undefined,
              }}
            >
              {/* Active badge */}
              {isActive && (
                <span
                  className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${meta.primary}22`, color: meta.primary, border: `1px solid ${meta.primary}55` }}
                >
                  Active
                </span>
              )}

              {/* Colour dots */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full" style={{ background: meta.primary, boxShadow: `0 0 16px ${meta.primary}88` }} />
                  <div className="w-6 h-6 rounded-full absolute -bottom-1 -right-1 border-2" style={{ background: meta.accent, borderColor: 'var(--color-bg-dark)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>{meta.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--mode-text-muted)' }}>{meta.primary}</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter,sans-serif' }}>{meta.description}</p>

              <div
                className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? `${meta.primary}18` : 'rgba(255,255,255,0.05)',
                  color: isActive ? meta.primary : 'var(--mode-text-muted)',
                  border: `1px solid ${isActive ? meta.primary + '44' : 'transparent'}`,
                }}
              >
                {saving === key ? <Spinner size={12} /> : isActive ? <Check size={12} /> : <Palette size={12} />}
                {saving === key ? 'Applying...' : isActive ? 'Currently Active' : 'Apply Theme'}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 7 — ABOUT ME
   ═══════════════════════════════════════════════════════════════════════════ */

const ABOUT_ICON_OPTIONS = ['Globe', 'Monitor', 'BarChart2', 'Plug', 'Code', 'Cpu', 'Database', 'Layers', 'Smartphone', 'Server'];

function AboutTab({ toast }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('site_content').select('*');
    const map = {};
    (data || []).forEach(row => { map[row.key] = row.value; });
    setContent(map);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const set = key => val => setContent(c => ({ ...c, [key]: val }));

  async function saveAll() {
    setSaving(true);
    const upserts = Object.entries(content).map(([key, value]) => ({ key, value: value ?? '' }));
    const { error } = await supabase.from('site_content').upsert(upserts, { onConflict: 'key' });
    if (error) { toast.show(error.message, 'error'); }
    else        { toast.show('About section saved!'); }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>About Me</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--mode-text-muted)' }}>Edit the About section content. Click Save All when done.</p>
        </div>
        <button onClick={saveAll} disabled={saving} className="glass-button glass-button--primary flex items-center gap-2 px-4 py-2 text-sm">
          {saving ? <Spinner size={14} /> : <Save size={14} />}
          Save All
        </button>
      </div>

      {/* Profile */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>Profile</h3>
        <Field label="Profile Image URL">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Input value={content['about_image_url']} onChange={set('about_image_url')} placeholder="https://your-image-url.com/photo.jpg" />
            </div>
            {content['about_image_url'] && (
              <img
                src={content['about_image_url']}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        </Field>
        <Field label="Bio Text">
          <Textarea
            value={content['about_bio']}
            onChange={set('about_bio')}
            placeholder="Write your bio here..."
            rows={5}
          />
        </Field>
      </div>

      {/* What I Do Cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>"What I Do" Cards</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
                  Card {n}
                </span>
              </div>
              <Field label="Icon Name">
                <div className="flex flex-col gap-2">
                  <Input
                    value={content[`about_card_${n}_icon`]}
                    onChange={set(`about_card_${n}_icon`)}
                    placeholder="e.g. Globe"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ABOUT_ICON_OPTIONS.map(ic => (
                      <button
                        key={ic}
                        onClick={() => set(`about_card_${n}_icon`)(ic)}
                        className="text-xs px-2 py-0.5 rounded-full transition-all"
                        style={{
                          background: content[`about_card_${n}_icon`] === ic ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.05)',
                          color: content[`about_card_${n}_icon`] === ic ? 'var(--color-primary)' : 'var(--mode-text-muted)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
              <Field label="Title">
                <Input value={content[`about_card_${n}_title`]} onChange={set(`about_card_${n}_title`)} placeholder="e.g. Web Development" />
              </Field>
              <Field label="Description">
                <Textarea value={content[`about_card_${n}_desc`]} onChange={set(`about_card_${n}_desc`)} placeholder="One-line description" rows={2} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      {/* Save button — also at bottom for convenience */}
      <div className="flex justify-end">
        <button onClick={saveAll} disabled={saving} className="glass-button glass-button--primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
          {saving ? <Spinner size={14} /> : <Save size={14} />}
          Save All Changes
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW — STAT CARD PRIMITIVE
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, primary, primaryLabel, secondary, secondaryLabel, secondaryHighlight = false, color = 'primary', onClick }) {
  const isOrange   = color === 'orange';
  const iconBg     = isOrange ? 'rgba(255,160,0,0.12)'            : 'rgba(var(--color-primary-rgb),0.12)';
  const iconBorder = isOrange ? 'rgba(255,160,0,0.25)'            : 'rgba(var(--color-primary-rgb),0.25)';
  const iconColor  = isOrange ? '#FFA000'                         : 'var(--color-primary)';
  const numColor   = isOrange ? '#FFA000'                         : 'var(--color-primary)';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="glass-card p-5 flex flex-col gap-4 cursor-pointer"
      style={{ transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(var(--color-primary-rgb),0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-center gap-3">
        <div
          className="rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ width: 38, height: 38, background: iconBg, border: `1px solid ${iconBorder}` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <p className="font-semibold text-sm" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>{label}</p>
        <ExternalLink size={13} className="ml-auto" style={{ color: 'var(--mode-text-muted)', opacity: 0.4 }} />
      </div>

      <div className="flex items-center gap-8">
        <div>
          <p
            className="text-3xl font-bold leading-none"
            style={{ color: numColor, fontFamily: 'Space Grotesk,sans-serif', letterSpacing: '-0.02em' }}
          >
            {primary}
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--mode-text-muted)' }}>{primaryLabel}</p>
        </div>
        {secondary !== undefined && (
          <>
            <div className="w-px h-10 self-center" style={{ background: 'var(--color-border)' }} />
            <div>
              <p
                className="text-3xl font-bold leading-none"
                style={{
                  color: secondaryHighlight ? 'var(--color-primary)' : 'var(--mode-text)',
                  fontFamily: 'Space Grotesk,sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {secondary}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--mode-text-muted)' }}>{secondaryLabel}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 0 — OVERVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ onNavigate }) {
  const [stats,       setStats]       = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: totalProjects    },
        { count: featuredProjects },
        { count: totalSkills      },
        { data:  skillRows        },
        { count: totalMessages    },
        { count: unreadMessages   },
        { count: upcomingCount    },
        { count: totalPosts       },
        { count: publishedPosts   },
        { data:  lastPosts        },
      ] = await Promise.all([
        supabase.from('projects').select('*',  { count: 'exact', head: true }),
        supabase.from('projects').select('*',  { count: 'exact', head: true }).eq('featured', true),
        supabase.from('skills').select('*',    { count: 'exact', head: true }),
        supabase.from('skills').select('category'),
        supabase.from('messages').select('*',  { count: 'exact', head: true }),
        supabase.from('messages').select('*',  { count: 'exact', head: true }).eq('read', false),
        supabase.from('projects').select('*',  { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('blog_posts')
          .select('id,title,excerpt,published,created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const categories = [...new Set((skillRows || []).map(r => r.category).filter(Boolean))];

      setStats({
        totalProjects:    totalProjects    ?? 0,
        featuredProjects: featuredProjects ?? 0,
        totalSkills:      totalSkills      ?? 0,
        categoryCount:    categories.length,
        totalMessages:    totalMessages    ?? 0,
        unreadMessages:   unreadMessages   ?? 0,
        upcomingCount:    upcomingCount    ?? 0,
        totalPosts:       totalPosts       ?? 0,
        publishedPosts:   publishedPosts   ?? 0,
      });
      setRecentPosts(lastPosts || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={24} /></div>;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Overview</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--mode-text-muted)' }}>
          A snapshot of your portfolio content. Click any card to manage it.
        </p>
      </div>

      {/* Row 1 — Projects + Skills */}
      <div className="grid grid-cols-2 gap-5">
        <StatCard
          icon={LayoutGrid}
          label="Projects"
          primary={stats.totalProjects}
          primaryLabel="Total"
          secondary={stats.featuredProjects}
          secondaryLabel="Featured"
          onClick={() => onNavigate('projects')}
          style={{
            padding: '12px'
          }}
        />
        <StatCard
          icon={Zap}
          label="Skills"
          primary={stats.totalSkills}
          primaryLabel="Total"
          secondary={stats.categoryCount}
          secondaryLabel="Categories"
          onClick={() => onNavigate('skills')}
          style={{
            padding: '12px'
          }}
        />
      </div>

      {/* Row 2 — Blog Posts full width */}
      <div
        className="glass-card p-5 flex flex-col gap-4 cursor-pointer"
        onClick={() => onNavigate('blog')}
        style={{ transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(var(--color-primary-rgb),0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Blog section header */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ width: 38, height: 38, background: 'rgba(var(--color-primary-rgb),0.12)', border: '1px solid rgba(var(--color-primary-rgb),0.25)' }}
          >
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>Blog Posts</p>
            <p className="text-xs" style={{ color: 'var(--mode-text-muted)' }}>
              {stats.publishedPosts} published · {stats.totalPosts} total
            </p>
          </div>
          <ExternalLink size={13} className="ml-auto" style={{ color: 'var(--mode-text-muted)', opacity: 0.4 }} />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* Recent post mini-cards */}
        {recentPosts.length === 0 ? (
          <div
            className="text-center py-7 text-sm rounded-xl"
            style={{ color: 'var(--mode-text-muted)', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--color-border)' }}
          >
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recentPosts.map(post => (
              <div
                key={post.id}
                className="flex flex-col gap-2.5 rounded-xl p-4"
                style={{ background: 'rgba(var(--color-primary-rgb),0.04)', border: '1px solid var(--color-border)' }}
              >
                <p
                  className="font-medium text-sm leading-snug"
                  style={{
                    color: 'var(--mode-text)',
                    fontFamily: 'Space Grotesk,sans-serif',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.title}
                </p>
                {post.excerpt && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: 'var(--mode-text-muted)',
                      fontFamily: 'Inter,sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <Badge color={post.published ? 'green' : 'muted'}>{post.published ? 'Published' : 'Draft'}</Badge>
                  <span className="text-xs" style={{ color: 'var(--mode-text-muted)' }}>{fmtDate(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 3 — Messages + Upcoming */}
      <div className="grid grid-cols-2 gap-5">
        <StatCard
          icon={MessageSquare}
          label="Messages"
          primary={stats.totalMessages}
          primaryLabel="Total"
          secondary={stats.unreadMessages}
          secondaryLabel="Unread"
          secondaryHighlight={stats.unreadMessages > 0}
          onClick={() => onNavigate('messages')}
          style={{
            padding: '12px'
          }}
        />
        <StatCard
          icon={Clock}
          label="Upcoming Projects"
          primary={stats.upcomingCount}
          primaryLabel="Pending"
          color="orange"
          onClick={() => onNavigate('upcoming')}
          style={{
            padding: '12px'
          }}
        />
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR NAV
   ═══════════════════════════════════════════════════════════════════════════ */

function SidebarItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center text-left relative transition-all"
      style={{
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 500,
        background: active ? 'rgba(var(--color-primary-rgb),0.12)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--mode-text-muted)',
        border: `1px solid ${active ? 'rgba(var(--color-primary-rgb),0.25)' : 'transparent'}`,
        boxShadow: active ? '0 0 12px rgba(var(--color-primary-rgb),0.08)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.06)';
          e.currentTarget.style.color = 'var(--mode-text)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--mode-text-muted)';
        }
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'Space Grotesk,sans-serif' }}>{label}</span>
      {badge > 0 && (
        <span
          className="ml-auto text-xs font-bold rounded-full flex items-center justify-center"
          style={{
            width: 20, height: 20,
            background: 'var(--color-primary)', color: 'var(--color-bg-dark)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CV / RESUME TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function CvTab({ toast }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'cv_url')
      .single()
      .then(({ data }) => {
        if (data?.value) setCurrentUrl(data.value);
        setLoading(false);
      });
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.show('Only PDF files are allowed.', 'error');
      e.target.value = '';
      return;
    }
    setUploading(true);
    const fileName = `cv_${Date.now()}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('cv')
      .upload(fileName, file, { upsert: true, contentType: 'application/pdf' });
    if (uploadErr) {
      toast.show('Upload failed: ' + uploadErr.message, 'error');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('cv').getPublicUrl(fileName);
    const { error: dbErr } = await supabase
      .from('site_settings')
      .upsert({ key: 'cv_url', value: publicUrl }, { onConflict: 'key' });
    if (dbErr) {
      toast.show('File uploaded but URL not saved: ' + dbErr.message, 'error');
    } else {
      setCurrentUrl(publicUrl);
      toast.show('CV updated successfully!', 'success');
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleRemove() {
    const { error: dbErr } = await supabase
      .from('site_settings')
      .upsert({ key: 'cv_url', value: '' }, { onConflict: 'key' });
    if (dbErr) {
      toast.show('Failed to remove CV: ' + dbErr.message, 'error');
    } else {
      setCurrentUrl('');
      toast.show('CV removed.', 'success');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Resume / CV</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--mode-text-muted)' }}>Upload a PDF — the Download CV button on the homepage will link directly to it.</p>
      </div>

      {/* Current CV */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ background: 'rgba(var(--color-primary-rgb),0.04)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>Current CV</p>
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--mode-text-muted)' }}><Spinner /> Loading&hellip;</div>
        ) : currentUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}
            >
              <Download size={14} />
              View current CV
            </a>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#FF4D6D', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)' }}
            >
              <Trash2Alt size={13} /> Remove
            </button>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--mode-text-muted)' }}>No CV uploaded yet.</p>
        )}
      </div>

      {/* Upload new CV */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ background: 'rgba(var(--color-primary-rgb),0.04)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--mode-text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>Upload New CV</p>
        <p className="text-xs" style={{ color: 'var(--mode-text-muted)' }}>PDF only &middot; max 10 MB &middot; uploading a new file replaces the old one on the site immediately.</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 self-start px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
          style={{
            background: uploading ? 'rgba(var(--color-primary-rgb),0.1)' : 'rgba(var(--color-primary-rgb),0.15)',
            border: '1px solid rgba(var(--color-primary-rgb),0.35)',
            color: 'var(--color-primary)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? <><Spinner size={14} /> Uploading&hellip;</> : <><FileUp size={15} /> Choose PDF</>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD ROOT
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'overview',  label: 'Overview',           icon: Home          },
  { id: 'projects',  label: 'Projects',          icon: LayoutGrid    },
  { id: 'blog',      label: 'Blog Posts',         icon: FileText      },
  { id: 'skills',    label: 'Skills',             icon: Zap           },
  { id: 'messages',  label: 'Messages',           icon: MessageSquare },
  { id: 'upcoming',  label: 'Upcoming',           icon: Clock         },
  { id: 'theme',     label: 'Theme Manager',      icon: Palette       },
  { id: 'about',     label: 'About Me',           icon: User          },
  { id: 'cv',        label: 'Resume / CV',        icon: FileUp        },
];

export default function AdminDashboard() {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  async function logout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  const tabProps = { toast };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-bg-dark)', color: 'var(--mode-text)' }}
    >
      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className="fixed lg:sticky top-0 h-screen z-50 lg:z-auto flex flex-col"
        style={{
          width: 272,
          background: 'rgba(var(--color-primary-rgb),0.03)',
          borderRight: '1px solid var(--color-border)',
          backdropFilter: 'blur(16px)',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center"
          style={{
            padding: '20px 20px',
            gap: 12,
            borderBottom: '1px solid var(--color-border)',
            minHeight: 72,
          }}
        >
          <div
            className="rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              width: 36, height: 36,
              background: 'rgba(var(--color-primary-rgb),0.15)',
              border: '1px solid rgba(var(--color-primary-rgb),0.3)',
            }}
          >
            <Zap size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              className="font-bold leading-none"
              style={{
                color: 'var(--mode-text)',
                fontFamily: 'Space Grotesk,sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '-0.01em',
              }}
            >
              Neural Forge
            </p>
            <p
              style={{
                color: 'var(--mode-text-muted)',
                fontSize: '0.7rem',
                marginTop: 4,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Admin Console
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: '16px 12px', gap: 4 }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--mode-text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              padding: '6px 14px 10px',
              opacity: 0.7,
            }}
          >
            Manage
          </p>
          {TABS.map(tab => (
            <SidebarItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              badge={tab.id === 'messages' ? unreadCount : 0}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            />
          ))}
        </nav>

        {/* Footer actions */}
        <div
          className="flex flex-col"
          style={{
            padding: '12px',
            gap: 4,
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center text-left transition-all"
            style={{
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: '0.875rem',
              color: 'var(--mode-text-muted)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.08)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--mode-text-muted)';
            }}
          >
            <Home size={17} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: 'Space Grotesk,sans-serif', flex: 1 }}>View Site</span>
            <ExternalLink size={13} style={{ opacity: 0.5 }} />
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center text-left transition-all"
            style={{
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: '0.875rem',
              color: '#FF4D6D',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,77,109,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={17} />
            <span style={{ fontFamily: 'Space Grotesk,sans-serif' }}>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-w-0 lg:ml-0"
        style={{
          marginLeft: 0,
          background: 'rgba(5, 11, 26, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Top bar (mobile) */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)', background: 'rgba(var(--color-primary-rgb),0.03)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ color: 'var(--mode-text-muted)' }}>
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk,sans-serif' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </span>
          <div className="w-9" />
        </div>

        {/* Top bar (desktop) */}
        <div
          className="sticky top-0 z-30 hidden lg:flex items-center justify-between"
          style={{
            height: 64,
            padding: '0 32px',
            borderBottom: '1px solid var(--color-border)',
            background: 'rgba(5, 11, 26, 0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--mode-text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                opacity: 0.7,
              }}
            >
              Admin / Manage
            </p>
            <h1
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--mode-text)',
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center transition-all"
            style={{
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--mode-text-muted)',
              background: 'rgba(var(--color-primary-rgb),0.06)',
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.12)';
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb),0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(var(--color-primary-rgb),0.06)';
              e.currentTarget.style.color = 'var(--mode-text-muted)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <Home size={14} />
            <span>View Site</span>
            <ExternalLink size={12} style={{ opacity: 0.5 }} />
          </a>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
              style={{
                  padding: '20px 32px',
              }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="max-w-5xl mx-auto"
            >
              {activeTab === 'overview'  && <OverviewTab  onNavigate={setActiveTab} />}
              {activeTab === 'projects'  && <ProjectsTab {...tabProps} />}
              {activeTab === 'blog'      && <BlogTab     {...tabProps} />}
              {activeTab === 'skills'    && <SkillsTab   {...tabProps} />}
              {activeTab === 'messages'  && <MessagesTab {...tabProps} onUnreadCount={setUnreadCount} />}
              {activeTab === 'upcoming'  && <UpcomingTab {...tabProps} />}
              {activeTab === 'about'     && <AboutTab    {...tabProps} />}
              {activeTab === 'cv'         && <CvTab       {...tabProps} />}
              {activeTab === 'theme'     && <ThemeTab    {...tabProps} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toast.el}
    </div>
  );
}