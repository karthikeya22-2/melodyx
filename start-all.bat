@echo off
title SoundWave Platform Launcher
echo ========================================================
echo   Starting SoundWave Ad-Free Music Platform
echo ========================================================
echo.
echo [1/3] Starting Shared Backend API on http://localhost:5000 ...
start "SoundWave Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node src/index.js"

timeout /t 2 >nul

echo [2/3] Starting Desktop Web App on http://localhost:3000 ...
start "SoundWave Desktop Web (Port 3000)" cmd /k "cd /d %~dp0web-app && npm.cmd run dev"

timeout /t 2 >nul

echo [3/3] Starting Android Mobile App on http://localhost:3001 ...
start "SoundWave Android App (Port 3001)" cmd /k "cd /d %~dp0android-app && npm.cmd run dev"

echo.
echo ========================================================
echo   All 3 services are now running!
echo   - Shared Backend:    http://localhost:5000
echo   - Desktop Web Player: http://localhost:3000
echo   - Android Mobile App: http://localhost:3001
echo ========================================================
echo.
pause

