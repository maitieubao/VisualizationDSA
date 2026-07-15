@echo off
title VisualizationDSA - Launcher
color 0A
echo.
echo  ======================================================
echo   VisualizationDSA - Khoi dong he thong
echo  ======================================================
echo.

REM ── Kill các process cũ trên các port hay dùng ──
echo [1/4] Kiem tra port cu...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5055 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1

REM ── Backend ──
echo [2/4] Khoi dong Backend (.NET 9 - Port 5055)...
start "BACKEND - VisualizationDSA" cmd /k "cd /d "%~dp0backend\src\WebApi" && dotnet run --urls "http://0.0.0.0:5055" && pause"

REM Chờ backend khởi động
echo [3/4] Cho backend san sang (10 giay)...
timeout /t 10 /nobreak >nul

REM ── Frontend ──
echo [4/4] Khoi dong Frontend (Vue 3 Vite - Port 5173)...
start "FRONTEND - VisualizationDSA" cmd /k "cd /d "%~dp0frontend" && if not exist node_modules (echo [FRONTEND] Dang cai dat thu vien (npm install)... && npm install) && set VITE_API_BASE_URL=http://localhost:5055&& npm run dev && pause"

echo.
echo  ======================================================
echo   He thong dang khoi dong!
echo.
echo   Backend API:  http://localhost:5055/api/v1/algorithms
echo   Frontend App: http://localhost:5173
echo.
echo   Cho khoang 15-20 giay roi mo trinh duyet.
echo  ======================================================
echo.

REM Chờ 20 giây rồi mở trình duyệt
timeout /t 20 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo  Trinh duyet da mo. Chuc ban hoc vui!
pause
