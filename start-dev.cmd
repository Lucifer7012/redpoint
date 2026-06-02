@echo off
cd /d "%~dp0"
call tools\sync-start.cmd
if errorlevel 1 pause

