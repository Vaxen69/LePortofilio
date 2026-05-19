# Build a standalone index.html that inlines portfolio-data.jsx and
# variation-soft-cool.jsx into the loader HTML. Result works under file://
# (no fetches needed for the .jsx sources).

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$htmlPath = Join-Path $here 'Portfolio Roman Rodriguez.html'
$dataPath = Join-Path $here 'portfolio-data.jsx'
$variationPath = Join-Path $here 'variation-soft-cool.jsx'
$outPath = Join-Path $here 'index.html'

$html = Get-Content -Raw -Encoding UTF8 $htmlPath
$data = Get-Content -Raw -Encoding UTF8 $dataPath
$variation = Get-Content -Raw -Encoding UTF8 $variationPath

$dataTag = '<script type="text/babel" src="portfolio-data.jsx"></script>'
$variationTag = '<script type="text/babel" src="variation-soft-cool.jsx"></script>'

$dataInline = "<script type=`"text/babel`" data-presets=`"react`">`n$data`n</script>"
$variationInline = "<script type=`"text/babel`" data-presets=`"react`">`n$variation`n</script>"

$html = $html.Replace($dataTag, $dataInline)
$html = $html.Replace($variationTag, $variationInline)

Set-Content -Path $outPath -Value $html -Encoding UTF8
Write-Output "Wrote $outPath ($([math]::Round((Get-Item $outPath).Length / 1KB)) KB)"
