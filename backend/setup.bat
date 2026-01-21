@echo off
REM Dashboard Backend Setup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Dashboard Backend - Setup Script                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js detected
node --version

echo.
echo 📦 Installing dependencies...
cd backend
npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✓ Dependencies installed

echo.
echo ⚙️  Creating .env file...
if not exist .env (
    copy .env.example .env
    echo ✓ .env file created. Please edit it with your Firebase credentials.
) else (
    echo ✓ .env file already exists
)

echo.
echo 🚀 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Firebase credentials
echo 2. Place firebase-service-account.json in backend/ folder
echo 3. Run: npm run dev (for development)
echo 4. Server will run on http://localhost:5000
echo.
echo Frontend should be opened at http://localhost:3000 or file:///
echo.
pause
