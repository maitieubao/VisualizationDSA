"""E2E Selenium test infrastructure for VisualizationDSA.

Covers the 16 manual test features documented in plan/testing/manual/*.md
(205 test cases total). Run with pytest::

    cd e2e
    pip install -r requirements.txt
    pytest -m p0          # smoke subset
    pytest                # full suite

Requires: backend at http://localhost:5055 and frontend at http://localhost:5173.
"""
import os
import time
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

FRONTEND_URL = os.environ.get("E2E_FRONTEND_URL", "http://localhost:5173")
API_BASE = os.environ.get("E2E_API_BASE", "http://localhost:5055/api/v1")

E2E_DIR = Path(__file__).resolve().parent
SCREENSHOT_DIR = E2E_DIR / "screenshots"


def pytest_configure(config):
    config.addinivalue_line("markers", "p0: release-blocking tests")
    config.addinivalue_line("markers", "p1: serious tests")
    config.addinivalue_line("markers", "p2: minor tests")


@pytest.fixture(scope="module")
def driver():
    """Module-scoped Chrome driver (headless). One browser per test module."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--lang=vi")
    if os.environ.get("E2E_SHOW_BROWSER") == "1":
        options.add_argument("--headless=disable")
    drv = webdriver.Chrome(options=options)
    drv.set_page_load_timeout(60)
    yield drv
    drv.quit()


@pytest.fixture()
def page(driver):
    """Navigate to a fresh page with clean session state and guided tours disabled."""
    import time as _t
    driver.get(FRONTEND_URL + "/")
    _t.sleep(2)
    driver.execute_script(
        "window.localStorage.clear(); window.sessionStorage.clear();"
        "window.localStorage.setItem('guided_tour_seen', 'true');"
        "[ '', 'sorting', 'profile', 'admin', 'checkout', 'playground', 'courses',"
        "  'lessons', 'classrooms', 'teacher', 'gamification', 'embed',"
        "  'export-share', 'graph', 'code-ide', 'quiz', 'docs', 'dashboard' ]"
        ".forEach(p => window.localStorage.setItem('page_tour_' + p + '_seen', 'true'));")
    driver.refresh()
    _t.sleep(2)
    yield driver


@pytest.fixture()
def mobile(driver):
    """Switch driver viewport to a mobile size (390x844)."""
    original = driver.get_window_size()
    driver.set_window_size(390, 844)
    yield driver
    driver.set_window_size(original["width"], original["height"])


@pytest.fixture(autouse=True)
def _dismiss_stray_alerts(driver):
    """Any leftover native confirm/alert poisons the next test — clean up."""
    yield
    try:
        driver.switch_to.alert.dismiss()
    except Exception:
        pass


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver is not None:
            SCREENSHOT_DIR.mkdir(exist_ok=True)
            name = item.nodeid.replace("::", "__").replace("/", "_")[:160]
            try:
                driver.save_screenshot(str(SCREENSHOT_DIR / f"{name}.png"))
            except Exception:
                pass


def wait_for(condition, timeout=10.0, interval=0.2, message="condition"):
    """Poll a callable until truthy or timeout. Raises AssertionError."""
    deadline = time.monotonic() + timeout
    last_exc = None
    while time.monotonic() < deadline:
        try:
            if condition():
                return True
        except Exception as exc:  # keep polling while elements appear
            last_exc = exc
        time.sleep(interval)
    raise AssertionError(f"Timed out waiting for {message}" + (f": {last_exc}" if last_exc else ""))
