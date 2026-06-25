param(
  [Parameter(Mandatory = $true)]
  [string]$BugRef
)

powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Use-InsightDeskDevPath.ps1") | Out-Null
Set-Location (Join-Path $env:TEMP "insight-desk-root\server")
npm.cmd run bug:fix -- $BugRef
