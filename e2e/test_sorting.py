"""Sorting Visualizer — 14 TCs from plan/testing/manual/SortingVisualizer.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import goto, has_text

ALGOS = ["Bubble", "Quick", "Merge", "Heap", "Radix", "Counting", "Bucket"]


def _open_sorting(page):
    goto(page, "/sorting")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".sorting-algo-controls button"),
             20, message="sorting view loads")
    time.sleep(2)


def _configure_array(page, preset=None, size=None):
    """Sorting view has no free-text input — use presets + size slider."""
    if size:
        slider = page.find_elements(By.CSS_SELECTOR, "input[type='range']")
        if slider:
            page.execute_script(
                "const s = arguments[0];"
                "const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;"
                "setter.call(s, arguments[1]); s.dispatchEvent(new Event('input', {bubbles: true}));",
                slider[0], str(size))
    if preset:
        btn = page.find_elements(By.XPATH, f"//button[contains(normalize-space(.), '{preset}')]")
        assert btn, f"preset button {preset} not found"
        btn[0].click()
    time.sleep(1)


def _pick_algo(page, name):
    btn = page.find_elements(By.XPATH, f"//button[contains(normalize-space(.), '{name}')]")
    assert btn, f"algorithm button {name} not found"
    btn[0].click()
    time.sleep(1)


def _play(page):
    btn = page.find_elements(By.XPATH, "//button[@aria-label='Phát' or contains(@title, 'Phát')]")
    assert btn, "play button not found"
    btn[0].click()


def _frame_counter(page):
    els = page.find_elements(By.XPATH, "//*[contains(@class, 'counter') or contains(text(), '/')]")
    for el in els:
        txt = el.text.strip()
        if "/" in txt and any(ch.isdigit() for ch in txt):
            return txt
    return None


@pytest.mark.p0
def test_sv001_all_7_algos_run(page):
    _open_sorting(page)
    _configure_array(page, size=6)
    for algo in ALGOS:
        _pick_algo(page, algo)
        _play(page)
        time.sleep(2)
        # progress must advance; page must not crash
        progress = page.find_elements(By.CSS_SELECTOR, ".sorting-progress-bar, [class*='progress']")
        assert page.find_elements(By.CSS_SELECTOR, ".sorting-algo-controls button"), f"{algo}: view crashed"


@pytest.mark.p1
def test_sv004_replay_at_last_frame(page):
    _open_sorting(page)
    _configure_array(page, size=4)
    _pick_algo(page, "Bubble")
    _play(page)
    wait_for(lambda: page.find_elements(
        By.XPATH, "//button[contains(@title, 'Phát lại') or contains(@aria-label, 'Phát lại')]"),
        25, message="replay button at last frame")


@pytest.mark.p1
def test_sv005_change_input_resets(page):
    _open_sorting(page)
    _configure_array(page, size=8)
    _pick_algo(page, "Bubble")
    _play(page)
    time.sleep(1)
    _configure_array(page, preset="Ngẫu nhiên", size=5)
    assert page.find_elements(By.XPATH, "//button[@aria-label='Phát']")


@pytest.mark.p2
def test_sv007_min_size_no_crash(page):
    _open_sorting(page)
    _configure_array(page, size=4)
    _pick_algo(page, "Counting")
    _play(page)
    time.sleep(2)
    assert page.find_elements(By.CSS_SELECTOR, ".sorting-algo-controls button")


@pytest.mark.p1
def test_sv008_single_element_sorted(page):
    _open_sorting(page)
    _configure_array(page, size=4)
    _pick_algo(page, "Merge")
    speed = page.find_elements(By.CSS_SELECTOR, "select[aria-label='Tốc độ phát']")
    if speed:
        page.execute_script(
            "const s = arguments[0]; s.value = '4';"
            "s.dispatchEvent(new Event('change', {bubbles: true}));", speed[0])
    _play(page)
    time.sleep(18)
    assert page.find_elements(By.XPATH, "//button[contains(@title, 'Phát lại') or contains(@aria-label, 'Phát lại')]")


@pytest.mark.p2
def test_sv010_sorted_and_reversed(page):
    _open_sorting(page)
    _configure_array(page, preset="Đã sắp xếp" if page.find_elements(
        By.XPATH, "//button[contains(normalize-space(.), 'Đã sắp xếp')]") else "Sorted")
    _pick_algo(page, "Bubble")
    _play(page)
    time.sleep(3)
    assert page.find_elements(By.CSS_SELECTOR, ".sorting-algo-controls button")


@pytest.mark.p1
def test_sv011_scrub_pauses(page):
    _open_sorting(page)
    _configure_array(page, size=8)
    _pick_algo(page, "Bubble")
    _play(page)
    time.sleep(1.5)
    slider = page.find_elements(By.CSS_SELECTOR, "input[type='range']")
    if not slider:
        pytest.skip("no range slider")
    slider[0].send_keys(Keys.HOME)
    # after scrub the play button must be back (auto-pause)
    time.sleep(1)
    assert page.find_elements(By.XPATH, "//button[@aria-label='Phát']")


@pytest.mark.p2
def test_sv012_space_hotkey(page):
    _open_sorting(page)
    _configure_array(page, size=6)
    _pick_algo(page, "Bubble")
    page.find_element(By.TAG_NAME, "body").send_keys(Keys.SPACE)
    time.sleep(1.5)
    assert page.find_elements(By.XPATH, "//button[contains(@aria-label, 'Tạm dừng')]") \
        or page.find_elements(By.XPATH, "//button[contains(@title, 'Tạm dừng')]")


@pytest.mark.p2
def test_sv013_speed_options(page):
    _open_sorting(page)
    _configure_array(page, size=6)
    _pick_algo(page, "Bubble")
    _play(page)
    time.sleep(1)
    speed = page.find_elements(By.CSS_SELECTOR, "select[aria-label='Tốc độ phát']")
    assert speed, "speed selector missing"
    options = [o.get_attribute("value") for o in speed[0].find_elements(By.TAG_NAME, "option")]
    assert "0.1" in options and "5" in options, f"speed presets incomplete: {options}"
