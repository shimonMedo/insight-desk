$projectRoot = Split-Path -Parent $PSScriptRoot

powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Use-InsightDeskDevPath.ps1") | Out-Null
Set-Location (Join-Path $env:TEMP "insight-desk-root\server")
$env:PORT = "3002"
npm.cmd run dev
