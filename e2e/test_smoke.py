"""Smoke: verify the Selenium infra reaches both servers and login works."""
import pytest

from helpers.ui import login, logout, TEACHER, has_text


@pytest.mark.p0
def test_frontend_serves_landing(page):
    assert has_text(page, "Chào mừng", timeout=15) or "Visualization" in page.title


@pytest.mark.p0
def test_teacher_login_ok(page):
    login(page, TEACHER[0], TEACHER[1])
    assert has_text(page, "Cấp", timeout=10)  # user-badge meta visible
    logout(page)
    assert has_text(page, "Đăng nhập", timeout=10)
