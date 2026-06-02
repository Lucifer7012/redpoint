param(
  [string]$Message = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoContext {
  $projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $legacyRepoRoot = Join-Path $projectRoot "_github_repo"
  $uploadRoot = Join-Path $projectRoot "_github_upload"

  if (Test-Path -LiteralPath (Join-Path $projectRoot ".git")) {
    return @{
      Mode = "direct"
      ProjectRoot = $projectRoot
      RepoRoot = $projectRoot
      UploadRoot = $uploadRoot
    }
  }

  if (Test-Path -LiteralPath (Join-Path $legacyRepoRoot ".git")) {
    return @{
      Mode = "legacy"
      ProjectRoot = $projectRoot
      RepoRoot = $legacyRepoRoot
      UploadRoot = $uploadRoot
    }
  }

  throw "No Git repository found in the project root or _github_repo."
}

function Sync-Path {
  param(
    [string]$SourceRoot,
    [string]$TargetRoot,
    [string]$RelativePath
  )

  $sourcePath = Join-Path $SourceRoot $RelativePath
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    return
  }

  $targetPath = Join-Path $TargetRoot $RelativePath
  $sourceItem = Get-Item -LiteralPath $sourcePath

  if ($sourceItem.PSIsContainer) {
    if (-not (Test-Path -LiteralPath $targetPath)) {
      New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    Copy-Item -Path (Join-Path $sourcePath "*") -Destination $targetPath -Recurse -Force
    return
  }

  $targetDir = Split-Path -Parent $targetPath
  if ($targetDir -and -not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }
  Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
}

$trackedPaths = @(
  "index.html",
  "app.js",
  "styles.css",
  "favicon.png",
  "FEATURE_LOG.md",
  "agent.md",
  "enable-auto-start-sync.cmd",
  "disable-auto-start-sync.cmd",
  "start-dev.cmd",
  "finish-dev.cmd",
  "tools",
  "docs"
)

$context = Get-RepoContext
$projectRoot = $context.ProjectRoot
$repoRoot = $context.RepoRoot
$uploadRoot = $context.UploadRoot

Write-Host "Sync finish mode: $($context.Mode)"
Write-Host "Project root: $projectRoot"
Write-Host "Git repo: $repoRoot"

Push-Location $projectRoot
try {
  & node --check app.js
}
finally {
  Pop-Location
}

if (Test-Path -LiteralPath $uploadRoot) {
  foreach ($path in $trackedPaths) {
    Sync-Path -SourceRoot $projectRoot -TargetRoot $uploadRoot -RelativePath $path
  }
}

if ($context.Mode -eq "legacy") {
  foreach ($path in $trackedPaths) {
    Sync-Path -SourceRoot $projectRoot -TargetRoot $repoRoot -RelativePath $path
  }
}

$statusBeforeAdd = (& git -C $repoRoot status --short).Trim()
if ($statusBeforeAdd) {
  Write-Host $statusBeforeAdd
}

& git -C $repoRoot add -- $trackedPaths

$statusAfterAdd = (& git -C $repoRoot status --short).Trim()
if (-not $statusAfterAdd) {
  Write-Host "No changes to commit."
  exit 0
}

if (-not $Message) {
  $Message = "Update project on $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

& git -C $repoRoot commit -m $Message
& git -C $repoRoot push origin main
& git -C $repoRoot log --oneline -1
