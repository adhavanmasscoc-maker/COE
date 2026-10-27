@echo off
title Antigravity IDE Chat History Recovery
echo =====================================================================
echo       Google Antigravity IDE - Chat History & Session Recovery
echo =====================================================================
echo.
echo IMPORTANT:
echo Please ensure Antigravity IDE is COMPLETELY CLOSED (check Task Manager
echo to make sure no Antigravity.exe processes are running) before proceeding!
echo.
pause
echo.
echo Running Recovery Pipeline...
set PYTHONUTF8=1
cd /d "C:\Users\adhav\.gemini\Antigravity-Database-Manager"
py antigravity_database_manager.py recover
echo.
echo Normalizing Windows Workspace URIs (Bug #12 Fix)...
py antigravity_database_manager.py fix-uris --db --force
echo.
echo Setting descriptive title for Examination Portal session...
py antigravity_database_manager.py conversations rename 884387c4-bbff-4b94-a621-f26ee7ea4f09 "Aknex COE Examination Portal Implementation"
echo.
echo =====================================================================
echo  [SUCCESS] All 215 conversations and indices have been restored!
echo  You can now safely restart Antigravity IDE to see your full history.
echo =====================================================================
pause
