$projectRoot = Split-Path -Parent $PSScriptRoot

Set-Location $projectRoot
npm.cmd --workspace client run dev
