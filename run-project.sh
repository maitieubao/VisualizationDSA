#!/usr/bin/env bash
# ================================================================
#  VisualizationDSA — 1-Click Project Bootstrapper (macOS / Linux)
#  Khởi động đồng thời Backend (.NET) và Frontend (Vite)
#  Backend  : http://localhost:5055
#  Frontend : http://localhost:5173
# ================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "============================================================"
echo "  VisualizationDSA — Starting Full Stack"
echo "  Backend  : http://localhost:5055"
echo "  Frontend : http://localhost:5173"
echo "============================================================"
echo ""

cleanup() {
  echo ""
  echo "[INFO] Shutting down servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "[OK] All servers stopped."
}
trap cleanup EXIT INT TERM

# --- Start Backend ---
echo "[1/2] Starting .NET Backend on port 5055..."
ASPNETCORE_ENVIRONMENT=Development dotnet run --project "$SCRIPT_DIR/backend/src/WebApi/WebApi.csproj" --urls "http://localhost:5055" &

BACKEND_PID=$!

# --- Wait briefly for backend to begin initializing ---
sleep 3

# --- Start Frontend ---
echo "[2/2] Starting Vite Frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
VITE_API_BASE_URL=http://localhost:5055 npm run dev &
FRONTEND_PID=$!

echo ""
echo "[OK] Both servers are running. Press Ctrl+C to stop."
echo ""

# Wait for either process to exit
wait
