@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0tools\install-auto-start-sync.ps1"
if errorlevel 1 pause

