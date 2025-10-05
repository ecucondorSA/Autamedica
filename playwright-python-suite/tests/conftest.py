import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="session")
def playwright_instance():
    with sync_playwright() as playwright:
        yield playwright


@pytest.fixture(scope="session")
def browser(playwright_instance):
    browser = playwright_instance.chromium.launch(
        headless=True,
        args=[
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    )
    yield browser
    browser.close()


@pytest.fixture(scope="function")
def context(browser, tmp_path_factory):
    user_data_dir = tmp_path_factory.mktemp("pwprofile")
    context = browser.new_context(
        viewport={"width": 1280, "height": 800},
        record_video_dir=str(user_data_dir / "videos"),
        bypass_csp=True,
    )
    yield context
    try:
        context.close()
    except Exception:
        pass


@pytest.fixture(scope="function")
def page(context):
    page = context.new_page()
    yield page
    try:
        page.close()
    except Exception:
        pass
