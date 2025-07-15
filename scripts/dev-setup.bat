@echo off
REM Docker development setup script for Windows

echo [INFO] Setting up development environment with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build the image
echo [INFO] Building Docker image...
docker build -t bun-http-template .
if errorlevel 1 (
    echo [ERROR] Failed to build Docker image
    exit /b 1
)

REM Start the container
echo [INFO] Starting development container...
docker-compose up --build -d
if errorlevel 1 (
    echo [ERROR] Failed to start development container
    exit /b 1
)

echo [INFO] Development environment is ready!
echo [INFO] App running at: http://localhost:3000
echo [INFO] Health check: http://localhost:3000/health
echo.
echo [INFO] To view logs: docker-compose logs -f
echo [INFO] To stop: docker-compose down

pause
