from pathlib import Path

import pytest

from tests.utils import screenshot_and_save, visual_diff

BASE_URL = "http://localhost:3000"
BASELINE_DIR = Path("tests/__baseline__")


def test_home_visual_regression(page, tmp_path):
    page.goto(BASE_URL)
    page.wait_for_selector("header", timeout=5000)

    actual = tmp_path / "home_actual.png"
    expected = BASELINE_DIR / "home.png"
    diff = tmp_path / "home_diff.png"

    screenshot_and_save(page, actual)

    if not expected.exists():
        BASELINE_DIR.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline created; rerun the test to compare visuals.")

    diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=6)
    assert diff_score <= 6, f"Visual diff too high. Hash diff: {diff_score}"
