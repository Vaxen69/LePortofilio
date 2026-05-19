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
  }[variant] || { opacity: 0, transform: `translateY(${y}px)` };
  const visible = { opacity: 1, transform: 'translate(0,0) scale(1) perspective(900px) rotateX(0) rotateY(0)', filter: 'blur(0)' };
  const dur = variant === 'blur' ? 900 : (variant === 'flip' || variant === 'tilt' ? 850 : 750);
  return (
    <Tag ref={ref} style={{
      ...style,
      ...(shown ? visible : hidden),
      transition: `opacity ${dur}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${dur}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter ${dur}ms ease ${delay}ms`,
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

const SoftCool = ({ lang = 'fr', setLang = () => {} }) => {
  const c = window.PORTFOLIO_CONTENT[lang];
  const [openProject, setOpenProject] = React.useState(null);
  const project = openProject ? c.projects.items.find((p) => p.id === openProject) : null;

  // Hero blob parallax (transform is applied directly via ref — see useParallax)
  const blobRef = useParallax(0.25);

  const accent = '#4F46E5';

  // Highlight nav link of the section currently in view (DOM-only, no re-renders)
  useScrollSpy(Object.values(c.nav), accent);
  const styles = {
    root: {
      width: '100%',
      minHeight: '100%',
      background: '#f5f6f8',
      color: '#0f172a',
      fontFamily: '"Inter Tight", -apple-system, BlinkMacSystemFont, sans-serif',
      letterSpacing: '-0.011em',
      WebkitFontSmoothing: 'antialiased',
    },
    mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.04em' },
    container: { maxWidth: 1120, margin: '0 auto', padding: '0 56px' },
    card: { background: '#ffffff', borderRadius: 18, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' },
    pill: { display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: '#eef0f4', color: '#475569', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.02em' },
    sectionEyebrow: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: accent },
    dot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: accent },
  };

  const NavBar = ({ lang, setLang }) => (
    <nav style={{ position: 'sticky', top: 12, zIndex: 10, padding: '0 56px', marginBottom: -52 }}>
      <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', maxWidth: 1120, margin: '0 auto', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', boxShadow: '0 0 0 1.5px #fff, 0 0 0 3px ' + accent }}>
            <img src="assets/photo-roman-portrait.png" alt="Roman Rodriguez" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%', display: 'block' }} />
          </span>
          Roman Rodriguez
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#475569' }}>
          {Object.values(c.nav).map((n) => (<a key={n} href={`#${n}`} data-spy={n} style={{ color: 'inherit', textDecoration: 'none', transition: 'color .2s, font-weight .2s' }}>{n}</a>))}
        </div>
        <div style={{ display: 'inline-flex', background: '#eef0f4', borderRadius: 999, padding: 2, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.06em' }}>
          <button onClick={() => setLang('fr')} style={{ border: 'none', background: lang === 'fr' ? accent : 'transparent', color: lang === 'fr' ? '#fff' : '#475569', padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'uppercase' }}>FR</button>
          <button onClick={() => setLang('en')} style={{ border: 'none', background: lang === 'en' ? accent : 'transparent', color: lang === 'en' ? '#fff' : '#475569', padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'uppercase' }}>EN</button>
        </div>
      </div>
    </nav>
  );

  const Hero = () => (
    <section style={{ padding: '160px 0 100px', position: 'relative', overflow: 'hidden' }}>
      {/* Parallax accent blob */}
      <div ref={blobRef} aria-hidden style={{
        position: 'absolute', top: '10%', right: '-10%', width: 520, height: 520,
        background: `radial-gradient(circle at center, ${accent}40, transparent 70%)`,
        filter: 'blur(40px)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 0, willChange: 'transform',
      }}></div>
      <div style={{ ...styles.container, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 56, alignItems: 'center' }}>
          <Reveal>
            <div style={styles.sectionEyebrow}><span style={styles.dot}></span>{c.hero.kicker}</div>
            <h1 style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 600, margin: '20px 0 24px', letterSpacing: '-0.03em' }}>
              {c.hero.name}.<br />
              <span style={{ color: '#64748b', fontWeight: 400 }}>{c.hero.role}.</span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: '#334155', margin: 0, maxWidth: 580 }}>{c.hero.tagline}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
              <a href={`#${c.nav.projects}`} data-cta style={{ padding: '13px 22px', borderRadius: 12, background: accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.hero.cta1} →</a>
              <a href="#" data-cta style={{ padding: '13px 22px', borderRadius: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', color: '#0f172a', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.hero.cta2}</a>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div style={{ position: 'relative' }}>
              {/* Soft accent halo behind */}
              <div aria-hidden style={{ position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, background: `radial-gradient(circle at 30% 40%, ${accent}30, transparent 65%)`, filter: 'blur(30px)', zIndex: 0 }}></div>
              {/* Workspace photo — square-ish framed card with gradient overlay */}
              <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 70px rgba(15,23,42,0.22), 0 0 0 1px rgba(15,23,42,0.06)', zIndex: 1, aspectRatio: '4 / 5' }}>
                <img src="assets/photo-roman.png" alt={lang === 'fr' ? 'Roman \u00e0 son poste de d\u00e9veloppement' : 'Roman at his desk'} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 30%', display: 'block' }} />
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
          <h2 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', margin: '12px 0 0' }}>{title}</h2>
          <div className="section-underline" style={{ height: 2, background: 'linear-gradient(90deg, #4F46E5, transparent)', marginTop: 16, transformOrigin: 'left', borderRadius: 2 }}></div>
        </Reveal>
        <Reveal variant={variant} delay={180}>{children}</Reveal>
      </div>
    </section>
  );

  const About = () => {
    const projectCount = c.projects.items.length;
    const techCount = c.skills.groups.reduce((acc, g) => acc + g.items.length, 0);
    const xpCount = c.work.items.length;
    const stats = lang === 'fr'
      ? [
          { n: projectCount, suffix: '+', label: 'Projets livrés' },
          { n: xpCount, suffix: '', label: 'Expériences pro' },
          { n: techCount, suffix: '+', label: 'Technos maîtrisées' },
        ]
      : [
          { n: projectCount, suffix: '+', label: 'Projects shipped' },
          { n: xpCount, suffix: '', label: 'Pro experiences' },
          { n: techCount, suffix: '+', label: 'Technologies' },
        ];
    return (
      <Section id={c.nav.about} eyebrow={lang === 'fr' ? '· À propos' : '· About'} title={c.about.title} variant="blur">
        <div style={{ maxWidth: 760 }}>
          {c.about.paragraphs.map((p, i) => (<p key={i} style={{ fontSize: 17, lineHeight: 1.6, color: '#334155', margin: 0, marginBottom: 18 }}>{p}</p>))}
          {/* Animated stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(15,23,42,0.08)' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 38, fontWeight: 600, color: accent, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <AnimatedCount to={s.n} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Values — compact inline row, not a big card. Numbered, mono, deliberately understated. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(15,23,42,0.08)' }}>
            {c.about.values.map((v, i) => (
              <div key={v.k}>
                <div style={{ ...styles.mono, fontSize: 10, color: accent, letterSpacing: '0.12em', marginBottom: 6 }}>0{i + 1}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{v.k}</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>{v.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  };

  const Work = () => (
    <Section id={c.nav.work} eyebrow={lang === 'fr' ? '· Parcours' : '· Track record'} title={c.work.title} variant="left">
      <div style={{ display: 'grid', gap: 14 }}>
        {c.work.items.map((w, i) => (
          <Reveal key={i} variant="flip" delay={i * 110}>
          <div className="work-card" style={{ ...styles.card, padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 32 }}>
              <div>
                <div style={{ ...styles.mono, color: '#64748b', fontSize: 11, marginBottom: 16, letterSpacing: '0.06em' }}>{w.period}</div>
                {w.logo ? (
                  (() => {
                    // Full-bleed logos (image already fills the canvas edge-to-edge): no inner padding.
                    const fullBleed = /logo-kds\.jpg$/.test(w.logo);
                    return (
                      <div style={{ width: 120, height: 120, borderRadius: 16, background: '#fff', border: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: fullBleed ? 0 : 14 }}>
                        <img src={w.logo} alt={w.org} style={{ width: fullBleed ? '100%' : 'auto', height: fullBleed ? '100%' : 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: fullBleed ? 'cover' : 'contain' }} />
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ width: 120, height: 120, borderRadius: 16, background: 'linear-gradient(135deg, #eef0f4, #f8fafc)', border: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, color: '#94a3b8', letterSpacing: '-0.02em' }}>
                    {w.org.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{w.org}</div>
                <div style={{ fontSize: 13, color: accent, marginTop: 4, marginBottom: 18, fontWeight: 500 }}>{w.role}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {w.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 8, paddingLeft: 18, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: 9, width: 5, height: 5, borderRadius: '50%', background: accent }}></span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {items.map((p, i) => {
          const isFeatured = p.featured;
          const cardVariant = isFeatured ? 'zoom' : (i % 2 === 0 ? 'left' : 'right');
          return (
            <Reveal key={p.id} variant={cardVariant} delay={i * 90} style={{ gridColumn: isFeatured ? '1 / -1' : 'auto' }}>
            <button key={p.id} className="project-card" onClick={() => setOpenProject(p.id)} style={{
              ...styles.card,
              padding: 0, width: '100%',
              background: isFeatured ? '#0f172a' : '#ffffff',
              color: isFeatured ? '#f8fafc' : '#0f172a',
              border: isFeatured ? '1px solid #0f172a' : styles.card.border,
              cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
              transition: 'transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s',
            }}
            >
              {/* Visual */}
              <div style={{
                height: isFeatured ? 240 : 170,
                background: isFeatured
                  ? `linear-gradient(135deg, #ff5b8a 0%, #f43f5e 60%, #be123c 100%)`
                  : (p.screenshot ? '#0f172a' : (p.logo ? '#fff' : 'repeating-linear-gradient(135deg, #eef0f4, #eef0f4 6px, #f5f6f8 6px, #f5f6f8 12px)')),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                position: 'relative', overflow: 'hidden',
              }}>
                {isFeatured && p.icon && (
                  <img src={p.icon} alt="" style={{ width: 96, height: 96, borderRadius: 22, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }} />
                )}
                {isFeatured && (
                  <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.9)' }}>
                    ★ {lang === 'fr' ? 'PROJET PHARE' : 'FEATURED'}
                  </div>
                )}
                {!isFeatured && p.screenshot && (
                  <img src={p.screenshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                )}
                {!isFeatured && !p.screenshot && p.logo && (
                  <img src={p.logo} alt="" style={{ maxWidth: '55%', maxHeight: '70%', objectFit: 'contain' }} />
                )}
                {!isFeatured && !p.screenshot && !p.logo && <span>{p.id}.png</span>}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: 10 }}>{p.context}</div>
                <div style={{ fontSize: isFeatured ? 26 : 20, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: isFeatured ? 'rgba(248,250,252,0.75)' : '#475569', marginBottom: 16 }}>{p.summary}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.stack.map((s) => (
                    <span key={s} style={{ ...styles.pill, background: isFeatured ? 'rgba(255,255,255,0.1)' : '#eef0f4', color: isFeatured ? 'rgba(248,250,252,0.85)' : '#475569' }}>{s}</span>
                  ))}
                </div>
              </div>
            </button>
            </Reveal>
          );
        })}
      </div>
    </Section>
    );
  };

  // Each language gets a qualitative fluency tier — no numeric grading.
  // 'daily' = used every day, 'solid' = comfortable, 'discovery' = exploring.
  const langProfic = {
    'HTML/CSS':   { tier: 'daily',     label_fr: 'Quotidien',  label_en: 'Daily' },
    JavaScript:   { tier: 'daily',     label_fr: 'Quotidien',  label_en: 'Daily' },
    PHP:          { tier: 'solid',     label_fr: 'Solide',     label_en: 'Solid' },
    SQL:          { tier: 'solid',     label_fr: 'Solide',     label_en: 'Solid' },
    Java:         { tier: 'solid',     label_fr: 'Solide',     label_en: 'Solid' },
    Python:       { tier: 'solid',     label_fr: 'Solide',     label_en: 'Solid' },
    C:            { tier: 'discovery', label_fr: 'Bases',      label_en: 'Foundations' },
    Rust:         { tier: 'discovery', label_fr: 'Découverte', label_en: 'Exploring' },
  };
  const tierDots = { daily: 4, solid: 3, discovery: 2 };
  const groupGlyphs = {
    Languages: '⟨/⟩', Langages: '⟨/⟩',
    Frameworks: '◆',
    Mobile: '▱',
    DevOps: '⚙',
    Data: '◧', Données: '◧',
    Methods: '✦', Méthodes: '✦',
  };

  const Skills = () => {
    const groups = c.skills.groups;
    const langGroup = groups[0];
    const otherGroups = groups.slice(1);
    return (
      <Section id={c.nav.skills} eyebrow={lang === 'fr' ? '· Stack' : '· Stack'} title={c.skills.title} variant="tilt">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Languages — qualitative tier dots, no numeric score */}
          <div style={{ ...styles.card, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ ...styles.mono, color: accent, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11 }}>{groupGlyphs[langGroup.label]} &nbsp; {langGroup.label}</div>
              <div style={{ ...styles.mono, color: '#94a3b8', fontSize: 10 }}>{langGroup.items.length} {lang === 'fr' ? 'langages' : 'languages'}</div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {langGroup.items.map((it) => {
                const p = langProfic[it] || { tier: 'solid', label_fr: 'Solide', label_en: 'Solid' };
                const dots = tierDots[p.tier];
                return (
                  <div key={it} className="skill-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, fontFamily: '"JetBrains Mono", monospace' }}>{it}</span>
                    <span style={{ ...styles.mono, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lang === 'fr' ? p.label_fr : p.label_en}</span>
                    <span style={{ display: 'inline-flex', gap: 4 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < dots ? accent : '#e2e8f0' }}></span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other groups — visual pill wall */}
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 12 }}>
            {[otherGroups[0], otherGroups[1], otherGroups[2]].map((g) => (
              <div key={g.label} className="skill-card" style={{ ...styles.card, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', transition: 'transform .25s, box-shadow .25s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{groupGlyphs[g.label] || '·'}</div>
                <div>
                  <div style={{ ...styles.mono, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, marginBottom: 4 }}>{g.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', lineHeight: 1.4 }}>{g.items.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* bottom row — last 2 groups, full width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {[otherGroups[3], otherGroups[4]].filter(Boolean).map((g) => (
            <div key={g.label} className="skill-card" style={{ ...styles.card, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', transition: 'transform .25s, box-shadow .25s' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{groupGlyphs[g.label] || '·'}</div>
              <div>
                <div style={{ ...styles.mono, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, marginBottom: 4 }}>{g.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', lineHeight: 1.4 }}>{g.items.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  };

  const Education = () => (
    <Section eyebrow={lang === 'fr' ? '· Formation' : '· Education'} title={c.education.title} variant="rise">
      <div style={{ display: 'grid', gap: 12 }}>
        {c.education.items.map((e, i) => (
          <Reveal key={i} variant="right" delay={i * 90}>
          <div style={{ ...styles.card, padding: 20, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24 }}>
            <div style={{ ...styles.mono, color: '#64748b', fontSize: 12 }}>{e.period}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{e.degree}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{e.school}</div>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );

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
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
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
        <div style={{ ...styles.card, padding: 56, background: '#0f172a', color: '#f8fafc', border: 'none', backgroundImage: `radial-gradient(circle at 80% 0%, rgba(79,70,229,0.4), transparent 50%)` }}>
          <div style={{ ...styles.sectionEyebrow, color: '#a5b4fc' }}><span style={{ ...styles.dot, background: '#a5b4fc' }}></span>{c.contact.title}</div>
          <h2 style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', margin: '16px 0 20px', maxWidth: 720 }}>
            {lang === 'fr' ? 'Une opportunité, un projet, une question ?' : 'A role, a project, a question?'}
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(248,250,252,0.7)', maxWidth: 580, lineHeight: 1.5, margin: 0, marginBottom: 36 }}>{c.contact.lead}</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 56 }}>
            <a href={`mailto:${c.contact.email}`} data-cta style={{ padding: '14px 22px', borderRadius: 12, background: accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{c.contact.email}</a>
            <a href="#" data-cta style={{ padding: '14px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#f8fafc', textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.15)' }}>{c.contact.cv} ↓</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
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

  const ProjectDetail = () => {
    if (!project) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#f5f6f8', zIndex: 20, overflowY: 'auto' }}>
        <div style={{ ...styles.container, paddingTop: 40, paddingBottom: 80 }}>
          <button onClick={() => setOpenProject(null)} style={{ ...styles.mono, fontSize: 12, background: '#fff', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#0f172a', marginBottom: 32 }}>← {c.misc.backToList}</button>
          <div style={{ ...styles.card, padding: 40 }}>
            <div style={{ ...styles.mono, color: accent, marginBottom: 12, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{project.context}</div>
            <h1 style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 20px' }}>{project.name}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: '#334155', maxWidth: 720, margin: 0, marginBottom: 32 }}>{project.summary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
              {project.stack.map((s) => (<span key={s} style={styles.pill}>{s}</span>))}
            </div>
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
                // Wide / desktop gallery
                return (
                  <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
                    {project.gallery.map((src, i) => (
                      <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
                        <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                );
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
            <div style={{ ...styles.mono, color: accent, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{lang === 'fr' ? 'Contributions' : 'Contributions'}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {project.contributions.map((b, j) => (
                <li key={j} style={{ fontSize: 16, color: '#334155', lineHeight: 1.55, marginBottom: 10, paddingLeft: 22, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: accent }}></span>{b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...styles.root, position: 'relative' }} data-screen-label="V2 Soft Cool">
      <NavBar lang={lang} setLang={setLang} />
      <Hero />
      <About />
      <Work />
      <Projects />
      <Skills />
      <Education />
      <Interests />
      <Contact />
      <ProjectDetail />
      <BackToTop accent={accent} />
    </div>
  );
};

window.SoftCool = SoftCool;
