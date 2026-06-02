@echo off
cd /d "%~dp0"

set "SYNC_MESSAGE=%*"
if "%SYNC_MESSAGE%"=="" (
  set /p SYNC_MESSAGE=Commit message (optional, press Enter for auto): 
)

powershell -ExecutionPolicy Bypass -File "%~dp0tools\sync-finish.ps1" -Message "%SYNC_MESSAGE%"
if errorlevel 1 pause
