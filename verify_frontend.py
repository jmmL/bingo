from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Verify Title Case
    header = page.locator("header h1")
    expect(header).to_have_text("2026 Bingo")

    # Check if CSS property text-transform is none or default (not uppercase)
    # Computed style check
    transform = header.evaluate("element => getComputedStyle(element).textTransform")
    if transform != "none":
        print(f"Warning: text-transform is {transform}")
    else:
        print("Title case verification passed: text-transform is none")

    # Verify Grid Layout
    cells = page.locator(".bingo-cell")
    expect(cells).to_have_count(25)

    # Check aspect ratio (width ~= height)
    first_cell = cells.first
    box = first_cell.bounding_box()
    width = box["width"]
    height = box["height"]

    print(f"Cell dimensions: {width}x{height}")
    if abs(width - height) < 1:
        print("Square verification passed: Width equals Height")
    else:
        print(f"Square verification FAILED: {width} != {height}")

    # Screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/bingo_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
