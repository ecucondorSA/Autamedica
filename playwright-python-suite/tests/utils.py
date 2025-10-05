import json
import time
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops
import imagehash


def screenshot_and_save(page, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), full_page=True)


def visual_diff(
    expected_path: Path,
    actual_path: Path,
    diff_path: Path,
    threshold_hash_diff: int = 5,
) -> int:
    expected = Image.open(expected_path).convert("RGB")
    actual = Image.open(actual_path).convert("RGB")

    if expected.size != actual.size:
        actual = actual.resize(expected.size)

    hash_expected = imagehash.phash(expected)
    hash_actual = imagehash.phash(actual)
    diff_value = hash_expected - hash_actual

    if diff_value > threshold_hash_diff:
        diff_image = ImageChops.difference(expected, actual)
        diff_path.parent.mkdir(parents=True, exist_ok=True)
        diff_image.save(diff_path)

    return diff_value


def wait_for_network_idle(page, timeout: int = 5000, idle_time: int = 500) -> None:
    last_activity = time.time()
    requests_in_flight = set()

    def on_request(_request):
        nonlocal last_activity
        requests_in_flight.add(_request)
        last_activity = time.time()

    def on_request_finished(_request):
        nonlocal last_activity
        requests_in_flight.discard(_request)
        last_activity = time.time()

    page.on("request", on_request)
    page.on("requestfinished", on_request_finished)
    page.on("requestfailed", on_request_finished)

    end = time.time() + timeout / 1000
    while time.time() < end:
        if (time.time() - last_activity) * 1000 >= idle_time:
            break
        time.sleep(0.05)

    page.off("request", on_request)
    page.off("requestfinished", on_request_finished)
    page.off("requestfailed", on_request_finished)
