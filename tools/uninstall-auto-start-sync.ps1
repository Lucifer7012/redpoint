param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$startupDir = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupDir "Redpoint Start Sync.lnk"

if (Test-Path -LiteralPath $shortcutPath) {
  Remove-Item -LiteralPath $shortcutPath -Force
  Write-Host "Removed auto-start sync shortcut:"
  Write-Host $shortcutPath
  exit 0
}

Write-Host "Auto-start sync shortcut was not installed."

