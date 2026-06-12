@echo off
title Vintage Photobooth Launcher

:: Check for Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server using Python on http://localhost:8001...
    start "" "http://localhost:8001"
    python -m http.server 8001
    exit /b
)

:: Check for Node.js / npx
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server using npx http-server on http://localhost:8001...
    start "" "http://localhost:8001"
    npx http-server -p 8001
    exit /b
)

echo.
echo =======================================================
echo ERROR: Could not find Python or Node.js/NPM.
echo =======================================================
echo To use the webcam, browsers require a local server.
echo.
echo Please install:
echo 1. Python (https://www.python.org) or
echo 2. Node.js (https://nodejs.org)
echo.
pause
