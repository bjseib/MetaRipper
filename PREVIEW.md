# Dashboard Preview

Use the Playwright helper below to capture a fresh screenshot of the current dashboard for reviews and demos.

## Steps
1. Serve the static files locally:
   ```bash
   python -m http.server 8000
   ```
2. From another terminal, run a Playwright script similar to:
   ```python
   import asyncio
   from pathlib import Path
   from playwright.async_api import async_playwright

   async def main():
       out_dir = Path("previews")
       out_dir.mkdir(exist_ok=True)
       async with async_playwright() as p:
           browser = await p.chromium.launch()
           page = await browser.new_page(viewport={"width": 1400, "height": 900})
           await page.goto("http://127.0.0.1:8000/index.html", wait_until="networkidle")
           await asyncio.sleep(1)
           await page.screenshot(path=str(out_dir / "dashboard-preview.png"), full_page=True)
           await browser.close()

   asyncio.run(main())
   ```
3. The screenshot saves to `previews/dashboard-preview.png`.

> Note: The repository does not track generated previews. Attach the latest image to your PR or share directly when requested.
