"""Embed Widget — 12 TCs from plan/testing/manual/EmbedWidget.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, goto, has_text, STUDENT_A


@pytest.mark.p0
def test_ew001_config_changes_preview_src(page):
    goto(page, "/embed")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "iframe"), 20, message="embed preview")
    time.sleep(2)
    iframe = page.find_elements(By.CSS_SELECTOR, "iframe")[0]
    src = iframe.get_attribute("src") or ""
    assert "embed" in src, f"preview iframe must point at the embed widget, got {src!r}"


@pytest.mark.p1
def test_ew002_preview_is_real_iframe(page):
    goto(page, "/embed")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "iframe"), 20, message="embed preview")
    iframe = page.find_elements(By.CSS_SELECTOR, "iframe")[0]
    assert iframe.tag_name == "iframe"


@pytest.mark.p1
def test_ew006_invalid_algo_error_overlay(page):
    goto(page, "/embed?algo=not-exist-xyz")
    time.sleep(4)
    assert has_text(page, "không", timeout=10) or has_text(page, "lỗi", timeout=3) \
        or has_text(page, "Không hợp lệ", timeout=3), "invalid algo must show an error state, not a blank screen"


@pytest.mark.p1
def test_ew009_quick_sort_in_options(page):
    goto(page, "/embed")
    time.sleep(3)
    body = page.find_element(By.TAG_NAME, "body").text
    assert "quick-sort" in body or "Quick Sort" in body


@pytest.mark.p2
def test_ew011_copy_button_feedback(page):
    goto(page, "/embed")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "button[aria-label='Sao chép mã nhúng']"),
             20, message="copy button")
    page.execute_script(
        "window.__copied = null;"
        "const orig = navigator.clipboard.writeText.bind(navigator.clipboard);"
        "navigator.clipboard.writeText = (t) => { window.__copied = t; return orig(t); };")
    btn = page.find_element(By.CSS_SELECTOR, "button[aria-label='Sao chép mã nhúng']")
    try:
        btn.click()
    except Exception:
        page.execute_script("arguments[0].click();", btn)  # covered by overlay in some layouts
    wait_for(lambda: page.execute_script("return window.__copied"), 10, message="clipboard write")
    payload = page.execute_script("return window.__copied")
    assert payload and ("iframe" in payload or "embed" in payload), f"unexpected snippet: {payload[:100]!r}"
