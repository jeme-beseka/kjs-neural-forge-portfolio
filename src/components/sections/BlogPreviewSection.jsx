// src/components/sections/BlogPreviewSection.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ExternalLink, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function readTime(content) {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <div className="skeleton h-44 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded mt-2" />
      </div>
    </div>
  );
}

/* ─── Blog card ───────────────────────────────────────────────────────────── */
function BlogCard({ post, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const navigate = useNavigate();

  function handleClick() {
    if (post.type === 'external' && post.external_url) {
      window.open(post.external_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/blog/${post.id}`);
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      className="glass-card overflow-hidden flex flex-col cursor-pointer group"
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
    >
      {/* Cover image */}
      <div
        className="relative overflow-hidden"
        style={{ height: '180px', background: 'rgba(var(--color-primary-rgb), 0.06)' }}
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder gradient when no image */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(var(--color-primary-rgb),0.08) 0%, rgba(var(--color-accent-rgb),0.06) 100%)`,
            }}
          >
            <span
              className="text-4xl font-bold opacity-10"
              style={{ color: 'var(--color-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {post.title?.[0] ?? 'N'}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(var(--color-bg-dark, 5,11,26),0.7) 0%, transparent 60%)',
          }}
        />

        {/* External badge */}
        {post.type === 'external' && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(255,160,0,0.15)',
              border: '1px solid rgba(255,160,0,0.4)',
              color: '#FFA000',
            }}
          >
            <ExternalLink size={10} />
            External
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(var(--color-primary-rgb), 0.08)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-bold text-base leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-200 line-clamp-2"
          style={{ color: 'var(--mode-text)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--mode-text-muted)', fontFamily: 'Inter, sans-serif' }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Footer meta */}
        <div
          className="flex items-center gap-3 mt-auto pt-3"
          style={{ borderTop: '1px solid rgba(var(--color-primary-rgb), 0.08)', color: 'var(--mode-text-muted)' }}
        >
          <span className="flex items-center gap-1.5 text-xs">
            <Calendar size={11} />
            {fmtDate(post.created_at)}
          </span>
          {post.type === 'internal' && (
            <span className="flex items-center gap-1.5 text-xs">
              <Clock size={11} />
              {readTime(post.content)}
            </span>
          )}
          <motion.span
            className="ml-auto flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--color-primary)' }}
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {post.type === 'external' ? 'Read →' : 'Read more →'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
export default function BlogPreviewSection() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const headingRef = useRef(null);
  const inView     = useInView(headingRef, { once: true, margin: '-80px' });
  const navigate   = useNavigate();

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, cover_image, type, external_url, tags, content, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      setPosts(data || []);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // Don't render the section at all if no posts and not loading
  if (!loading && posts.length === 0) return null;

  return (
    <section
      id="blog-preview"
      className="relative py-20 md:py-28"
      style={{ background: 'transparent' }}
    >
      {/* Subtle divider glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(var(--color-primary-rgb),0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading row */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              — Latest articles
            </p>
            <h2
              className="section-heading text-4xl md:text-5xl font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--mode-text)' }}
            >
              From the Blog
            </h2>
          </div>

          <motion.button
            onClick={() => navigate('/blog')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="glass-button flex items-center gap-2 px-5 py-2.5 text-sm self-start sm:self-auto flex-shrink-0"
          >
            View All Posts
            <ArrowRight size={15} />
          </motion.button>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
