"""UI helpers: login/logout/register flows via the real app UI."""
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import FRONTEND_URL

# Seeded demo accounts (DbSeeder.cs, Development environment only)
ADMIN = ("admin@visualizationdsa.dev", "Admin@2024")
TEACHER = ("demo@visualizationdsa.dev", "Demo@2024")
STUDENT_A = ("nguyenvana@visualizationdsa.dev", "User@2024")
STUDENT_B = ("tranthib@visualizationdsa.dev", "User@2024")


def open_login_modal(driver):
    btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(.)='Đăng nhập']")))
    btn.click()
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "auth-email")))
    ensure_login_mode(driver)


def ensure_login_mode(driver):
    """Modal keeps register mode after closing; force back to login mode."""
    if driver.find_elements(By.ID, "auth-confirm-password"):
        driver.find_element(By.XPATH, "//button[contains(., 'Đã có tài khoản')]").click()
        WebDriverWait(driver, 5).until(
            EC.invisibility_of_element_located((By.ID, "auth-confirm-password")))


def switch_to_register(driver):
    toggle = driver.find_element(By.XPATH, "//button[contains(., 'Chưa có tài khoản')]")
    toggle.click()
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "auth-confirm-password")))


def login(driver, email, password):
    """Log in through the header modal. Returns True when header shows avatar."""
    open_login_modal(driver)
    driver.find_element(By.ID, "auth-email").send_keys(email)
    driver.find_element(By.ID, "auth-password").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".user-badge")))


def register(driver, email, username, password, confirm=None):
    open_login_modal(driver)
    switch_to_register(driver)
    driver.find_element(By.ID, "auth-email").send_keys(email)
    driver.find_element(By.ID, "auth-username").send_keys(username)
    driver.find_element(By.ID, "auth-password").send_keys(password)
    driver.find_element(By.ID, "auth-confirm-password").send_keys(confirm or password)
    driver.find_element(By.CSS_SELECTOR, "form.modal-form button[type='submit']").click()


def logout(driver):
    """Log out via header button. Safe when confirm dialog appears."""
    btn = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Đăng xuất']")))
    btn.click()
    try:
        ok = WebDriverWait(driver, 2).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'Xác nhận')]")))
        ok.click()
    except Exception:
        pass  # no confirm dialog


def goto(driver, path):
    # App uses createWebHashHistory -> all routes live behind #/
    url = FRONTEND_URL + "/#/" + path.lstrip("/")
    try:
        driver.get(url)
    except Exception:
        # renderer can be busy right after heavy mounts; retry once
        import time as _t
        _t.sleep(2)
        driver.get(url)


def body_text(driver):
    return driver.find_element(By.TAG_NAME, "body").text


def has_text(driver, text, timeout=10):
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, f"//*[contains(normalize-space(.), '{text}')]")))
        return True
    except Exception:
        return False


def toast_text(driver, contains, timeout=8):
    try:
        WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located(
                (By.XPATH, f"//*[contains(@class, 'toast') and contains(normalize-space(.), '{contains}')]")))
        return True
    except Exception:
        return False


def local_storage_get(driver, key):
    return driver.execute_script(f"return window.localStorage.getItem('{key}')")


def wait_stale_free(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value)))
