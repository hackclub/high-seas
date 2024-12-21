import puppeteer from 'puppeteer'

const html = () => `
<!DOCTYPE html>
<html>
<head>
  <style>
    html, body { margin: 0 }
    h1 { font-family: sans-serif; text-align: center; }
  </style>
</head>
<body>
  <h1>hello, world!</h1>
</body>
</html>`

export async function GET() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Set viewport size to match canvas size
    await page.setViewport({
      width: 1024,
      height: 1024 * (9 / 16),
      deviceScaleFactor: 3,
    })

    // Load the HTML content
    await page.setContent(html())

    // Wait for the shader to render a few frames
    // await page.goto(url, { waitUntil: 'networkidle0' });
    // await page.waitForFunction("window.renderedComplete === true", { timeout: 5_000 });

    // Take a screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1024,
        height: 1024 * (9 / 16),
      },
    })

    await browser.close()

    // Return the screenshot as a PNG
    return new Response(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        // "Cache-Control": "public, max-age=3600"
      },
    })
  } catch (error) {
    await browser.close()
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
