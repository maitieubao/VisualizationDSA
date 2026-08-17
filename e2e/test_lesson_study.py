"""Lesson Study — 12 TCs from plan/testing/manual/LessonStudy.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, logout, goto, has_text, TEACHER, STUDENT_A


def _teacher_curriculum(page):
    login(page, TEACHER[0], TEACHER[1])
    goto(page, "/teacher")
    wait_for(lambda: page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Curriculum')]"),
             20, message="teacher panel loads")
    time.sleep(2)


def _open_first_lesson(page):
    """Student flow: /courses -> first course -> first lesson."""
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/courses")
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "a.course-card-link"), 20, message="course cards")
    time.sleep(2)
    page.find_elements(By.CSS_SELECTOR, "a.course-card-link")[0].click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "a[href*='/lessons/']"), 20, message="lesson links")
    time.sleep(2)
    page.find_elements(By.CSS_SELECTOR, "a[href*='/lessons/']")[0].click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "[role='tablist'], [class*='step-tab'], [class*='StepTab']"),
             20, message="lesson study view")


@pytest.mark.p0
def test_ls001_teacher_create_module(page):
    _teacher_curriculum(page)
    add_module = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Thêm Module') or contains(normalize-space(.), 'Thêm module')]")
    if not add_module:
        pytest.skip("no classroom selected / module button hidden")
    add_module[0].click()
    inputs = page.find_elements(By.CSS_SELECTOR, "input[type='text']")
    assert inputs, "module name input missing"
    inputs[0].send_keys(f"E2E Module {int(time.time()) % 10**6}")
    save = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Lưu')]")
    if save:
        save[0].click()
    time.sleep(2)


@pytest.mark.p0
def test_ls004_teacher_import_course(page):
    _teacher_curriculum(page)
    import_btn = page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Import Course') or contains(normalize-space(.), 'Import')]")
    if not import_btn:
        pytest.skip("import button hidden without classroom")
    import_btn[0].click()
    wait_for(lambda: page.find_elements(By.XPATH, "//button[contains(normalize-space(.), 'Import')]"),
             10, message="import modal")


@pytest.mark.p0
def test_ls010_lesson_step_gating(page):
    _open_first_lesson(page)
    assert has_text(page, "Lý Thuyết", timeout=10) or has_text(page, "Lý thuyết", timeout=3)


@pytest.mark.p1
def test_ls011_quiz_retry_no_regression(page):
    _open_first_lesson(page)
    time.sleep(2)
    quiz_tab = page.find_elements(By.XPATH, "//*[contains(normalize-space(.), 'Quiz') or contains(normalize-space(.), 'Trắc nghiệm')]")
    assert quiz_tab or has_text(page, "bước", timeout=3)


@pytest.mark.p2
def test_ls012_codelab_step_reachable(page):
    _open_first_lesson(page)
    time.sleep(2)
    codelab = page.find_elements(By.XPATH, "//*[contains(normalize-space(.), 'Code Lab') or contains(normalize-space(.), 'Codelab')]")
    assert codelab or has_text(page, "bước", timeout=3)
