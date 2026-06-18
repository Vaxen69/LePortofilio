// Variation 2 — Soft Cool
// Cool neutral grays with a single indigo accent. Asymmetric hero,
// rounded card-based projects with hover lift. Approachable + premium.

// Reveal: IntersectionObserver-based animated reveal with variants.
// Variants: 'up' (default), 'left', 'right', 'scale', 'blur', 'slide-bg'.
const Reveal = ({ children, delay = 0, variant = 'up', y = 28, as: Tag = 'div', style = {}, ...rest }) => {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const r = el.getBoundingClientRect();
    // Reveal immediately if at least partially within the top 70% of the viewport on load.
    if (r.top < window.innerHeight * 0.7) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const hidden = {
    up:    { opacity: 0, transform: `translateY(${y}px)` },
    down:  { opacity: 0, transform: `translateY(-${y}px)` },
    left:  { opacity: 0, transform: 'translateX(-40px)' },
    right: { opacity: 0, transform: 'translateX(40px)' },
    scale: { opacity: 0, transform: 'scale(0.94)' },
    blur:  { opacity: 0, filter: 'blur(8px)', transform: 'translateY(12px)' },
    tilt:  { opacity: 0, transform: 'perspective(900px) rotateX(14deg) translateY(20px)' },
    flip:  { opacity: 0, transform: 'perspective(900px) rotateY(-22deg) translateX(40px)' },
    zoom:  { opacity: 0, transform: 'scale(1.08)' },
    rise:  { opacity: 0, transform: `translateY(${y + 16}px) scale(0.97)` },
    pop:   { opacity: 0, transform: 'scale(0.4)' },
  }[variant] || { opacity: 0, transform: `translateY(${y}px)` };
  const visible = { opacity: 1, transform: 'translate(0,0) scale(1) perspective(900px) rotateX(0) rotateY(0)', filter: 'blur(0)' };
  const dur = variant === 'blur' ? 900 : (variant === 'flip' || variant === 'tilt' ? 850 : (variant === 'pop' ? 500 : 750));
  // 'pop' : courbe avec léger dépassement pour un effet rebond
  const curve = variant === 'pop' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)';
  return (
    <Tag ref={ref} style={{
      ...style,
      ...(shown ? visible : hidden),
      transition: `opacity ${dur}ms ${curve} ${delay}ms, transform ${dur}ms ${curve} ${delay}ms, filter ${dur}ms ease ${delay}ms`,
      willChange: 'opacity, transform, filter',
    }} {...rest}>{children}</Tag>
  );
};

// AnimatedCount: counts from 0 to `to` once it scrolls into view.
// Mutates DOM via ref instead of useState to avoid forcing parent re-renders.
const AnimatedCount = ({ to = 0, suffix = '', duration = 1400, style }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let started = false, raf = 0, t0 = 0;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      el.textContent = Math.round(ease(p) * to) + suffix;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    el.textContent = '0' + suffix;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started) { started = true; raf = requestAnimationFrame(tick); io.disconnect(); }
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [to, suffix, duration]);
  return <span ref={ref} style={style}>0{suffix}</span>;
};

// BackToTop: floating round button, fades in past `threshold` px of scroll.
// All state mutated via DOM (no React re-renders on scroll).
const BackToTop = ({ accent = '#4F46E5', threshold = 600 }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const visible = window.scrollY > threshold;
      el.style.opacity = visible ? '1' : '0';
      el.style.pointerEvents = visible ? 'auto' : 'none';
      el.style.transform = visible ? 'translateY(0)' : 'translateY(12px)';
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [threshold]);
  return (
    <button ref={ref} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 50,
      width: 46, height: 46, borderRadius: '50%', border: 'none',
      background: accent, color: '#fff', fontSize: 20, lineHeight: 1, cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(79,70,229,0.35)',
      opacity: 0, pointerEvents: 'none', transform: 'translateY(12px)',
      transition: 'opacity .25s, transform .25s, box-shadow .25s',
    }}>↑</button>
  );
};

// useScrollSpy: imperatively highlights nav links matching the section
// currently in view. Pure DOM mutation — no parent re-renders during scroll.
const useScrollSpy = (sectionIds, accent) => {
  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set();
    const setActive = (id) => {
      document.querySelectorAll('nav a[data-spy]').forEach((a) => {
        const isActive = a.getAttribute('data-spy') === id;
        a.style.color = isActive ? accent : '';
        a.style.fontWeight = isActive ? '600' : '';
      });
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      }
      const first = sectionIds.find((id) => visible.has(id));
      if (first) setActive(first);
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sectionIds.join('|'), accent]);
};

// Parallax: translate Y based on scroll, scoped to the element's offset.
// Mutates the DOM directly via ref to avoid triggering React re-renders on
// every scroll (which would remount the whole subtree and reset Reveal state).
const useParallax = (speed = 0.15) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const offset = (center - window.innerHeight / 2) * -speed;
      el.style.transform = `translateY(${offset}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);
  return ref;
};

// ParticlesBg: full-viewport canvas drawing a slowly drifting constellation of
// indigo dots and connecting lines. Particles near the cursor are gently
// repelled. Pure DOM/canvas, no React re-renders.
const ParticlesBg = ({ color = '79, 70, 229' }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let parts = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      const N = Math.min(80, Math.floor(w * h / 22000));
      parts = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.4,
      }));
    };
    resize();

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);

    let raf = 0;
    const tick = () => {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = (130 - d) / 130;
          p.vx += (dx / d) * f * 0.05;
          p.vy += (dy / d) * f * 0.05;
        }
        p.vx *= 0.985; p.vy *= 0.985;
        p.vx += (Math.random() - 0.5) * 0.006;
        p.vy += (Math.random() - 0.5) * 0.006;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        if (p.y > h + 12) p.y = -12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.fill();
      }
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 135 * 135) {
            const alpha = (1 - Math.sqrt(d2) / 135) * 0.32;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [color]);

  // Portal the canvas directly into <body> so it sits in the body's stacking
  // context (between body background and content). z-index:-1 so static
  // content paints on top of it; transparent root keeps canvas visible.
  return ReactDOM.createPortal(
    <canvas ref={ref} aria-hidden="true" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: -1, pointerEvents: 'none',
    }} />,
    document.body
  );
};

// useMedia : suit une media query (responsive, les styles étant inline).
const useMedia = (query) => {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

const SoftCool = ({ lang = 'fr', setLang = () => {} }) => {
  const c = window.PORTFOLIO_CONTENT[lang];
  const isMobile = useMedia('(max-width: 768px)');
  const [openProject, setOpenProject] = React.useState(null);
  const project = openProject ? c.projects.items.find((p) => p.id === openProject) : null;

  // Fiche projet synchronisée avec le hash : URL partageable (#projet-id),
  // bouton retour du navigateur et touche Échap ferment la fiche.
  const openProjectById = (id) => {
    setOpenProject(id);
    window.history.pushState(null, '', `#projet-${id}`);
  };
  const closeProject = () => {
    setOpenProject(null);
    if (/^#projet-/.test(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };
  React.useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#projet-(.+)$/);
      setOpenProject(m ? decodeURIComponent(m[1]) : null);
    };
    fromHash(); // permet d'arriver directement sur une fiche via l'URL
    window.addEventListener('popstate', fromHash);
    return () => window.removeEventListener('popstate', fromHash);
  }, []);
  React.useEffect(() => {
    if (!openProject) return;
    const onKey = (e) => { if (e.key === 'Escape') closeProject(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // fige la page derrière la fiche
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [openProject]);

  // Hero blob parallax (transform is applied directly via ref — see useParallax)
  const blobRef = useParallax(0.25);

  const accent = '#4F46E5';

  // Highlight nav link of the section currently in view (DOM-only, no re-renders)
  useScrollSpy(Object.values(c.nav), accent);
  const styles = {
    root: {
      width: '100%',
      minHeight: '100%',
      background: 'transparent',
      color: '#0f172a',
      fontFamily: '"Inter Tight", -apple-system, BlinkMacSystemFont, sans-serif',
      letterSpacing: '-0.011em',
      WebkitFontSmoothing: 'antialiased',
    },
    mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.04em' },
    container: { maxWidth: 1120, margin: '0 auto', padding: isMobile ? '0 20px' : '0 56px' },
    card: { background: '#ffffff', borderRadius: 18, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' },
    pill: { display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: '#eef0f4', color: '#475569', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.02em' },
    sectionEyebrow: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: accent },
    dot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: accent },
  };

  const NavBar = ({ lang, setLang }) => (
    <nav style={{ position: 'sticky', top: 12, zIndex: 10, padding: isMobile ? '0 10px' : '0 56px', marginBottom: -52 }}>
      <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '10px 14px' : '12px 20px', maxWidth: 1120, margin: '0 auto', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', boxShadow: '0 0 0 1.5px #fff, 0 0 0 3px ' + accent }}>
            <img src="assets/photo-roman-portrait.webp" alt="Roman Rodriguez" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%', display: 'block' }} />
          </span>
          Roman Rodriguez
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#475569' }}>
            {Object.values(c.nav).map((n) => (<a key={n} href={`#${n}`} data-spy={n} style={{ color: 'inherit', textDecoration: 'none', transition: 'color .2s, font-weight .2s' }}>{n}</a>))}
          </div>
        )}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <a href={c.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ width: 32, height: 32, borderRadius: 8, background: '#eef0f4', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background .2s, color .2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#eef0f4'; e.currentTarget.style.color = '#475569'; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
          </a>
          <a href={c.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ width: 32, height: 32, borderRadius: 8, background: '#eef0f4', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background .2s, color .2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#eef0f4'; e.currentTarget.style.color = '#475569'; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
          </a>
          <div style={{ display: 'inline-flex', background: '#eef0f4', borderRadius: 999, padding: 2, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.06em' }}>
            <button onClick={() => setLang('fr')} style={{ border: 'none', background: lang === 'fr' ? accent : 'transparent', color: lang === 'fr' ? '#fff' : '#475569', padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'uppercase' }}>FR</button>
            <button onClick={() => setLang('en')} style={{ border: 'none', background: lang === 'en' ? accent : 'transparent', color: lang === 'en' ? '#fff' : '#475569', padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'uppercase' }}>EN</button>
          </div>
        </div>
      </div>
    </nav>
  );

  const Hero = () => (
    <section style={{ padding: isMobile ? '120px 0 70px' : '160px 0 100px', position: 'relative', overflow: 'hidden' }}>
      {/* Parallax accent blob */}
      <div ref={blobRef} aria-hidden style={{
        position: 'absolute', top: '10%', right: '-10%', width: 520, height: 520,
        background: `radial-gradient(circle at center, ${accent}40, transparent 70%)`,
        filter: 'blur(40px)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 0, willChange: 'transform',
      }}></div>
      <div style={{ ...styles.container, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: isMobile ? 40 : 56, alignItems: 'center' }}>
          <Reveal>
            <div style={styles.sectionEyebrow}><span style={styles.dot}></span>{c.hero.kicker}</div>
            <h1 style={{ fontSize: isMobile ? 44 : 76, lineHeight: 1.02, fontWeight: 600, margin: '20px 0 24px', letterSpacing: '-0.03em' }}>
              {c.hero.name}.<br />
              <span style={{ color: '#64748b', fontWeight: 400 }}>{c.hero.role}.</span>
            </h1>
            <p style={{ fontSize: isMobile ? 16.5 : 19, lineHeight: 1.55, color: '#334155', margin: 0, maxWidth: 580 }}>{c.hero.tagline}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={`#${c.nav.projects}`} data-cta style={{ padding: '13px 22px', borderRadius: 12, background: accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.hero.cta1} →</a>
              <a href="assets/cv-roman-rodriguez.pdf" download data-cta style={{ padding: '13px 22px', borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', color: '#0f172a', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.hero.cta2}</a>
              <a href={c.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cta style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', color: '#0f172a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
              </a>
              <a href={c.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-cta style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', color: '#0f172a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
              </a>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div style={{ position: 'relative', maxWidth: isMobile ? 400 : 'none', margin: isMobile ? '0 auto' : 0 }}>
              {/* Soft accent halo behind */}
              <div aria-hidden style={{ position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, background: `radial-gradient(circle at 30% 40%, ${accent}30, transparent 65%)`, filter: 'blur(30px)', zIndex: 0 }}></div>
              {/* Workspace photo — square-ish framed card with gradient overlay */}
              <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 70px rgba(15,23,42,0.22), 0 0 0 1px rgba(15,23,42,0.06)', zIndex: 1, aspectRatio: '4 / 5' }}>
                <img src="assets/photo-roman-portrait.webp" alt="Roman Rodriguez" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%', display: 'block' }} />
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 50%, rgba(15,23,42,0.55) 100%)` }}></div>
                {/* Mono caption — bottom of photo */}
                <div style={{ position: 'absolute', left: 18, bottom: 18, color: '#fff' }}>
                  <div style={{ ...styles.mono, fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: 4 }}>// {lang === 'fr' ? 'Au taff' : 'At work'}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{lang === 'fr' ? 'Valence \u00b7 KDS \u00b7 2026' : 'Valence \u00b7 KDS \u00b7 2026'}</div>
                </div>
              </div>
              {/* Status pill — floating bottom-right of photo */}
              <div style={{ position: 'absolute', bottom: -14, right: -10, ...styles.card, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, zIndex: 2, boxShadow: '0 12px 30px rgba(15,23,42,0.14)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.18)' }}></span>
                {lang === 'fr' ? 'Alternance · KDS' : 'Apprenticeship · KDS'}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );

  const Section = ({ id, eyebrow, title, children, variant = 'up' }) => (
    <section id={id} style={{ padding: '60px 0' }}>
      <div style={styles.container}>
        <Reveal variant="left" style={{ marginBottom: 8 }}>
          <div style={styles.sectionEyebrow}>{eyebrow}</div>
        </Reveal>
        <Reveal variant="up" delay={80} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 600, letterSpacing: '-0.02em', margin: '12px 0 0' }}>{title}</h2>
          <div className="section-underline" style={{ height: 2, background: 'linear-gradient(90deg, #4F46E5, transparent)', marginTop: 16, transformOrigin: 'left', borderRadius: 2 }}></div>
        </Reveal>
        <Reveal variant={variant} delay={180}>{children}</Reveal>
      </div>
    </section>
  );

  // Journey: merged timeline of work experiences + education, sorted by start year (desc).
  // Visual style inspired by mbourand.fr: vertical indigo rail on the left, dots per event,
  // year markers and cards stacking on the right.
  const Journey = () => {
    // Merge + tag entries with a kind discriminator so we can render both variants.
    const startYear = (period) => parseInt((period || '').match(/\d{4}/)?.[0] || '0', 10);
    const entries = [
      ...c.work.items.map((w) => ({ kind: 'work', ...w })),
      ...c.education.items.map((e) => ({ kind: 'edu', ...e })),
    ].sort((a, b) => startYear(a.period) - startYear(b.period));

    const labels = lang === 'fr'
      ? { work: 'Expérience', edu: 'Formation' }
      : { work: 'Experience', edu: 'Education' };

    // Rail geometry. The rail is fixed at `railX` from the column's left edge.
    // Dates sit to the left of the rail on desktop, inside the cards on mobile.
    const railX = isMobile ? 6 : 120;
    const railGap = isMobile ? 18 : 28;

    // Track scroll progress through the timeline to fill the rail with the accent color.
    const railRef = React.useRef(null);
    const fillRef = React.useRef(null);
    React.useEffect(() => {
      const rail = railRef.current; const fill = fillRef.current;
      if (!rail || !fill) return;
      let raf = 0;
      const apply = () => {
        raf = 0;
        const r = rail.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the rail's top hits ~70% of viewport, 1 when its bottom hits ~30%.
        const top = r.top - vh * 0.7;
        const span = r.height + vh * 0.4;
        const p = Math.max(0, Math.min(1, -top / span));
        fill.style.transform = `scaleY(${p})`;
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
      apply();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
    }, [entries.length]);

    return (
      <Section id={c.nav.work} eyebrow={lang === 'fr' ? '· Études & expérience' : '· Studies & experience'} title={c.work.title} variant="up">
        <div ref={railRef} style={{ position: 'relative', paddingLeft: railX + railGap }}>
          {/* Static rail (light) */}
          <div aria-hidden style={{ position: 'absolute', left: railX, top: 6, bottom: 6, width: 2, background: 'rgba(15,23,42,0.08)', borderRadius: 2 }}></div>
          {/* Filled rail (indigo), scaled by scroll */}
          <div ref={fillRef} aria-hidden style={{ position: 'absolute', left: railX, top: 6, bottom: 6, width: 2, background: `linear-gradient(180deg, ${accent}, #818cf8)`, borderRadius: 2, transform: 'scaleY(0)', transformOrigin: 'top', willChange: 'transform', transition: 'transform 120ms linear' }}></div>

          <div style={{ display: 'grid', gap: 22 }}>
            {entries.map((it, i) => {
              const isWork = it.kind === 'work';
              const variant = i % 2 === 0 ? 'left' : 'right';
              return (
                <Reveal key={`${it.kind}-${i}`} variant={variant} delay={i * 90} style={{ position: 'relative' }}>
                  {/* Period — anchored left of the rail (desktop only) */}
                  {!isMobile && <div style={{ position: 'absolute', left: -(railX + railGap), top: 18, width: railX - 14, textAlign: 'right', ...styles.mono, color: '#64748b', fontSize: 11, letterSpacing: '0.06em' }}>{it.period}</div>}
                  {/* Dot — sits exactly on the rail */}
                  <span aria-hidden style={{ position: 'absolute', left: -railGap - 5, top: 24, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `2px solid ${accent}`, boxShadow: `0 0 0 4px ${accent}1f` }}></span>

                  {/* Card */}
                  <div className="work-card" style={{ ...styles.card, padding: isMobile ? 18 : 24 }}>
                    {/* Kind pill + period (period shown here on mobile) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, background: isWork ? `${accent}14` : '#eef0f4', color: isWork ? accent : '#475569', ...styles.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isWork ? accent : '#94a3b8' }}></span>
                        {labels[it.kind]}
                      </div>
                      {isMobile && <span style={{ ...styles.mono, color: '#64748b', fontSize: 10 }}>{it.period}</span>}
                    </div>

                    {(() => {
                      // Both kinds share the same logo column when a logo is present.
                      const logoSize = isMobile ? 56 : 88;
                      const fullBleed = it.logo && /logo-kds\.webp$/.test(it.logo);
                      const initials = (it.org || it.school || '').split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase();
                      const logoBlock = it.logo ? (
                        <div className="org-logo" style={{ width: logoSize, height: logoSize, borderRadius: 14, background: '#fff', border: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: fullBleed ? 0 : 10 }}>
                          <img src={it.logo} alt={it.org || it.school} loading="lazy" style={{ width: fullBleed ? '100%' : 'auto', height: fullBleed ? '100%' : 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: fullBleed ? 'cover' : 'contain' }} />
                        </div>
                      ) : (
                        <div className="org-logo org-fallback" style={{ width: logoSize, height: logoSize, borderRadius: 14, background: 'linear-gradient(135deg, #eef0f4, #f8fafc)', border: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 18 : 26, fontWeight: 600, color: '#94a3b8', letterSpacing: '-0.02em' }}>{initials}</div>
                      );
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: `${logoSize}px 1fr`, gap: isMobile ? 14 : 22 }}>
                          <div>{logoBlock}</div>
                          {isWork ? (
                            <div>
                              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{it.org}</div>
                              <div style={{ fontSize: 13, color: accent, marginTop: 4, marginBottom: 12, fontWeight: 500 }}>{it.role}</div>
                              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '0 0 14px' }}>{it.summary}</p>
                              {it.projects && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                  {it.projects.map((pid) => {
                                    const p = c.projects.items.find((x) => x.id === pid);
                                    if (!p) return null;
                                    return (
                                      <button key={pid} className="project-chip" onClick={() => openProjectById(pid)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, border: `1px solid ${accent}33`, background: `${accent}0d`, color: accent, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s, color .2s, border-color .2s' }}>
                                        {(p.icon || p.logo) && <img src={p.icon || p.logo} alt="" loading="lazy" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'contain' }} />}
                                        {p.name}
                                        <span aria-hidden>→</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{it.degree}</div>
                              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{it.school}</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>
    );
  };

  // Categorize a project from its `stack` strings.
  const categorize = (stack) => {
    const s = (stack || []).join(' ').toLowerCase();
    if (/flutter|react native|android|ios|kotlin/.test(s)) return 'mobile';
    if (/airtable|automatisation|automation|intégration|integration/.test(s)) return 'tools';
    if (/react|symfony|php|html|javascript|api/.test(s)) return 'web';
    return 'other';
  };
  const filterLabels = lang === 'fr'
    ? { all: 'Tous', mobile: 'Mobile', web: 'Web', tools: 'Outils', other: 'Autres' }
    : { all: 'All', mobile: 'Mobile', web: 'Web', tools: 'Tools', other: 'Other' };

  // Skill name → asset logo. `null` means no logo available yet — only the
  // textual label is rendered. Shared between the Skills section and the
  // project stack pills.
  const skillLogos = {
    Java: 'assets/java.webp',
    Python: 'assets/python_logo.webp',
    PHP: 'assets/php_PNG29.webp',
    C: 'assets/C_Logo.webp',
    'C++': 'assets/ISO_C++_Logo.svg.webp',
    'C#': 'assets/Logo_C_sharp.svg.webp',
    Rust: 'assets/Rust_programming_language_black_logo.svg.webp',
    JavaScript: 'assets/Unofficial_JavaScript_logo_2.svg.webp',
    TypeScript: 'assets/Typescript_logo_2020.svg.webp',
    'HTML/CSS': 'assets/HTML5_logo_and_wordmark.svg.webp',
    SQL: 'assets/sql.webp',
    React: 'assets/React_Logo_SVG.svg.webp',
    Symfony: 'assets/symfony.webp',
    'React Expo': 'assets/expo-go-app.svg',
    Flutter: 'assets/Flutter_logo.svg.webp',
    'React Native': 'assets/React_Logo_SVG.svg.webp',
    Kotlin: 'assets/Kotlin_Icon.webp',
    Docker: 'assets/docker_icon_130955.webp',
    'GitLab CI/CD': 'assets/GitLab_icon.svg',
    ESXi: 'assets/Vmware_workstation_16_icon.svg.webp',
    MySQL: 'assets/sql.webp',
    Neo4j: 'assets/neo4j-logo-png-transparent.webp',
    Firestore: 'assets/firestore.svg',
    'Power BI': 'assets/New_Power_BI_Logo.svg.webp',
    Godot: 'assets/Godot_icon.svg',
    Modélio: 'assets/modelio_103811.webp',
    // Project-stack-only entries (not in c.skills.groups but used in c.projects.items[].stack):
    Airtable: 'assets/airtable_logo_icon_169628.webp',
    iOS: 'assets/Apple_logo_black.svg',
    Android: 'assets/Android_logo_2019_(stacked).svg.webp',
  };

  const Projects = () => {
    const [filter, setFilter] = React.useState('all');
    const cats = Array.from(new Set(c.projects.items.map((p) => categorize(p.stack))));
    const items = filter === 'all' ? c.projects.items : c.projects.items.filter((p) => categorize(p.stack) === filter);
    const visibleFilters = ['all', ...cats];
    return (
    <Section id={c.nav.projects} eyebrow={lang === 'fr' ? '· Cas d\u2019études' : '· Case studies'} title={c.projects.title} variant="right">
      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {visibleFilters.map((f) => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 12,
              fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em', cursor: 'pointer',
              border: '1px solid ' + (active ? accent : 'rgba(15,23,42,0.1)'),
              background: active ? accent : '#fff',
              color: active ? '#fff' : '#475569',
              transition: 'background .2s, color .2s, border-color .2s',
            }}>{filterLabels[f] || f}</button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {items.map((p, i) => {
          const isFeatured = p.featured;
          const cardVariant = isFeatured ? 'zoom' : (i % 2 === 0 ? 'left' : 'right');
          return (
            <Reveal key={p.id} variant={cardVariant} delay={i * 90} style={{ gridColumn: isFeatured ? '1 / -1' : 'auto' }}>
            <button key={p.id} className="project-card" onClick={() => openProjectById(p.id)} style={{
              ...styles.card,
              padding: 0, width: '100%',
              background: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
              transition: 'transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s',
            }}
            >
              {isFeatured && p.video ? (
                /* Carte phare : texte a gauche, encart video (telephone) a droite */
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'stretch' }}>
                  <div style={{ flex: '1 1 0', padding: isMobile ? 24 : 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#e11d48', letterSpacing: '0.12em', marginBottom: 16 }}>★ {lang === 'fr' ? 'PROJET PHARE' : 'FEATURED'}</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#64748b', marginBottom: 10 }}>{p.context}</div>
                    <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.01em' }}>{p.name}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: '#475569', marginBottom: 20 }}>{p.summary}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {p.stack.map((s) => {
                        const logo = skillLogos[s];
                        return (
                          <span key={s} style={{ ...styles.pill, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {logo && <img src={logo} alt="" loading="lazy" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ flex: isMobile ? '1 1 auto' : '0 0 42%', background: `linear-gradient(135deg, #ff5b8a 0%, #f43f5e 60%, #be123c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflow: 'hidden' }}>
                    <div style={{ height: isMobile ? 340 : 380, aspectRatio: '1080 / 2640', borderRadius: 28, overflow: 'hidden', border: '5px solid rgba(0,0,0,0.6)', boxShadow: '0 22px 60px rgba(0,0,0,0.5)', background: '#000' }}>
                      <video src={p.video} muted loop playsInline preload="metadata" poster={p.gallery && p.gallery[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                    </div>
                  </div>
                </div>
              ) : (
              <>
              {/* Visual */}
              <div style={{
                height: isFeatured ? 240 : 260,
                background: isFeatured
                  ? `linear-gradient(135deg, #ff5b8a 0%, #f43f5e 60%, #be123c 100%)`
                  : (p.video || p.screenshot ? '#0f172a' : (p.logo ? '#fff' : 'repeating-linear-gradient(135deg, #eef0f4, #eef0f4 6px, #f5f6f8 6px, #f5f6f8 12px)')),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                position: 'relative', overflow: 'hidden',
              }}>
                {isFeatured && p.icon && (
                  <img src={p.icon} alt="" loading="lazy" style={{ width: 96, height: 96, borderRadius: 22, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }} />
                )}
                {isFeatured && (
                  <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.9)' }}>
                    ★ {lang === 'fr' ? 'PROJET PHARE' : 'FEATURED'}
                  </div>
                )}
                {!isFeatured && p.video && (
                  <video src={p.video} muted loop playsInline preload="metadata" poster={p.screenshot || p.logo} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                )}
                {!isFeatured && !p.video && p.screenshot && (
                  <img src={p.screenshot} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                )}
                {!isFeatured && !p.video && !p.screenshot && p.logo && (
                  <img src={p.logo} alt="" loading="lazy" style={{ maxWidth: '55%', maxHeight: '70%', objectFit: 'contain' }} />
                )}
                {!isFeatured && !p.video && !p.screenshot && !p.logo && <span>{p.id}.png</span>}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#64748b', marginBottom: 10 }}>{p.context}</div>
                <div style={{ fontSize: isFeatured ? 26 : 20, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: '#475569', marginBottom: 16 }}>{p.summary}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.stack.map((s) => {
                    const logo = skillLogos[s];
                    return (
                      <span key={s} style={{ ...styles.pill, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {logo && <img src={logo} alt="" loading="lazy" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
              </>
              )}
            </button>
            </Reveal>
          );
        })}
      </div>
    </Section>
    );
  };

  // One distinctive accent per category — drives the colored tab + the soft
  // halo behind each card so groups are unmistakably distinct.
  const groupAccents = ['#4F46E5', '#7c3aed', '#0891b2', '#d97706', '#059669'];

  const Skills = () => {
    return (
      <Section id={c.nav.skills} eyebrow={lang === 'fr' ? '· Stack' : '· Stack'} title={c.skills.title} variant="up">
        <div style={{ display: 'grid', gap: 40, paddingTop: 18 }}>
          {c.skills.groups.map((g, gi) => {
            const col = groupAccents[gi % groupAccents.length];
            return (
              <Reveal key={g.label} variant="up" delay={gi * 80}>
                {/* Card with a colored tab leaking above the top-left corner, mbourand-style */}
                <div style={{ ...styles.card, padding: isMobile ? '42px 16px 26px' : '46px 36px 32px', position: 'relative', overflow: 'visible' }}>
                  {/* Category tab */}
                  <div style={{
                    position: 'absolute', top: -16, left: 28,
                    background: col, color: '#fff',
                    padding: '9px 18px',
                    borderRadius: '12px 12px 12px 4px',
                    fontSize: 13, fontWeight: 600,
                    letterSpacing: '0.01em',
                    boxShadow: `0 10px 24px ${col}55`,
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    zIndex: 2,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }}></span>
                    {g.label}
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, marginLeft: 4, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>{g.items.length}</span>
                  </div>
                  {/* Tile grid — flat, no inner cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 82 : 110}px, 1fr))`, gap: '22px 8px' }}>
                    {g.items.map((name, si) => {
                      const logo = skillLogos[name];
                      return (
                        <Reveal key={name} variant="pop" delay={si * 70}>
                          <div className="skill-tile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 10, padding: '4px 6px' }}>
                            {logo ? (
                              <img src={logo} alt={name} loading="lazy" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                            ) : (
                              <div className="skill-fallback" style={{ width: 52, height: 52, borderRadius: 12, background: `${col}1f`, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>
                                {name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || '·'}
                              </div>
                            )}
                            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#334155', textAlign: 'center', lineHeight: 1.3 }}>{name}</div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>
    );
  };

  // Visual treatment per interest. Each gets its own gradient, glyph and micro-anim.
  const interestVisuals = {
    Football:                 { grad: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)', glyph: '⚽', anim: 'ball-bounce 2.4s ease-in-out infinite' },
    'Journalisme & géopolitique': { grad: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #6366f1 100%)', glyph: '▤', anim: 'pulse-ring 3s ease-in-out infinite' },
    'Journalism & geopolitics':  { grad: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #6366f1 100%)', glyph: '▤', anim: 'pulse-ring 3s ease-in-out infinite' },
    'Culture audiovisuelle':  { grad: 'linear-gradient(135deg, #4a044e 0%, #86198f 50%, #c026d3 100%)', glyph: '▶', anim: 'film-pan 6s linear infinite' },
    'Audiovisual culture':    { grad: 'linear-gradient(135deg, #4a044e 0%, #86198f 50%, #c026d3 100%)', glyph: '▶', anim: 'film-pan 6s linear infinite' },
  };

  const InterestCard = ({ k, v, viz }) => (
    <div className="interest-card" style={{ ...styles.card, padding: 0, overflow: 'hidden', background: viz.grad, color: '#fff', border: 'none', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', transition: 'transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s' }}>
      {/* animated glyph */}
      <div aria-hidden style={{ position: 'absolute', top: -20, right: -10, fontSize: 140, opacity: 0.12, animation: viz.anim, lineHeight: 1, fontWeight: 700, pointerEvents: 'none' }}>{viz.glyph}</div>
      <div style={{ padding: '20px 22px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14, backdropFilter: 'blur(6px)' }}>{viz.glyph}</div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{k}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 6, lineHeight: 1.5 }}>{v}</div>
      </div>
    </div>
  );

  const MusicCard = () => {
    if (!c.interests.music) return null;
    const m = c.interests.music;
    return (
      <div className="interest-card music-card" style={{ ...styles.card, padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #1a1033 0%, #2a1454 50%, #4c1d95 100%)', color: '#f5f3ff', border: 'none', gridColumn: '1 / -1', position: 'relative', transition: 'transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 0 }}>
          <div style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(196,181,253,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>♪</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{m.label}</div>
                <div style={{ ...styles.mono, color: '#c4b5fd', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1 }}>Now playing</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(245,243,255,0.82)', margin: 0, marginBottom: 14 }}>{m.lead}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {m.genres.map((g) => (
                <span key={g.name} title={g.note} className="music-pill" style={{ display: 'inline-block', padding: '5px 11px', borderRadius: 999, background: 'rgba(196,181,253,0.15)', color: '#ddd6fe', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.02em', cursor: 'default', transition: 'background .2s, transform .2s' }}>{g.name}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{
              width: 130, height: 130, borderRadius: '50%',
              background: 'radial-gradient(circle at center, #c4b5fd 0 12%, #1a1033 12% 14%, #0a0518 14% 100%)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(196,181,253,0.2)',
              position: 'relative', animation: 'vinyl-spin 8s linear infinite',
            }}>
              {[0.3, 0.5, 0.7, 0.85].map((r, i) => (
                <div key={i} style={{ position: 'absolute', inset: `${(1 - r) * 50}%`, borderRadius: '50%', border: '1px solid rgba(196,181,253,0.08)' }}></div>
              ))}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: '50%', background: '#7c3aed' }}></div>
            </div>
            <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, alignItems: 'flex-end', height: 24 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} style={{ width: 3, background: 'linear-gradient(180deg, #c4b5fd, #7c3aed)', borderRadius: 2, animation: `eq-bar 1.${(i % 6) + 2}s ease-in-out ${i * 0.07}s infinite alternate` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Interests = () => (
    <Section eyebrow={lang === 'fr' ? '· Hors écran' : '· Off-screen'} title={c.interests.title} variant="zoom">
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        <MusicCard />
        {c.interests.items.map((it, i) => {
          const viz = interestVisuals[it.k] || { grad: 'linear-gradient(135deg, #334155, #64748b)', glyph: '·', anim: 'none' };
          const cardVariants = ['scale', 'tilt', 'flip'];
          return (
            <Reveal key={it.k} variant={cardVariants[i % cardVariants.length]} delay={i * 130}>
              <InterestCard k={it.k} v={it.v} viz={viz} />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );

  const Contact = () => (
    <section id={c.nav.contact} style={{ padding: '60px 0 80px' }}>
      <div style={styles.container}>
        <Reveal variant="zoom">
        <div style={{ ...styles.card, padding: isMobile ? '32px 22px' : 56, background: '#0f172a', color: '#f8fafc', border: 'none', backgroundImage: `radial-gradient(circle at 80% 0%, rgba(79,70,229,0.4), transparent 50%)` }}>
          <div style={{ ...styles.sectionEyebrow, color: '#a5b4fc' }}><span style={{ ...styles.dot, background: '#a5b4fc' }}></span>{c.contact.title}</div>
          <h2 style={{ fontSize: isMobile ? 32 : 56, fontWeight: 600, letterSpacing: '-0.02em', margin: '16px 0 20px', maxWidth: 720 }}>
            {lang === 'fr' ? 'Une opportunité, un projet, une question ?' : 'A role, a project, a question?'}
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(248,250,252,0.7)', maxWidth: 580, lineHeight: 1.5, margin: 0, marginBottom: 36 }}>{c.contact.lead}</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 56, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={`mailto:${c.contact.email}`} data-cta style={{ padding: '14px 22px', borderRadius: 12, background: accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.contact.email}</a>
            <a href="assets/cv-roman-rodriguez.pdf" download data-cta style={{ padding: '14px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#f8fafc', textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.15)' }}>{c.contact.cv} ↓</a>
            <a href={c.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cta style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
            </a>
            <a href={c.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-cta style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 24, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div><div style={{ ...styles.mono, color: '#94a3b8', marginBottom: 4 }}>{lang === 'fr' ? 'Téléphone' : 'Phone'}</div><div>{c.contact.phone}</div></div>
            <div><div style={{ ...styles.mono, color: '#94a3b8', marginBottom: 4 }}>{lang === 'fr' ? 'Ville' : 'City'}</div><div>{c.contact.city}</div></div>
            <div><div style={{ ...styles.mono, color: '#94a3b8', marginBottom: 4 }}>{lang === 'fr' ? 'Langues' : 'Languages'}</div><div>{c.contact.languages}</div></div>
          </div>
        </div>
        </Reveal>
        <div style={{ ...styles.mono, color: '#94a3b8', fontSize: 11, display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <span>© 2026 Roman Rodriguez</span><span>v3.1</span>
        </div>
      </div>
    </section>
  );

  const Carousel = ({ images }) => {
    const [i, setI] = React.useState(0);
    const [dir, setDir] = React.useState(1); // sens du slide pour l'animation
    const n = images.length;
    const go = (d) => { setDir(d); setI((p) => (p + d + n) % n); };
    const jump = (k) => { setDir(k > i ? 1 : -1); setI(k); };
    // Précharge toutes les images du carrousel pour des transitions sans flash.
    React.useEffect(() => {
      images.forEach((src) => { const im = new Image(); im.src = src; });
    }, [images.join('|')]);
    const arrow = (side) => ({ position: 'absolute', top: '50%', [side]: 12, transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(15,23,42,0.55)', color: '#fff', fontSize: 26, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' });
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', background: '#0f172a' }}>
          <img key={i} src={images[i]} alt="" className={dir > 0 ? 'carousel-in-next' : 'carousel-in-prev'} style={{ width: '100%', height: 'auto', display: 'block' }} />
          {n > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label={lang === 'fr' ? 'Précédent' : 'Previous'} style={arrow('left')}>‹</button>
              <button onClick={() => go(1)} aria-label={lang === 'fr' ? 'Suivant' : 'Next'} style={arrow('right')}>›</button>
              <div style={{ position: 'absolute', top: 12, right: 14, ...styles.mono, fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.45)', padding: '4px 8px', borderRadius: 8 }}>{i + 1} / {n}</div>
            </>
          )}
        </div>
        {n > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
            {images.map((_, k) => (
              <button key={k} onClick={() => jump(k)} aria-label={`${lang === 'fr' ? 'Image' : 'Image'} ${k + 1}`} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: k === i ? accent : 'rgba(15,23,42,0.18)', transition: 'all 0.25s' }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const ProjectDetail = () => {
    const scrollRef = React.useRef(null);
    // Revient en haut de la fiche quand on passe d'un projet à l'autre.
    React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [openProject]);
    if (!project) return null;
    const visual = project.icon || project.logo;
    return (
      <div ref={scrollRef} style={{ position: 'fixed', inset: 0, background: '#f5f6f8', zIndex: 20, overflowY: 'auto' }}>
        <div className="detail-in" key={project.id} style={{ ...styles.container, paddingTop: 28, paddingBottom: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <button onClick={closeProject} style={{ ...styles.mono, fontSize: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#0f172a' }}>← {c.misc.backToList}</button>
            <button onClick={closeProject} aria-label={c.misc.backToList} title="Échap" style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', cursor: 'pointer', color: '#0f172a', fontSize: 15, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ ...styles.card, padding: isMobile ? 20 : 40 }}>
            <div style={{ ...styles.mono, color: accent, marginBottom: 14, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{project.context}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, marginBottom: 20 }}>
              {visual && <img src={visual} alt="" style={{ width: isMobile ? 46 : 64, height: isMobile ? 46 : 64, borderRadius: 14, objectFit: 'contain', background: '#fff', border: '1px solid rgba(15,23,42,0.08)', padding: 4, flexShrink: 0 }} />}
              <h1 style={{ fontSize: isMobile ? 30 : 52, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>{project.name}</h1>
            </div>
            <p style={{ fontSize: isMobile ? 16 : 19, lineHeight: 1.55, color: '#334155', maxWidth: 720, margin: '0 0 24px' }}>{project.summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 32 }}>
              {project.stack.map((s) => {
                const logo = skillLogos[s];
                return (
                  <span key={s} style={{ ...styles.pill, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {logo && <img src={logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                    {s}
                  </span>
                );
              })}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" data-cta style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: accent, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                  {lang === 'fr' ? 'Visiter le site' : 'Visit website'} ↗
                </a>
              )}
            </div>
            {project.video && (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32, border: '1px solid rgba(15,23,42,0.08)', background: '#000', display: 'flex', justifyContent: 'center' }}>
                <video src={project.video} controls autoPlay muted loop playsInline style={{ maxHeight: 600, maxWidth: '100%', width: 'auto', height: 'auto', display: 'block' }} />
              </div>
            )}
            {project.gallery ? (
              (() => {
                // Phone-style for audit-app (mobile screenshots), wide-card for chandezon (desktop screenshots)
                const isPhone = !!project.icon && project.id === 'audit-app';
                if (isPhone) {
                  return (
                    <div style={{ borderRadius: 16, marginBottom: 32, padding: '40px 32px', background: `linear-gradient(135deg, #ff5b8a 0%, #f43f5e 60%, #be123c 100%)`, display: 'flex', gap: 22, justifyContent: 'center', overflowX: 'auto' }}>
                      {project.icon && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 160 }}>
                          <img src={project.icon} alt="" style={{ width: 110, height: 110, borderRadius: 26, boxShadow: '0 18px 60px rgba(0,0,0,0.35)' }} />
                          <div style={{ ...styles.mono, color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 14, letterSpacing: '0.12em' }}>PhotoKDS</div>
                        </div>
                      )}
                      {project.gallery.map((src, i) => (
                        <div key={i} style={{ width: 200, flex: '0 0 auto', borderRadius: 22, overflow: 'hidden', background: '#000', boxShadow: '0 18px 60px rgba(0,0,0,0.35)', border: '4px solid #1a1a1a' }}>
                          <img src={src} alt="" style={{ width: '100%', display: 'block' }} />
                        </div>
                      ))}
                    </div>
                  );
                }
                // Wide / desktop gallery → carousel
                return <Carousel images={project.gallery} />;
              })()
            ) : project.screenshot ? (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32, border: '1px solid rgba(15,23,42,0.08)', background: '#0f172a' }}>
                <img src={project.screenshot} alt={project.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ) : project.icon ? (
              <div style={{ height: 320, borderRadius: 12, background: `linear-gradient(135deg, #ff5b8a 0%, #f43f5e 60%, #be123c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                <img src={project.icon} alt={project.name} style={{ width: 140, height: 140, borderRadius: 32, boxShadow: '0 18px 60px rgba(0,0,0,0.4)' }} />
              </div>
            ) : project.logo ? (
              <div style={{ height: 280, borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                <img src={project.logo} alt={project.name} style={{ maxWidth: '40%', maxHeight: '60%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ height: 280, borderRadius: 12, background: `linear-gradient(135deg, ${accent}22, ${accent}05)`, border: '1px dashed rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ ...styles.mono, color: '#64748b', textAlign: 'center', fontSize: 12 }}>
                  {lang === 'fr' ? 'Captures du projet à insérer' : 'Project screenshots to insert'}<br /><span style={{ fontSize: 10 }}>{project.id}.png</span>
                </div>
              </div>
            )}
            <div style={{ ...styles.mono, color: accent, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{lang === 'fr' ? 'Contributions' : 'Contributions'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '18px' : '24px 40px' }}>
              {project.contributions.map((b, j) => (
                <div key={j}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }}></span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.01em' }}>{b.t}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, paddingLeft: 15 }}>{b.d}</div>
                </div>
              ))}
            </div>
          </div>
          {(() => {
            // Navigation projet précédent / suivant (boucle sur la liste).
            const items = c.projects.items;
            const idx = items.findIndex((p) => p.id === project.id);
            const prevP = items[(idx - 1 + items.length) % items.length];
            const nextP = items[(idx + 1) % items.length];
            const navCard = (p, dir) => (
              <button onClick={() => openProjectById(p.id)} className="detail-nav" style={{ ...styles.card, textAlign: dir === 'prev' ? 'left' : 'right', padding: '16px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ ...styles.mono, color: '#94a3b8', fontSize: 10, marginBottom: 6 }}>
                  {dir === 'prev'
                    ? `← ${lang === 'fr' ? 'Projet précédent' : 'Previous project'}`
                    : `${lang === 'fr' ? 'Projet suivant' : 'Next project'} →`}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
              </button>
            );
            return (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 20 }}>
                {navCard(prevP, 'prev')}
                {navCard(nextP, 'next')}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...styles.root, position: 'relative' }} data-screen-label="V2 Soft Cool">
      <ParticlesBg />
      <NavBar lang={lang} setLang={setLang} />
      <Hero />
      <Journey />
      <Projects />
      <Skills />
      <Interests />
      <Contact />
      <ProjectDetail />
      <BackToTop accent={accent} />
    </div>
  );
};

window.SoftCool = SoftCool;
