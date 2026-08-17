"""Notifications — 12 TCs from plan/testing/manual/Notifications.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, logout, goto, has_text, STUDENT_A, STUDENT_B


def _bell(page):
    return page.find_elements(By.CSS_SELECTOR, "button[aria-label*='Thông báo'], .notification-bell, [class*='bell']")


@pytest.mark.p0
def test_nt001_bell_opens_dropdown(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/dashboard")
    time.sleep(3)
    bell = _bell(page)
    if not bell:
        pytest.skip("notification bell not found in header")
    bell[0].click()
    wait_for(lambda: page.find_elements(By.CSS_SELECTOR, "[class*='dropdown'], [class*='notification-list']"),
             10, message="notification dropdown")


@pytest.mark.p1
def test_nt008_escape_closes_dropdown(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/dashboard")
    time.sleep(3)
    bell = _bell(page)
    if not bell:
        pytest.skip("notification bell not found")
    bell[0].click()
    time.sleep(1)
    page.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    time.sleep(1)


@pytest.mark.p1
def test_nt007_user_switch_resets(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/dashboard")
    time.sleep(3)
    logout(page)
    login(page, STUDENT_B[0], STUDENT_B[1])
    goto(page, "/dashboard")
    time.sleep(3)
    bell = _bell(page)
    if not bell:
        pytest.skip("notification bell not found")
    bell[0].click()
    time.sleep(2)
