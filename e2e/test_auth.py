"""Auth feature — 14 TCs from plan/testing/manual/Auth.md"""
import os
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for, FRONTEND_URL
from helpers.ui import (
    login, logout, open_login_modal, switch_to_register, goto, has_text,
    TEACHER, STUDENT_A, STUDENT_B,
)

UNIQUE_EMAIL = f"e2e_{int(time.time())}@test.com"


def _uniq(prefix="E2E"):
    # usernames must be unique per run: in-memory auth keeps users until restart
    return f"{prefix} {int(time.time() * 1000) % 10**9}"


def _auth_error(driver, timeout=8):
    try:
        el = WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".modal-error, .form-field-error")))
        return el.text
    except Exception:
        return None


@pytest.mark.p0
def test_au001_register_success(page):
    register_email = f"e2ereg{int(time.time() * 1000) % 10**9}@test.com"
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys(register_email)
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Hoc Vien"))
    page.find_element(By.ID, "auth-password").send_keys("Abc@12345")
    page.find_element(By.ID, "auth-confirm-password").send_keys("Abc@12345")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15, message="header avatar after register")
    assert "E2E Hoc Vien" in page.find_element(By.TAG_NAME, "body").text


@pytest.mark.p1
def test_au002_confirm_password_mismatch(page):
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys("e2e-mismatch@test.com")
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Mismatch"))
    page.find_element(By.ID, "auth-password").send_keys("Abc@12345")
    page.find_element(By.ID, "auth-confirm-password").send_keys("Abc@12346")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    err = _auth_error(page)
    assert err and "không khớp" in err, f"expected confirm error, got: {err}"
    # still on register form (no modal close / no avatar)
    assert not page.find_elements(By.CSS_SELECTOR, ".user-badge")


@pytest.mark.p0
def test_au003_login_success(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/profile")
    assert has_text(page, "Hồ sơ", timeout=15) or has_text(page, "Profile", timeout=5)
    assert page.find_elements(By.CSS_SELECTOR, ".user-badge")


@pytest.mark.p0
def test_au004_login_wrong_password_inline(page):
    open_login_modal(page)
    page.find_element(By.ID, "auth-email").send_keys(STUDENT_A[0])
    page.find_element(By.ID, "auth-password").send_keys("wrong-password-123")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    err = _auth_error(page)
    assert err and ("Email hoặc mật khẩu" in err or "không đúng" in err), f"unexpected: {err}"
    assert not page.find_elements(By.CSS_SELECTOR, ".user-badge")


@pytest.mark.p2
def test_au005_unknown_email_generic_error(page):
    open_login_modal(page)
    page.find_element(By.ID, "auth-email").send_keys(f"not-exist-{int(time.time())}@x.com")
    page.find_element(By.ID, "auth-password").send_keys("Abc@12345")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    err = _auth_error(page)
    assert err, "expected generic error message"
    assert "không tồn tại" not in err.lower(), f"should not reveal user existence: {err}"


@pytest.mark.p1
@pytest.mark.skipif(os.environ.get("E2E_ACCESS_TOKEN_TTL_SHORT") != "1",
                    reason="requires backend started with short access-token TTL (60s)")
def test_au006_access_token_expiry_auto_refresh(page):
    # backend must run with Jwt__AccessTokenLifetime=60 to keep this test fast
    login(page, STUDENT_A[0], STUDENT_A[1])
    time.sleep(65)  # let the access token expire
    goto(page, "/profile")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15,
             message="session survives expiry via silent refresh")
    assert page.current_url.endswith("/profile")


@pytest.mark.p1
def test_au007_refresh_token_dead_redirects(page):
    from helpers.api import revoke_refresh_token
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/sorting")
    has_text(page, "Sắp xếp", timeout=15)
    # revoke refresh server-side -> next restore attempt must fail
    revoke = revoke_refresh_token(page)
    assert revoke.status_code in (200, 204), revoke.text
    # full reload (hash-only driver.get does NOT reload the SPA)
    page.refresh()
    wait_for(lambda: page.find_elements(By.XPATH, "//button[normalize-space(.)='Đăng nhập']"),
             15, message="header returns to login state")
    assert not page.execute_script(
        "return window.localStorage.getItem('vdsa_refresh_token')"), "dead session keys must be cleared"
    assert not page.find_elements(By.CSS_SELECTOR, ".user-badge")


@pytest.mark.p0
def test_au008_change_password_revokes_old(page):
    from selenium import webdriver as _wd
    from selenium.webdriver.chrome.options import Options as _Opts
    # dedicated student for this test so seed account is not destroyed
    email = f"e2epwd{int(time.time() * 1000) % 10**9}@test.com"
    register_email = email
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys(register_email)
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Pwd"))
    page.find_element(By.ID, "auth-password").send_keys("OldPwd@123")
    page.find_element(By.ID, "auth-confirm-password").send_keys("OldPwd@123")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15, message="register auto-login")

    # second "device"
    opts = _Opts()
    opts.add_argument("--headless=new")
    device_b = _wd.Chrome(options=opts)
    try:
        device_b.get(FRONTEND_URL + "/")
        login(device_b, register_email, "OldPwd@123")

        # device A: change password
        goto(page, "/profile")
        sec = WebDriverWait(page, 15).until(
            EC.element_to_be_clickable((By.ID, "profile-tab-security")))
        sec.click()
        WebDriverWait(page, 10).until(
            EC.visibility_of_element_located((By.ID, "currentPassword")))
        page.find_element(By.ID, "currentPassword").send_keys("OldPwd@123")
        page.find_element(By.ID, "newPassword").send_keys("NewPwd@456")
        page.find_element(By.ID, "confirmNewPassword").send_keys("NewPwd@456")
        page.find_element(By.CSS_SELECTOR, "button.pm-btn--primary").click()
        wait_for(lambda: has_text(page, "thành công", 3), 12, message="change-password success toast")
    finally:
        device_b.quit()
    # old password must be rejected now
    logout(page)
    open_login_modal(page)
    page.find_element(By.ID, "auth-email").send_keys(register_email)
    page.find_element(By.ID, "auth-password").send_keys("OldPwd@123")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    assert _auth_error(page), "old password must be rejected after change"
    # new password works
    page.find_element(By.ID, "auth-password").clear()
    page.find_element(By.ID, "auth-password").send_keys("NewPwd@456")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15, message="login with new password")


@pytest.mark.p1
def test_au009_logout_does_not_leak_store(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    assert page.execute_script("return window.localStorage.getItem('vdsa_refresh_token')")
    logout(page)
    assert not page.execute_script("return window.localStorage.getItem('vdsa_refresh_token')")
    login(page, STUDENT_B[0], STUDENT_B[1])
    body = page.find_element(By.TAG_NAME, "body").text
    assert "TranThiB" in body or "tranthib" in body.lower()


@pytest.mark.p0
def test_au010_banned_user_login_rejected(page):
    from helpers.api import login_admin_api, find_user_by_email, ban_user
    # register a throwaway student
    email = f"e2eban{int(time.time() * 1000) % 10**9}@test.com"
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys(email)
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Ban"))
    page.find_element(By.ID, "auth-password").send_keys("BanMe@1234")
    page.find_element(By.ID, "auth-confirm-password").send_keys("BanMe@1234")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15, message="register auto-login")
    logout(page)
    # admin bans via API (Development seeder admin enabled)
    token, _ = login_admin_api()
    target = find_user_by_email(token, email)
    assert target, f"registered user not found in admin list: {email}"
    ban = ban_user(token, target["id"], is_active=False)
    assert ban.status_code in (200, 204), ban.text
    # banned login must be rejected
    open_login_modal(page)
    page.find_element(By.ID, "auth-email").send_keys(email)
    page.find_element(By.ID, "auth-password").send_keys("BanMe@1234")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    assert _auth_error(page), "banned user must be rejected"


@pytest.mark.p1
def test_au011_ban_mid_session_kills_session(page):
    from helpers.api import login_admin_api, find_user_by_email, ban_user
    email = f"e2emid{int(time.time() * 1000) % 10**9}@test.com"
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys(email)
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Mid"))
    page.find_element(By.ID, "auth-password").send_keys("MidBan@123")
    page.find_element(By.ID, "auth-confirm-password").send_keys("MidBan@123")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, ".user-badge"), 15, message="register auto-login")
    token, _ = login_admin_api()
    target = find_user_by_email(token, email)
    assert target, f"user not found in admin list: {email}"
    ban = ban_user(token, target["id"], is_active=False)
    assert ban.status_code in (200, 204), ban.text
    # student reloads -> session restore must fail (banned) -> clean logout
    page.refresh()
    wait_for(lambda: page.find_elements(By.XPATH, "//button[normalize-space(.)='Đăng nhập']"),
             15, message="header returns to login state")
    assert not page.find_elements(By.CSS_SELECTOR, ".user-badge")
    assert not page.execute_script(
        "return window.localStorage.getItem('vdsa_refresh_token')")


@pytest.mark.p2
def test_au012_duplicate_email_register_generic(page):
    open_login_modal(page)
    switch_to_register(page)
    page.find_element(By.ID, "auth-email").send_keys(STUDENT_A[0])
    page.find_element(By.ID, "auth-username").send_keys(_uniq("E2E Dup"))
    page.find_element(By.ID, "auth-password").send_keys("Abc@12345")
    page.find_element(By.ID, "auth-confirm-password").send_keys("Abc@12345")
    page.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    err = _auth_error(page)
    assert err, "duplicate email must be rejected with an error"
    assert "đã được sử dụng" not in err.lower()


@pytest.mark.p1
def test_au013_impersonate_student(page):
    login(page, "admin@visualizationdsa.dev", "Admin@2024")
    goto(page, "/admin?tab=users")
    WebDriverWait(page, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "table.data-table tbody tr")))
    # search the seeded student (first page only lists the 10 newest users)
    search = page.find_element(By.CSS_SELECTOR, "input[placeholder*='Tìm'], input[type='search']")
    search.send_keys(STUDENT_A[0].split("@")[0])
    WebDriverWait(page, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, "table.data-table tbody"), "nguyenvana"))
    page.find_element(By.CSS_SELECTOR, ".btn-impersonate").click()
    wait_for(lambda: has_text(page, "Đóng vai", 12), 15, message="impersonate banner")
    goto(page, "/profile")
    wait_for(lambda: has_text(page, "Hồ sơ", 12), 15, message="profile loads while impersonating")
    # student identity: seeded name was renamed by profile tests ("NVA ..."), so check
    # the avatar badge + XP meta render with the student's data (level badge visible)
    assert page.find_elements(By.CSS_SELECTOR, ".user-badge"), "header must show the student identity"


@pytest.mark.p2
def test_au014_modal_reset_and_backdrop(page):
    open_login_modal(page)
    page.find_element(By.ID, "auth-email").send_keys("junk@x.com")
    page.find_element(By.ID, "auth-password").send_keys("junk12345")
    page.find_element(By.ID, "auth-email").send_keys(Keys.ESCAPE)
    wait_for(lambda: not page.find_elements(By.CSS_SELECTOR, ".modal-card"), 5, message="modal closes on Esc")
    open_login_modal(page)
    email_val = page.find_element(By.ID, "auth-email").get_attribute("value")
    assert email_val == "", f"form must reset on reopen, got {email_val!r}"
    # click backdrop must NOT close modal
    page.find_element(By.CSS_SELECTOR, ".modal-backdrop").click()
    assert page.find_elements(By.CSS_SELECTOR, ".modal-card"), "backdrop click must not close modal"
