# Génère index.html (version de production) à partir du loader de dev
# « Portfolio Roman Rodriguez.html » :
#   1. Précompile les .jsx en JS minifié avec esbuild (npx).
#   2. Inline le JS compilé dans le HTML — plus de Babel dans le navigateur.
# Le résultat fonctionne hors-ligne et sous file:// (React est dans vendor/).

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$htmlPath = Join-Path $here 'Portfolio Roman Rodriguez.html'
$outPath = Join-Path $here 'index.html'
$jsxFiles = @('portfolio-data.jsx', 'variation-soft-cool.jsx', 'app.jsx')

# 1. Compiler chaque JSX en JS minifié
$compiled = foreach ($f in $jsxFiles) {
    $src = Join-Path $here $f
    $tmp = Join-Path $env:TEMP ([IO.Path]::GetFileNameWithoutExtension($f) + '.min.js')
    npx -y esbuild $src --minify --outfile=$tmp --log-level=error
    if ($LASTEXITCODE -ne 0) { throw "esbuild a échoué sur $f" }
    Get-Content -Raw -Encoding UTF8 $tmp
}
$bundle = $compiled -join "`n"

# 2. Remplacer le bloc Babel + scripts JSX par le bundle inline
$html = Get-Content -Raw -Encoding UTF8 $htmlPath
$pattern = '(?s)<!-- Babel standalone.*?<script type="text/babel" src="app\.jsx"></script>'
if (-not [regex]::IsMatch($html, $pattern)) { throw 'Bloc Babel introuvable dans le HTML source — vérifier build-standalone.ps1' }
$replacement = "<script>`n$bundle`n  </script>"
$html = [regex]::Replace($html, $pattern, { $replacement }.GetNewClosure())

Set-Content -Path $outPath -Value $html -Encoding UTF8
Write-Output "Wrote $outPath ($([math]::Round((Get-Item $outPath).Length / 1KB)) KB)"
