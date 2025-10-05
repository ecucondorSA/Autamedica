import json
import requests

from tests.utils import wait_for_network_idle

AXE_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.3/axe.min.js"
BASE_URL = "http://localhost:3000"


def inject_axe(page):
    response = requests.get(AXE_URL, timeout=10)
    response.raise_for_status()
    page.add_script_tag(content=response.text)


def test_accessibility_homepage(page):
    page.goto(BASE_URL)
    wait_for_network_idle(page)
    inject_axe(page)

    result = page.evaluate(
        """
        async () => {
          return await axe.run();
        }
        """
    )

    violations = result.get("violations", [])

    if violations:
        print(f"A11Y Violations: {len(violations)}")
        for violation in violations:
            print(violation["id"], violation.get("impact"), violation.get("nodes", [])[:1])

    critical = [v for v in violations if v.get("impact") in ("serious", "critical")]
    assert len(critical) == 0, f"Critical accessibility violations found: {len(critical)}"
