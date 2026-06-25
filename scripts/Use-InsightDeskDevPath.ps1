$projectRoot = Split-Path -Parent $PSScriptRoot
$linkPath = Join-Path $env:TEMP "insight-desk-root"

if (-not (Test-Path $linkPath)) {
  New-Item -ItemType Junction -Path $linkPath -Target $projectRoot | Out-Null
}

Write-Host "Dev workspace path:"
Write-Host $linkPath
Write-Host ""
Write-Host "Server path:"
Write-Host (Join-Path $linkPath "server")
Write-Host ""
Write-Host "Client path:"
Write-Host (Join-Path $linkPath "client")
