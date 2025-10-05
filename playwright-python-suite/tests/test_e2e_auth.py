from pathlib import Path

from tests.utils import screenshot_and_save, wait_for_network_idle

BASE_URL = "http://localhost:3000"


def test_login_and_navigate(page, tmp_path):
    def handle(route, request):
        if request.url.endswith("/api/auth/login"):
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body='{"ok": true, "token": "fake-token-123", "user": {"id": "u1", "name": "Dr Test"}}',
            )
        else:
            route.continue_()

    page.route("**/api/**", handle)

    page.goto(f"{BASE_URL}/login")
    page.wait_for_selector("form#login-form", timeout=5000)

    page.fill("input[name='email']", "doctor@test.com")
    page.fill("input[name='password']", "password123")
    page.click("button[type='submit']")

    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=8000)
    wait_for_network_idle(page)

    assert page.query_selector("text=Bienvenido") is not None

    screenshot_path = tmp_path / "login_dashboard.png"
    screenshot_and_save(page, screenshot_path)


def test_make_video_call_flow(page, tmp_path):
    page.goto(f"{BASE_URL}/dashboard")
    page.wait_for_selector("button[data-testid='new-call']", timeout=5000)
    page.click("button[data-testid='new-call']")

    page.fill("input[name='patientName']", "Paciente Demo")
    page.click("button[data-testid='start-call']")

    page.wait_for_selector("text=En llamada", timeout=8000)

    screenshot_path = tmp_path / "call_started.png"
    screenshot_and_save(page, screenshot_path)

    assert page.is_visible("text=En llamada")
