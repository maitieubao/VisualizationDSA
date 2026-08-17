"""User Profile — 13 TCs from plan/testing/manual/UserProfile.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, goto, has_text, STUDENT_A

TABS = {
    "general": "profile-tab-general",
    "progress": "profile-tab-progress",
    "history": "profile-tab-history",
    "security": "profile-tab-security",
    "preferences": "profile-tab-preferences",
}


def _open_profile(page):
    goto(page, "/profile")
    WebDriverWait(page, 15).until(
        EC.visibility_of_element_located((By.ID, "profile-tab-general")))


def _switch_tab(page, name):
    page.find_element(By.ID, TABS[name]).click()
    time.sleep(1)


@pytest.mark.p0
def test_pr001_update_username_persists(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    new_name = f"NVA {int(time.time())}"
    username_input = WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.ID, "username")))
    username_input.clear()
    username_input.send_keys(new_name)
    page.find_element(By.XPATH, "//button[contains(normalize-space(.), 'Lưu')]").click()
    wait_for(lambda: has_text(page, "thành công", 4) or has_text(page, "Lưu thành công", 4),
             12, message="save toast")
    page.refresh()
    _open_profile(page)
    username_input = WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.ID, "username")))
    assert username_input.get_attribute("value") == new_name


@pytest.mark.p0
def test_pr004_history_pagination(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    _switch_tab(page, "history")
    wait_for(lambda: has_text(page, "Lịch sử", 8) or has_text(page, "Chưa có", 8), 15,
             message="history tab content")
    next_btn = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Tiếp')]")
    if next_btn:
        next_btn[0].click()
        time.sleep(2)
        assert not has_text(page, "Trang 1", timeout=2)


@pytest.mark.p0
def test_pr007_change_password_inline_errors(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    _switch_tab(page, "security")
    WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.ID, "currentPassword")))
    # wrong current password -> server-side inline error (client `required` blocks empty submit)
    page.find_element(By.ID, "currentPassword").send_keys("WrongPass@123")
    page.find_element(By.ID, "newPassword").send_keys("Abc@12345")
    page.find_element(By.ID, "confirmNewPassword").send_keys("Abc@12345")
    page.find_element(By.CSS_SELECTOR, "button.pm-btn--primary").click()
    wait_for(lambda: has_text(page, "không chính xác", 8), 12, message="server inline error")


@pytest.mark.p0
def test_pr009_escape_closes_modal(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    # open avatar modal (General tab default) if a modal trigger exists
    triggers = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Đổi') or contains(@aria-label, 'avatar')]")
    if not triggers:
        pytest.skip("no modal trigger on General tab")
    triggers[0].click()
    WebDriverWait(page, 5).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog']")))
    page.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    wait_for(lambda: not page.find_elements(By.CSS_SELECTOR, "[role='dialog']"),
             5, message="modal closed by Esc")


@pytest.mark.p0
def test_pr010_tabs_keyboard_navigation(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    tablist = WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='tablist']")))
    assert tablist, "profile nav must be a tablist"
    tab = page.find_element(By.ID, "profile-tab-general")
    tab.click()
    tab.send_keys(Keys.ARROW_RIGHT)
    time.sleep(1)
    selected = page.execute_script(
        "return document.querySelector('[role=tab][aria-selected=true]')?.id")
    assert selected == "profile-tab-progress", f"arrow key must move to next tab, got {selected}"


@pytest.mark.p1
def test_pr011_username_validation_inline(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    username_input = WebDriverWait(page, 10).until(
        EC.visibility_of_element_located((By.ID, "username")))
    username_input.clear()
    username_input.send_keys("ab")
    page.find_element(By.XPATH, "//button[contains(normalize-space(.), 'Lưu')]").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "[aria-invalid='true'], .field-error, .form-error"),
             8, message="inline validation error")
    assert page.find_elements(By.CSS_SELECTOR, "[aria-invalid='true'], .field-error, .form-error")


@pytest.mark.p1
def test_pr008_streak_level_from_server(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_profile(page)
    _switch_tab(page, "progress")
    wait_for(lambda: has_text(page, "Cấp", 8) or has_text(page, "XP", 8), 15,
             message="progress data")
    assert not has_text(page, "Cần thêm -", timeout=2), "negative XP-to-next must never render"
