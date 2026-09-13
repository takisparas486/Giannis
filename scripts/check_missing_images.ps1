# PowerShell missing images checker
# Writes missing-images-report-powershell.txt to project root

$root = Split-Path -Parent $PSScriptRoot
$categoriesPath = Join-Path $root 'categories.js'
$imagesRoot = Join-Path $root 'images'
$outPath = Join-Path $root 'missing-images-report-powershell.txt'

if (-not (Test-Path $categoriesPath)) {
    Write-Error "categories.js not found at $categoriesPath"
    exit 1
}
if (-not (Test-Path $imagesRoot)) {
    Write-Error "images folder not found at $imagesRoot"
    exit 1
}

$catContent = Get-Content -Path $categoriesPath -Raw -ErrorAction Stop
$regex = 'images/([^/"]+)/([^"]+)'
$matches = [regex]::Matches($catContent, $regex)
$refs = @{}
foreach ($m in $matches) {
    $cat = $m.Groups[1].Value
    $file = $m.Groups[2].Value
    if (-not $refs.ContainsKey($cat)) { $refs[$cat] = @() }
    $refs[$cat] += $file
}

# gather existing image files by folder
$existing = @{}
Get-ChildItem -Path $imagesRoot -Directory | ForEach-Object {
    $folder = $_.Name
    $files = Get-ChildItem -Path $_.FullName -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
    $existing[$folder] = $files
}

$lines = @()
$lines += "REFERENCED_CATEGORIES: $($refs.Keys.Count)"
$lines += "IMAGE_FOLDERS_FOUND: $($existing.Keys.Count)"
$lines += ""

# missing referenced files
$lines += "MISSING_REFERENCED_FILES:"
$missCount = 0
foreach ($cat in $refs.Keys | Sort-Object) {
    foreach ($f in ($refs[$cat] | Sort-Object -Unique)) {
        $p = Join-Path -Path $imagesRoot -ChildPath (Join-Path $cat $f)
        if (-not (Test-Path $p)) {
            $lines += "$cat/$f"
            $missCount++
        }
    }
}
$lines += "-- total missing: $missCount"
$lines += ""

# unreferenced non-IMG files
$lines += "UNREFERENCED_NONIMG_FILES:"
$unrefCount = 0
foreach ($cat in $existing.Keys | Sort-Object) {
    foreach ($f in ($existing[$cat] | Sort-Object)) {
        if ($f -match '^IMG_') { continue }
        if ($refs.ContainsKey($cat) -and ($refs[$cat] -contains $f)) { continue }
        $lines += "$cat/$f"
        $unrefCount++
    }
}
$lines += "-- total unreferenced non-IMG: $unrefCount"
$lines += ""

# md5 and size for unreferenced
$lines += "UNREFERENCED_WITH_MD5_AND_SIZE:"
foreach ($cat in $existing.Keys | Sort-Object) {
    foreach ($f in ($existing[$cat] | Sort-Object)) {
        if ($f -match '^IMG_') { continue }
        if ($refs.ContainsKey($cat) -and ($refs[$cat] -contains $f)) { continue }
        $full = Join-Path $imagesRoot (Join-Path $cat $f)
        try {
            $size = (Get-Item $full).Length
            $hash = Get-FileHash -Algorithm MD5 -Path $full -ErrorAction Stop | Select-Object -ExpandProperty Hash
            $lines += "$cat/$f, $size bytes, md5:$hash"
        } catch {
            $lines += "$cat/$f, ERROR: $($_.Exception.Message)"
        }
    }
}

$lines | Out-File -FilePath $outPath -Encoding utf8 -Force
Write-Output "WROTE: $outPath"
