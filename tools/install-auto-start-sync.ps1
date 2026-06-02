param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$targetPath = Join-Path $projectRoot "start-dev.cmd"
$startupDir = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupDir "Redpoint Start Sync.lnk"

if (-not (Test-Path -LiteralPath $targetPath)) {
  throw "Cannot find start-dev.cmd in the project root."
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Run Redpoint start sync when Windows sign-in completes."
$shortcut.Save()

Write-Host "Installed auto-start sync shortcut:"
Write-Host $shortcutPath

