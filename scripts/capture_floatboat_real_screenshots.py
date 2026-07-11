from __future__ import annotations

import re
from pathlib import Path

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:3007"
OUT_DIR = ROOT / "tmp" / "pdfs" / "floatboat-real-brochure" / "screenshots"


def safe_name(value: str) -> str:
    return re.sub(r"[^a-z0-9_-]+", "-", value.lower()).strip("-")


def wait_ready(page: Page) -> None:
    page.wait_for_load_state("domcontentloaded", timeout=60000)
    try:
        page.wait_for_load_state("networkidle", timeout=12000)
    except PlaywrightTimeoutError:
        pass
    page.wait_for_timeout(900)


def stabilize(page: Page) -> None:
    page.add_style_tag(
        content="""
        *, *::before, *::after {
          scroll-behavior: auto !important;
          animation-duration: 0.001s !important;
          animation-delay: 0s !important;
          transition-duration: 0.001s !important;
          transition-delay: 0s !important;
        }
        """
    )


def capture_section(page: Page, selector: str, name: str) -> Path:
    loc = page.locator(selector).first
    try:
        loc.wait_for(state="attached", timeout=15000)
        if not loc.is_visible(timeout=5000):
            print(f"skip hidden: {selector}")
            return OUT_DIR / f"{safe_name(name)}.png"
    except PlaywrightTimeoutError:
        print(f"skip missing: {selector}")
        return OUT_DIR / f"{safe_name(name)}.png"
    loc.scroll_into_view_if_needed(timeout=60000)
    page.wait_for_timeout(900)
    out = OUT_DIR / f"{safe_name(name)}.png"
    loc.screenshot(path=str(out), timeout=60000)
    print(out.relative_to(ROOT))
    return out


def capture_viewport(page: Page, name: str, full_page: bool = False) -> Path:
    page.wait_for_timeout(900)
    out = OUT_DIR / f"{safe_name(name)}.png"
    page.screenshot(path=str(out), full_page=full_page, timeout=60000)
    print(out.relative_to(ROOT))
    return out


def capture_public(base_page: Page) -> None:
    page = base_page
    page.goto(BASE_URL, wait_until="domcontentloaded", timeout=60000)
    wait_ready(page)
    stabilize(page)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(1200)
    capture_viewport(page, "public-hero")

    public_sections = [
        ("#about", "public-about"),
        ("#cabins", "public-cabins"),
        ("#availability", "public-availability"),
        ("#itinerary", "public-itinerary"),
        ("#food-menu", "public-food-menu"),
        ("#destinations", "public-destinations"),
        ("#facilities", "public-facilities"),
        ("#gallery", "public-gallery"),
        ("#videos", "public-videos"),
        ("#reviews", "public-reviews"),
        ("#faq", "public-faq"),
        ("#guest-guidelines", "public-guest-guidelines"),
        ("#contact", "public-contact"),
    ]
    for selector, name in public_sections:
        capture_section(page, selector, name)

    page.locator("#cabins").scroll_into_view_if_needed(timeout=60000)
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Book This Cabin").first.click(timeout=20000)
    page.locator("text=Booking Request").first.wait_for(state="visible", timeout=20000)
    page.wait_for_timeout(900)
    out = OUT_DIR / "public-booking-modal.png"
    page.screenshot(path=str(out), full_page=False, timeout=60000)
    print(out.relative_to(ROOT))


def login_admin(page: Page) -> None:
    page.goto(f"{BASE_URL}/admin/login", wait_until="domcontentloaded", timeout=60000)
    wait_ready(page)
    stabilize(page)
    page.fill("#email", "demo@floatboat.local")
    page.fill("#password", "demo-password")
    page.get_by_role("button", name=re.compile("Login", re.I)).click()
    page.wait_for_url(re.compile(r"/admin/dashboard"), timeout=30000)
    wait_ready(page)


def capture_admin(page: Page) -> None:
    login_admin(page)
    admin_pages = [
        ("/admin/dashboard", "admin-dashboard"),
        ("/admin/bookings", "admin-bookings"),
        ("/admin/availability", "admin-availability"),
        ("/admin/trips", "admin-trips"),
        ("/admin/rooms", "admin-rooms"),
        ("/admin/padma-trip", "admin-padma-trip"),
        ("/admin/discount", "admin-discount"),
        ("/admin/customers", "admin-customers"),
        ("/admin/income", "admin-income"),
        ("/admin/expenses", "admin-expenses"),
        ("/admin/reports", "admin-reports"),
        ("/admin/gallery", "admin-gallery"),
        ("/admin/reviews", "admin-reviews"),
        ("/admin/season-settings", "admin-season-settings"),
        ("/admin/settings", "admin-settings"),
    ]
    for path, name in admin_pages:
        page.goto(f"{BASE_URL}{path}", wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        stabilize(page)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(1000)
        capture_viewport(page, name)


def capture_mobile(browser) -> None:
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        is_mobile=True,
        locale="bn-BD",
    )
    page = context.new_page()
    page.goto(BASE_URL, wait_until="domcontentloaded", timeout=60000)
    wait_ready(page)
    stabilize(page)
    page.evaluate("window.scrollTo(0, 0)")
    out = OUT_DIR / "public-mobile-home.png"
    page.screenshot(path=str(out), full_page=False, timeout=60000)
    print(out.relative_to(ROOT))
    context.close()


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.png"):
        old.unlink()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 980},
            device_scale_factor=1,
            locale="bn-BD",
        )
        page = context.new_page()
        capture_public(page)
        capture_admin(page)
        capture_mobile(browser)
        browser.close()


if __name__ == "__main__":
    main()
