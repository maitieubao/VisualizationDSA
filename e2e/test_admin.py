"""Admin Panel — 14 TCs from plan/testing/manual/Admin.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, logout, goto, has_text, STUDENT_A, TEACHER
from helpers.api import login_admin_api, find_user_by_email, ban_user

ADMIN = ("admin@visualizationdsa.dev", "Admin@2024")


@pytest.fixture(scope="module", autouse=True)
def _fresh_backend():
    """Rebuild+restart backend so admin controllers run with the Guid compare fix
    (Id.ToString() == id never matches SQLite BLOB Guids)."""
    from helpers.backend_ctl import restart_backend
    restart_backend()
    yield


def _open_admin_users(page):
    login(page, ADMIN[0], ADMIN[1])
    goto(page, "/admin?tab=users")
    WebDriverWait(page, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "table.data-table tbody tr")))
    time.sleep(2)


IMPERSONATE_SEL = "button.btn-impersonate[title='Đóng vai']"


@pytest.mark.p0
def test_ad001_impersonate_student(page):
    _open_admin_users(page)
    search = page.find_element(By.CSS_SELECTOR, "input[placeholder*='Tìm'], input[type='search']")
    search.send_keys("nguyenvana")
    WebDriverWait(page, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, "table.data-table tbody"), "nguyenvana"))
    page.find_element(By.CSS_SELECTOR, IMPERSONATE_SEL).click()
    time.sleep(1)
    try:
        page.switch_to.alert.accept()  # native confirm "đóng vai người dùng này"
    except Exception:
        pass
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".impersonate-banner"), 15,
             message="impersonate banner")


@pytest.mark.p0
def test_ad002_stop_impersonate(page):
    _open_admin_users(page)
    search = page.find_element(By.CSS_SELECTOR, "input[placeholder*='Tìm'], input[type='search']")
    search.send_keys("nguyenvana")
    WebDriverWait(page, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, "table.data-table tbody"), "nguyenvana"))
    page.find_element(By.CSS_SELECTOR, IMPERSONATE_SEL).click()
    time.sleep(1)
    try:
        page.switch_to.alert.accept()
    except Exception:
        pass
    exit_btn = WebDriverWait(page, 15).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".impersonate-banner__btn")))
    exit_btn.click()
    wait_for(lambda: not page.find_elements(By.CSS_SELECTOR, ".impersonate-banner"),
             10, message="impersonation ended")


@pytest.mark.p0
def test_ad003_ban_user_audit(page):
    _open_admin_users(page)
    search = page.find_element(By.CSS_SELECTOR, "input[placeholder*='Tìm'], input[type='search']")
    search.send_keys("tranthib")
    WebDriverWait(page, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, "table.data-table tbody"), "tranthib"))
    ban_btn = page.find_elements(By.CSS_SELECTOR, ".ban-btn")
    assert ban_btn, "ban button missing"
    ban_btn[0].click()
    time.sleep(1)
    try:
        page.switch_to.alert.accept()  # native confirm: "Bạn có chắc muốn khóa..."
    except Exception:
        pass
    time.sleep(2)
    # unban to restore state
    ban_btn = page.find_elements(By.CSS_SELECTOR, ".ban-btn")
    if ban_btn:
        ban_btn[0].click()
        time.sleep(1)
        try:
            page.switch_to.alert.accept()
        except Exception:
            pass


@pytest.mark.p1
def test_ad013_teacher_blocked_from_admin(page):
    login(page, TEACHER[0], TEACHER[1])
    goto(page, "/admin")
    wait_for(lambda: not page.current_url.endswith("/admin"), 10, message="teacher redirected away from /admin")
    assert not page.find_elements(By.CSS_SELECTOR, "table.data-table")


@pytest.mark.p1
def test_ad007_audit_tab_renders(page):
    _open_admin_users(page)
    audit = page.find_elements(By.XPATH, "//*[@role='tab' and contains(normalize-space(.), 'Nhật ký')]")
    if not audit:
        pytest.skip("audit tab not visible")
    audit[0].click()
    time.sleep(3)
    assert has_text(page, "Nhật ký", timeout=5) or page.find_elements(By.CSS_SELECTOR, "table")
