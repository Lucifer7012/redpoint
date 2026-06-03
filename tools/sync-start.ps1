param()

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

Write-Host "Sync start mode: $($context.Mode)"
Write-Host "Project root: $projectRoot"
Write-Host "Git repo: $repoRoot"

& git -C $repoRoot pull --ff-only

if ($context.Mode -eq "legacy") {
  foreach ($path in $trackedPaths) {
    Sync-Path -SourceRoot $repoRoot -TargetRoot $projectRoot -RelativePath $path
  }

  if (Test-Path -LiteralPath $uploadRoot) {
    foreach ($path in $trackedPaths) {
      Sync-Path -SourceRoot $repoRoot -TargetRoot $uploadRoot -RelativePath $path
    }
  }

  Write-Host "Synced tracked files from _github_repo back to the project root."
}
