@echo off
REM BloodEye - Windows Development Setup Script
REM Usage: scripts\setup.bat

echo ==========================================
echo   BloodEye - Development Setup (Windows)
echo ==========================================
echo.

REM Check Python
echo [1/6] Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.11+ is required but not found.
    echo Install from: https://www.python.org/downloads/
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo   Python: %%i

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js 20+ is required but not found.
    echo Install from: https://nodejs.org/
    exit /b 1
)
for /f %%i in ('node --version') do echo   Node.js: %%i

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is required but not found.
    exit /b 1
)
for /f %%i in ('npm --version') do echo   npm: %%i

echo.

REM Setup environment
echo [2/6] Setting up environment...
if not exist .env (
    copy .env.example .env >nul
    echo   Created .env from .env.example
) else (
    echo   .env already exists, skipping
)

echo.

REM Setup backend
echo [3/6] Setting up backend...
cd backend

if not exist venv (
    python -m venv venv
    echo   Created Python virtual environment
)

call venv\Scripts\activate.bat
pip install --quiet -r requirements.txt
echo   Installed Python dependencies
cd ..

echo.

REM Setup frontend
echo [4/6] Setting up frontend...
cd frontend
call npm install --silent
echo   Installed Node.js dependencies
cd ..

echo.

REM Create data directories
echo [5/6] Creating data directories...
if not exist data\uploads mkdir data\uploads
if not exist data\datasets mkdir data\datasets
if not exist data\models mkdir data\models
echo   Created data directories

echo.

echo [6/6] Setup complete!
echo.
echo ==========================================
echo   To start the application:
echo.
echo   Backend:
echo     cd backend
echo     venv\Scripts\activate
echo     uvicorn app.main:app --reload --port 8000
echo.
echo   Frontend (new terminal):
echo     cd frontend
echo     npm run dev
echo.
echo   Then open: http://localhost:5173
echo ==========================================
