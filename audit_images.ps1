$root = (Get-Location).Path
$text = Get-Content -Path (Join-Path $root 'categories.js') -Raw
$refs = [regex]::Matches($text, '"image"\s*:\s*"([^"]+)"') |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object -Unique

$actual = Get-ChildItem -Path (Join-Path $root 'images') -Recurse -File |
    Where-Object { $_.Extension -match '\.(png|jpg|jpeg|gif|webp|svg)$' } |
    ForEach-Object {
        $_.FullName.Substring($root.Length + 1).Replace('\\', '/')
    }

$missing = $refs | Where-Object { -not (Test-Path (Join-Path $root $_)) }
$unref = $actual | Where-Object { $_ -notin $refs }

function Normalize-Name($n) {
    return ($n.ToLower() -replace '[^a-z0-9]+', '')
}

$similar = @()
foreach ($r in $missing) {
    $base = [System.IO.Path]::GetFileName($r)
    $sameName = $actual | Where-Object { [System.IO.Path]::GetFileName($_) -eq $base }
    if (-not $sameName) {
        $cands = $actual | Where-Object { (Normalize-Name ([System.IO.Path]::GetFileName($_))) -eq (Normalize-Name $base) }
        if ($cands) {
            $similar += [pscustomobject]@{ Ref = $r; Candidates = $cands }
        }
    }
}

Write-Host "TOTAL_REFERENCED_UNIQUE $($refs.Count)"
Write-Host "TOTAL_ACTUAL_FILES $($actual.Count)"
Write-Host "MISSING_REFERENCES $($missing.Count)"
Write-Host "UNREFERENCED_FILES $($unref.Count)"
Write-Host "POSSIBLE_RENAMES_OR_MISPLACED $($similar.Count)"
Write-Host "MISSING_REFERENCES_LIST"
$missing | ForEach-Object { Write-Host $_ }
Write-Host "UNREFERENCED_FILES_LIST"
$unref | ForEach-Object { Write-Host $_ }
Write-Host "SIMILAR_NAME_MATCHES"
foreach ($entry in $similar) {
    Write-Host "$($entry.Ref) -> $($entry.Candidates -join ',')"
}
