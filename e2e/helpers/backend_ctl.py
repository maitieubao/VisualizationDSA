"""Backend process control: restart the .NET backend between test modules
to reset in-memory state (rate limiters, stateless payment orders, auth users)."""
import os
import subprocess
import time
import socket
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2] / "backend"
LOG_FILE = Path(os.environ.get("TEMP", ".")) / "backend-e2e-ctl.log"
JWT_KEY = "selenium-e2e-256-bit-secret-key-for-local-testing-12345"


def _port_open(port=5055, timeout=2.0):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=timeout):
            return True
    except OSError:
        return False


def _kill_backend():
    script = (
        "Get-CimInstance Win32_Process | Where-Object { "
        "($_.Name -in @('dotnet','dotnet.exe','WebApi','WebApi.exe')) -and "
        "($_.CommandLine -like '*WebApi.csproj*' -or $_.CommandLine -like '*VisualizationDSA*WebApi*')"
        " } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", script],
                   capture_output=True, timeout=60)
    time.sleep(3)


def restart_backend(timeout=150):
    _kill_backend()
    env = os.environ.copy()
    env["Jwt__Key"] = JWT_KEY
    env["ASPNETCORE_ENVIRONMENT"] = "Development"
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        subprocess.Popen(
            ["dotnet", "run", "--project", "src/WebApi/WebApi.csproj"],
            cwd=str(BACKEND_DIR), env=env,
            stdout=log, stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if _port_open():
            time.sleep(2)
            return True
        time.sleep(5)
    raise RuntimeError(f"backend did not come up on port 5055 within {timeout}s")
