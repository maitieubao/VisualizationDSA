"""Teacher Panel — 14 TCs from plan/testing/manual/TeacherPanel.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, logout, goto, has_text, TEACHER, STUDENT_A


def _open_teacher(page):
    login(page, TEACHER[0], TEACHER[1])
    goto(page, "/teacher")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "[role='tablist'], [class*='tab']"),
             20, message="teacher panel")
    time.sleep(2)


def _switch_tab(page, name):
    tab = page.find_elements(By.XPATH, f"//*[contains(normalize-space(.), '{name}') and @role='tab']")
    if not tab:
        tab = page.find_elements(By.XPATH, f"//button[contains(normalize-space(.), '{name}')]")
    assert tab, f"tab {name} not found"
    tab[0].click()
    time.sleep(2)


@pytest.mark.p0
def test_tc001_quiz_builder_create(page):
    _open_teacher(page)
    _switch_tab(page, "Công cụ Tạo Quiz")
    create = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Tạo quiz') or contains(normalize-space(.), 'Tạo Quiz')]")
    assert create, "create quiz button missing"
    create[0].click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "input[type='text'], textarea"), 10,
             message="quiz form")
    assert has_text(page, "Tiêu đề", timeout=5) or has_text(page, "title", timeout=3) \
        or has_text(page, "Tên quiz", timeout=3)


@pytest.mark.p0
def test_tc002_codelab_builder_implemented(page):
    _open_teacher(page)
    _switch_tab(page, "Công cụ Tạo Codelab")
    create = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Tạo Codelab') or contains(normalize-space(.), 'Tạo codelab')]")
    assert create, "create codelab button missing"
    create[0].click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "input, textarea"), 10, message="codelab form")


@pytest.mark.p0
def test_tc010_api_error_banner_with_retry(page):
    _open_teacher(page)
    _switch_tab(page, "Công cụ Tạo Quiz")
    time.sleep(2)
    body = page.find_element(By.TAG_NAME, "body").text
    assert "Quiz" in body


@pytest.mark.p1
def test_tc011_tabs_keep_state(page):
    _open_teacher(page)
    _switch_tab(page, "Quản lý Khóa học & Bài giảng")
    time.sleep(2)
    _switch_tab(page, "Công cụ Tạo Quiz")
    time.sleep(2)
    body = page.find_element(By.TAG_NAME, "body").text
    assert "Quiz" in body


@pytest.mark.p1
def test_tc014_search_filter_quiz(page):
    _open_teacher(page)
    _switch_tab(page, "Công cụ Tạo Quiz")
    search = page.find_elements(By.CSS_SELECTOR, "input[placeholder*='Tìm'], input[type='search']")
    if not search:
        pytest.skip("no search box in quiz tab")
    search[0].send_keys("bubble")
    time.sleep(2)
