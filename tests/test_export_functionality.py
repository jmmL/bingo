from playwright.sync_api import sync_playwright
import threading
import http.server
import socketserver
import time
import sys
import os

PORT = 3001

def start_server():
    # Serve from root directory
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()

def run(playwright):
    # Start server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: console_errors.append(str(exc)))

    try:
        page.goto(f"http://localhost:{PORT}")
        print("Page loaded.")

        # Check if html2canvas is available
        # It's loaded with defer, so it should be available after DOMContentLoaded which Playwright waits for

        is_loaded = page.evaluate("typeof html2canvas !== 'undefined'")
        if is_loaded:
             print("html2canvas loaded successfully.")
        else:
             print("html2canvas NOT loaded.")
             return False

        # Click download button
        print("Clicking download button...")

        # We can intercept the download event to verify it actually tries to download
        with page.expect_download(timeout=5000) as download_info:
             page.click("#download-btn")

        download = download_info.value
        print(f"Download started: {download.suggested_filename}")

        if console_errors:
            print("Errors detected:", console_errors)
            # If there are errors (e.g. 404 for something else), we should know
            # But if download started, the main functionality works.
            # However, clean console is better.

            # Filter out expected or irrelevant errors if any (none expected now)
            if any("html2canvas" in err for err in console_errors):
                print("FAILURE: html2canvas error detected.")
                return False

        print("SUCCESS: Download triggered and library loaded.")
        return True

    except Exception as e:
        print(f"Exception during test: {e}")
        # If expect_download times out, it means download didn't happen
        return False
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        success = run(playwright)
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
