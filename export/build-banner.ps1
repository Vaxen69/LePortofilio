# Build banner-linkedin.svg and banner-linkedin.html (with inlined logos as
# base64 so canvas export works under file:// without CORS taint).

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$logos = @{
  'flutter' = Join-Path $here 'assets\Flutter_logo.svg.png'
  'expo'    = Join-Path $here 'assets\expo-go-app.svg'
  'symfony' = Join-Path $here 'assets\symfony.png'
  'php'     = Join-Path $here 'assets\php_PNG29.png'
  'docker'  = Join-Path $here 'assets\docker_icon_130955.png'
}

$b64 = @{}
foreach ($k in $logos.Keys) {
  $path = $logos[$k]
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $mime = if ($path -match '\.svg$') { 'image/svg+xml' } else { 'image/png' }
  $b64[$k] = "data:$mime;base64," + [Convert]::ToBase64String($bytes)
}

# 6 tech pills, evenly spaced on one row. Width 132, gap 10, height 44.
# Logos rendered as <image> with base64 href so the SVG is fully self-contained.
$techs = @(
  @{ key='flutter'; label='Flutter' },
  @{ key='expo';    label='React Expo' },
  @{ key='symfony'; label='Symfony' },
  @{ key='php';     label='PHP' },
  @{ key='docker';  label='Docker' }
)

$pills = New-Object System.Text.StringBuilder
$pillW = 144; $pillH = 44; $gap = 10
for ($i = 0; $i -lt $techs.Length; $i++) {
  $x = $i * ($pillW + $gap)
  $t = $techs[$i]
  $logo = $b64[$t.key]
  $label = $t.label
  [void]$pills.AppendLine("        <g transform=`"translate($x, 0)`">")
  [void]$pills.AppendLine("          <rect x=`"0`" y=`"0`" rx=`"22`" ry=`"22`" width=`"$pillW`" height=`"$pillH`" fill=`"#ffffff`" stroke=`"rgba(15,23,42,0.10)`"/>")
  [void]$pills.AppendLine("          <image href=`"$logo`" x=`"14`" y=`"11`" width=`"22`" height=`"22`" preserveAspectRatio=`"xMidYMid meet`"/>")
  [void]$pills.AppendLine("          <text x=`"46`" y=`"28`" font-family=`"'Inter Tight', 'Inter', sans-serif`" font-size=`"15`" fill=`"#0f172a`" font-weight=`"500`">$label</text>")
  [void]$pills.AppendLine("        </g>")
}

$svgInner = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396" width="1584" height="396" font-family="'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f6f8"/>
      <stop offset="100%" stop-color="#eef0f4"/>
    </linearGradient>
    <radialGradient id="halo" cx="78%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#4F46E5" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="haloLeft" cx="22%" cy="40%" r="35%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1584" height="396" fill="url(#bg)"/>
  <rect width="1584" height="396" fill="url(#haloLeft)"/>
  <rect width="1584" height="396" fill="url(#halo)"/>
  <g stroke="#4F46E5" stroke-opacity="0.16" stroke-width="1" fill="none">
    <line x1="1320" y1="60" x2="1390" y2="100"/>
    <line x1="1390" y1="100" x2="1460" y2="70"/>
    <line x1="1460" y1="70" x2="1530" y2="130"/>
    <line x1="1390" y1="100" x2="1430" y2="180"/>
    <line x1="1430" y1="180" x2="1500" y2="220"/>
    <line x1="1500" y1="220" x2="1430" y2="290"/>
    <line x1="1430" y1="290" x2="1350" y2="240"/>
    <line x1="1350" y1="240" x2="1430" y2="180"/>
    <line x1="1430" y1="290" x2="1500" y2="340"/>
    <line x1="1320" y1="60" x2="1350" y2="240"/>
  </g>
  <g fill="#4F46E5">
    <circle cx="1320" cy="60"  r="2.4" opacity="0.6"/>
    <circle cx="1390" cy="100" r="3"   opacity="0.7"/>
    <circle cx="1460" cy="70"  r="2.2" opacity="0.55"/>
    <circle cx="1530" cy="130" r="2.6" opacity="0.65"/>
    <circle cx="1430" cy="180" r="2.8" opacity="0.65"/>
    <circle cx="1500" cy="220" r="2.4" opacity="0.6"/>
    <circle cx="1430" cy="290" r="3"   opacity="0.7"/>
    <circle cx="1350" cy="240" r="2.2" opacity="0.55"/>
    <circle cx="1500" cy="340" r="2.4" opacity="0.6"/>
  </g>
  <g fill="#4F46E5" opacity="0.22">
    <circle cx="1280" cy="160" r="1.6"/>
    <circle cx="1560" cy="60"  r="1.4"/>
    <circle cx="1290" cy="340" r="1.6"/>
    <circle cx="1380" cy="350" r="1.4"/>
  </g>

  <!-- Text block (offset to leave room for the round profile photo on the left) -->
  <g transform="translate(480, 0)">
    <g transform="translate(0, 102)">
      <circle cx="6" cy="-4" r="5" fill="#4F46E5"/>
      <text x="20" y="0" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="13" letter-spacing="2.2" fill="#4F46E5" font-weight="600">VALENCE  &#183;  2026</text>
    </g>
    <text x="0" y="178" font-size="74" letter-spacing="-2.4" fill="#0f172a" font-weight="700">Roman Rodriguez<tspan fill="#4F46E5">.</tspan></text>
    <text x="0" y="226" font-size="26" fill="#64748b" font-weight="400">D&#233;veloppeur full-stack &amp; mobile</text>
    <text x="0" y="262" font-size="16" fill="#475569" font-weight="400">&#201;tudiant BUT Informatique en alternance &#183; KDS  &#183;  IUT de Valence</text>

    <!-- Pills with logos -->
    <g transform="translate(0, 296)">
$($pills.ToString())
    </g>
  </g>

  <text x="1530" y="375" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="11" fill="#94a3b8" letter-spacing="1.5">github.com/Vaxen69</text>
</svg>
"@

# Write the SVG file (also handy on its own)
Set-Content -Path (Join-Path $here 'banner-linkedin.svg') -Value $svgInner -Encoding utf8

# Build the HTML wrapper with preview + JPG export buttons
$html = @"
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Banni&#232;re LinkedIn &#8212; Roman Rodriguez</title>
<style>
  body { margin: 0; padding: 28px; background: #0f172a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  h1 { font-weight: 600; margin: 0 0 6px; font-size: 20px; }
  p { color: #94a3b8; font-size: 13px; margin: 0 0 16px; }
  .actions { margin-bottom: 22px; display: flex; gap: 10px; flex-wrap: wrap; }
  button { padding: 10px 18px; background: #4F46E5; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background .15s; }
  button:hover { background: #4338ca; }
  button.ghost { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
  .preview { display: inline-block; border-radius: 6px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .preview svg { display: block; width: min(1584px, 100%); height: auto; }
  .hint { color: #64748b; font-size: 12px; margin-top: 16px; max-width: 880px; line-height: 1.5; }
</style>
</head>
<body>
  <h1>Banni&#232;re LinkedIn &#8212; Roman Rodriguez</h1>
  <p>Format LinkedIn : 1584&#215;396 px &#183; Export en JPG (le format pr&#233;f&#233;r&#233; par LinkedIn).</p>
  <div class="actions">
    <button onclick="downloadPng(3168, 792)">T&#233;l&#233;charger PNG 2&#215; (3168&#215;792) &mdash; recommand&#233;</button>
    <button class="ghost" onclick="downloadPng(1584, 396)">PNG 1&#215; (1584&#215;396)</button>
    <button class="ghost" onclick="downloadJpg(3168, 792, 0.95)">JPG 2&#215; (3168&#215;792)</button>
  </div>

  <div class="preview" id="preview">
$svgInner
  </div>

  <div class="hint">
    La zone &#224; gauche (x:0 &#8594; ~380) est laiss&#233;e vide &#8212; c'est l&#224; que ta photo de profil ronde LinkedIn vient se positionner et chevauche la banni&#232;re. Pour changer les techs affich&#233;es, &#233;dite la liste <code>`$techs</code> dans <code>build-banner.ps1</code> puis relance le script.
  </div>

  <script>
    function rasterize(targetW, targetH, mime, quality, cb) {
      const svg = document.querySelector('#preview svg');
      const xml = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW; canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        // JPG has no transparency — fill an opaque background first
        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#f5f6f8';
          ctx.fillRect(0, 0, targetW, targetH);
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        URL.revokeObjectURL(url);
        canvas.toBlob(cb, mime, quality);
      };
      img.onerror = (e) => alert('Erreur de rendu : ' + e);
      img.src = url;
    }
    function downloadJpg(w, h, q) {
      rasterize(w, h, 'image/jpeg', q, (blob) => {
        const a = document.createElement('a');
        a.download = ``banner-linkedin-roman-`${w}x`${h}.jpg``;
        a.href = URL.createObjectURL(blob);
        a.click();
      });
    }
    function downloadPng(w, h) {
      rasterize(w, h, 'image/png', undefined, (blob) => {
        const a = document.createElement('a');
        a.download = ``banner-linkedin-roman-`${w}x`${h}.png``;
        a.href = URL.createObjectURL(blob);
        a.click();
      });
    }
  </script>
</body>
</html>
"@

Set-Content -Path (Join-Path $here 'banner-linkedin.html') -Value $html -Encoding utf8

$svgKb = [math]::Round((Get-Item (Join-Path $here 'banner-linkedin.svg')).Length / 1KB)
$htmlKb = [math]::Round((Get-Item (Join-Path $here 'banner-linkedin.html')).Length / 1KB)
Write-Output "banner-linkedin.svg : $svgKb KB"
Write-Output "banner-linkedin.html : $htmlKb KB"

# Cleanup helper file
Remove-Item -Path (Join-Path $here '.logos-b64.json') -ErrorAction SilentlyContinue
