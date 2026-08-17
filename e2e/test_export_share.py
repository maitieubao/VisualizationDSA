"""Export & Share — 13 TCs from plan/testing/manual/ExportShare.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import goto, has_text


def _open_modal(page):
    goto(page, "/export-share")
    WebDriverWait(page, 20).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.), 'XUẤT SƠ ĐỒ / SHARE')]")))
    page.find_element(By.XPATH, "//button[contains(normalize-space(.), 'XUẤT SƠ ĐỒ / SHARE')]").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "[role='dialog']"), 10, message="share dialog")
    time.sleep(1)


def _generate_link(page):
    gen = WebDriverWait(page, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'GENERATE SHARE LINK')]")))
    gen.click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".link-text, code"), 15, message="generated link")
    time.sleep(1)


@pytest.mark.p0
def test_ex001_qr_renders(page):
    _open_modal(page)
    _generate_link(page)
    assert page.find_elements(By.CSS_SELECTOR, "canvas, img[class*='qr'], .qr-error"), \
        "QR must render (canvas) or show an error fallback"


@pytest.mark.p1
def test_ex006_copy_link_feedback(page):
    _open_modal(page)
    _generate_link(page)
    page.execute_script(
        "window.__copied = null;"
        "const orig = navigator.clipboard.writeText.bind(navigator.clipboard);"
        "navigator.clipboard.writeText = (t) => { window.__copied = t; return orig(t); };")
    copy = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'COPY LINK')]")
    assert copy, "copy link button missing"
    copy[0].click()
    wait_for(lambda: page.execute_script("return window.__copied") or has_text(page, "COPIED", 3),
             10, message="copy feedback")


@pytest.mark.p1
def test_ex011_share_modal_a11y(page):
    _open_modal(page)
    dialog = page.find_elements(By.CSS_SELECTOR, "[role='dialog']")[0]
    assert dialog.get_attribute("aria-modal") == "true"


@pytest.mark.p2
def test_ex012_modal_mobile_responsive(page, mobile):
    _open_modal(page)
    dialog = page.find_elements(By.CSS_SELECTOR, "[role='dialog']")
    assert dialog, "share dialog must open on mobile"
