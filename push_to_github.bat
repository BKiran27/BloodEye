@echo off
echo ======================================================================
echo BloodEye - Deploy and Push to GitHub
echo ======================================================================
echo.
echo Checking git remote origin...
git remote add origin https://github.com/BKiran27/bloodeye.git 2>nul
git remote set-url origin https://github.com/BKiran27/bloodeye.git
git branch -M main

echo Pushing main branch to https://github.com/BKiran27/bloodeye.git ...
git push -u origin main

echo.
echo ======================================================================
echo If the repository does not exist yet on GitHub:
echo 1. Go to https://github.com/new
echo 2. Name your repository: bloodeye
echo 3. Click "Create repository" (leave it empty)
echo 4. Run this script again or run: git push -u origin main
echo ======================================================================
echo.
pause
