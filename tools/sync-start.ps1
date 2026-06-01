param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoContext {
  $projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $legacyRepoRoot = Join-Path $projectRoot "_github_repo"

  if (Test-Path -LiteralPath (Join-Path $projectRoot ".git")) {
    return @{
      Mode = "direct"
      ProjectRoot = $projectRoot
      RepoRoot = $projectRoot
    }
  }

  if (Test-Path -LiteralPath (Join-Path $legacyRepoRoot ".git")) {
    return @{
      Mode = "legacy"
      ProjectRoot = $projectRoot
      RepoRoot = $legacyRepoRoot
    }
  }

  throw "No Git repository found in the project root or _github_repo."
}

$context = Get-RepoContext
$repoRoot = $context.RepoRoot

Write-Host "Sync start mode: $($context.Mode)"
Write-Host "Git repo: $repoRoot"

& git -C $repoRoot pull --ff-only

