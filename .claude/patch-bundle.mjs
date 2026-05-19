// Sync the bundled standalone HTML with the latest source files.
// - Replaces the variation-soft-cool.jsx entry in the bundler manifest
//   wholesale with the current contents of export/variation-soft-cool.jsx.
// - Injects meta/OG/favicon tags into the template HTML stored in the
//   __bundler/template script tag.
//
// The bundle stores assets as gzip+base64 in a JSON manifest. The original
// HTML page that React mounts into is stored JSON-encoded inside a
// <script type="__bundler/template"> tag.
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';

const TARGET_UUID = 'b6c9944a-038a-4ba6-ba3b-e10d49cb2beb'; // variation-soft-cool.jsx
const HTML = 'export/portfolio-roman-rodriguez.html';
const JSX = 'export/variation-soft-cool.jsx';

let html = readFileSync(HTML, 'utf8');
const jsxSource = readFileSync(JSX, 'utf8');

// --- 1. Replace JSX entry wholesale ---
{
  const m = html.match(/(<script type="__bundler\/manifest">)([\s\S]*?)(<\/script>)/);
  if (!m) { console.error('No manifest tag'); process.exit(1); }
  const manifest = JSON.parse(m[2]);
  const entry = manifest[TARGET_UUID];
  if (!entry) { console.error('UUID not in manifest'); process.exit(1); }

  const compressed = Buffer.from(entry.data, 'base64');
  const oldSource = (entry.compressed ? gunzipSync(compressed) : compressed).toString('utf8');
  if (!oldSource.includes('useParallax')) { console.error('Existing entry does not look like the JSX'); process.exit(1); }

  const newBuf = Buffer.from(jsxSource, 'utf8');
  const newCompressed = entry.compressed ? gzipSync(newBuf, { level: 9 }) : newBuf;
  manifest[TARGET_UUID] = { ...entry, data: newCompressed.toString('base64') };

  html = html.replace(m[0], m[1] + JSON.stringify(manifest) + m[3]);
  console.log(`[manifest] replaced ${TARGET_UUID}: ${oldSource.length} -> ${jsxSource.length} chars`);
}

// --- 2. Inject meta/OG/favicon tags into the template HTML ---
{
  // The template tag wraps a single JSON string value. The string can contain
  // `</script>` literally (which would break browser HTML parsing — we re-escape
  // those on output). To find where the JSON value ends, walk the string,
  // honoring backslash escapes.
  const tagOpen = '<script type="__bundler/template">\n';
  const startIdx = html.indexOf(tagOpen);
  if (startIdx === -1) { console.error('No template tag'); process.exit(1); }
  const jsonStart = startIdx + tagOpen.length;
  if (html[jsonStart] !== '"') { console.error('Template body does not start with a JSON string'); process.exit(1); }
  let i = jsonStart + 1;
  while (i < html.length) {
    const c = html[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '"') break;
    i++;
  }
  if (i >= html.length) { console.error('Unterminated JSON string in template'); process.exit(1); }
  const jsonEnd = i; // index of closing "
  const templateHtml = JSON.parse(html.substring(jsonStart, jsonEnd + 1));

  const META_BLOCK = `<meta name="description" content="Roman Rodriguez — développeur full-stack & mobile en alternance chez KDS. Étudiant BUT Informatique à l'IUT de Valence. React, Flutter, React Native, Symfony.">
<meta name="author" content="Roman Rodriguez">
<meta name="theme-color" content="#4F46E5">
<link rel="icon" type="image/png" href="assets/photo-roman-portrait.png">
<link rel="apple-touch-icon" href="assets/photo-roman-portrait.png">
<meta property="og:title" content="Roman Rodriguez — Développeur full-stack & mobile">
<meta property="og:description" content="Portfolio : projets KDS, Carte KDS, Dr Chandezon, applications mobiles d'audit et plus.">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/photo-roman.png">
<meta property="og:locale" content="fr_FR">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Roman Rodriguez — Développeur full-stack & mobile">
<meta name="twitter:description" content="Portfolio : projets KDS, Carte KDS, Dr Chandezon, applications mobiles d'audit et plus.">
<meta name="twitter:image" content="assets/photo-roman.png">
`;

  let patched;
  if (templateHtml.includes('property="og:title"')) {
    console.log('[template] meta tags already present, skipping');
    patched = templateHtml;
  } else {
    const anchor = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    if (!templateHtml.includes(anchor)) { console.error('viewport meta anchor not found in template'); process.exit(1); }
    patched = templateHtml.replace(anchor, anchor + '\n' + META_BLOCK);
    console.log(`[template] injected ${META_BLOCK.length} chars of meta`);
  }

  // Escape `</` as `</` so embedded `</script>` in the template body
  // doesn't terminate the surrounding <script> tag prematurely (HTML rule).
  const safeJson = JSON.stringify(patched).replace(/<\//g, '<\\u002F');
  html = html.substring(0, jsonStart) + safeJson + html.substring(jsonEnd + 1);
}

writeFileSync(HTML, html);
console.log('Done.');
