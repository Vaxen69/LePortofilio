// Point d'entrée : monte SoftCool, gère la langue et la barre de progression.
const App = () => {
  const [lang, setLang] = React.useState('fr');

  // Garde <html lang> synchronisé avec la langue affichée (accessibilité/SEO).
  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Scroll progress bar
  React.useEffect(() => {
    const bar = document.getElementById('scroll-progress-bar');
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <window.SoftCool lang={lang} setLang={setLang} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
