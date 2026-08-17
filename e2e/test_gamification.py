"""Gamification — 12 TCs from plan/testing/manual/Gamification.md"""
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import wait_for
from helpers.ui import login, logout, goto, has_text, STUDENT_A, TEACHER


def _open_gamification(page):
    goto(page, "/gamification")
    wait_for(lambda: has_text(page, "Bảng", 15) or has_text(page, "XP", 15)
             or has_text(page, "Huy hiệu", 15), 20, message="gamification view")
    time.sleep(2)


@pytest.mark.p0
def test_gm003_badges_cabinet_renders(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_gamification(page)
    assert has_text(page, "Huy hiệu", timeout=10) or has_text(page, "badge", timeout=3)


@pytest.mark.p1
def test_gm005_leaderboard_real_data(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_gamification(page)
    body = page.find_element(By.TAG_NAME, "body").text
    assert "VisualizationDSA Student" not in body, "leaderboard must not show hardcoded mock rows"
    assert "NVA" in body or "Cấp" in body, "seeded users must appear in the weekly leaderboard"


@pytest.mark.p1
def test_gm007_demo_xp_button_roles(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    _open_gamification(page)
    # student must NOT see the demo +50 XP button (Teacher/Admin only)
    assert not page.find_elements(By.XPATH, "//button[contains(normalize-space(.), '+50 XP')]"), \
        "student must not see the demo XP button"


@pytest.mark.p2
def test_gm012_level_threshold_no_negative(page):
    login(page, STUDENT_A[0], STUDENT_A[1])
    goto(page, "/profile")
    WebDriverWait(page, 15).until(
        EC.visibility_of_element_located((By.ID, "profile-tab-progress")))
    page.find_element(By.ID, "profile-tab-progress").click()
    time.sleep(2)
    assert not has_text(page, "Cần thêm -", timeout=3), "negative XP-to-next must never render"
