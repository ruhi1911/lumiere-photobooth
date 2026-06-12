@echo off
title Lumiere Git Commit & Deploy Helper
echo =======================================================
echo         Lumiere Git Commit & Deploy Helper 🎞️
echo =======================================================
echo.
echo This script will help you commit your photobooth files,
echo configure your README, and prepare push to GitHub.
echo.
echo NOTE: Please make sure Git is installed on your computer
echo and that you have created a repository named 'lumiere-photobooth'
echo on github.com.
echo.

:: Check for Git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git could not be found on your system.
    echo Please download and install Git from: https://git-scm.com/
    echo once installed, restart this script!
    echo.
    pause
    exit /b
)

:: Prompt for GitHub Username
set /p username="Enter your GitHub Username: "
if "%username%"=="" (
    echo Username cannot be empty!
    pause
    exit /b
)

echo.
echo Updating README.md with your username '%username%'...

:: Replace placeholder in README.md using PowerShell
powershell -Command "(Get-Content README.md) -replace 'your-github-username', '%username%' | Set-Content README.md"

echo Initializing Git repository...
git init

echo Staging files...
git add .

echo Committing...
git commit -m "Initial commit of Lumiere photobooth website"

echo Setting main branch...
git branch -M main

echo Linking remote repository...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%%username%%/lumiere-photobooth.git

echo.
echo =======================================================
echo Repository configured!
echo =======================================================
echo To push your code, run:
echo   git push -u origin main
echo.
echo After pushing, go to your repository Settings -^> Pages
echo and set the branch to 'main' and root folder to '/'
echo to host it on GitHub Pages!
echo.
set /p pushnow="Would you like to try pushing now? (y/n): "
if /i "%pushnow%"=="y" (
    git push -u origin main
)

pause
