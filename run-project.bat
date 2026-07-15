@echo off
REM ================================================================
REM  VisualizationDSA — 1-Click Project Bootstrapper (Windows)
REM  Khoi dong dong thoi Backend (.NET) va Frontend (Vite) 
REM  Backend: http://localhost:5055
REM  Frontend: http://localhost:5173
REM ================================================================

echo.
echo ============================================================
echo   VisualizationDSA — Starting Full Stack
echo   Backend  : http://localhost:5055
echo   Frontend : http://localhost:5173
echo ============================================================
echo.

REM --- Start Backend in a new terminal window ---
start "VisualizationDSA Backend" cmd /k "set ASPNETCORE_ENVIRONMENT=Development&& dotnet run --project backend\src\WebApi\WebApi.csproj --urls http://localhost:5055"



REM --- Wait briefly for backend to begin initializing ---
timeout /t 3 /nobreak >nul

REM --- Start Frontend in a new terminal window ---
start "VisualizationDSA Frontend" cmd /k "cd frontend && set VITE_API_BASE_URL=http://localhost:5055&& npm run dev"



echo.
echo [OK] Both servers are launching in separate windows.
echo      Press Ctrl+C in each window to stop them.
echo.
pause
