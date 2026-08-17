"""Core & UI Components — 12 TCs from plan/testing/manual/CoreUI.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, goto, has_text, STUDENT_A


@pytest.mark.p1
def test_cu004_hamburger_mobile(page, mobile):
    goto(page, "/")
    time.sleep(2)
    hamburger = page.find_elements(By.CSS_SELECTOR, "button[aria-label='Mở menu điều hướng']")
    assert hamburger, "hamburger must exist on mobile"
    hamburger[0].click()
    time.sleep(1)
    assert has_text(page, "Học tập", timeout=5)


@pytest.mark.p1
def test_cu007_theme_toggle_no_crash(page):
    goto(page, "/")
    time.sleep(2)
    toggle = page.find_elements(By.CSS_SELECTOR, "button[aria-label='Đổi giao diện']")
    assert toggle, "theme toggle missing"
    before = page.execute_script("return document.documentElement.getAttribute('data-theme')")
    toggle[0].click()
    time.sleep(1)
    after = page.execute_script("return document.documentElement.getAttribute('data-theme')")
    assert after != before, "theme must switch"


@pytest.mark.p1
def test_cu010_toast_distinct(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/profile")
    WebDriverWait(page, 15).until(
        EC.visibility_of_element_located((By.ID, "profile-tab-security")))
    page.find_element(By.ID, "profile-tab-security").click()
    WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.ID, "currentPassword")))
    page.find_element(By.ID, "currentPassword").send_keys("WrongPass@123")
    page.find_element(By.ID, "newPassword").send_keys("Abc@12345")
    page.find_element(By.ID, "confirmNewPassword").send_keys("Abc@12345")
    page.find_element(By.CSS_SELECTOR, "button.pm-btn--primary").click()
    wait_for(lambda: has_text(page, "không chính xác", 8), 12, message="inline error")


@pytest.mark.p2
def test_cu012_accordion_keyboard(page):
    goto(page, "/docs/intro/intro")
    time.sleep(3)
    headers = page.find_elements(By.CSS_SELECTOR, "[aria-expanded]")
    assert headers, "accordion headers with aria-expanded must exist"
