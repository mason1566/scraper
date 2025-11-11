const puppeteer = require('puppeteer');

async function getData() {
    try {
        const URL = "https://www.whoscored.com/matches/1903225/live/england-premier-league-2025-2026-tottenham-manchester-united"
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        // 1) Set a realistic UA
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // 2) Set viewport
        await page.setViewport({ width: 1366, height: 768 });

        // 3) Optional: extra headers (language, accept, etc.)
        await page.setExtraHTTPHeaders({
            "accept-language": "en-US,en;q=0.9",
        });

        await page.goto(URL);

        const html = await page.content();

        const data = await page.evaluate(() => window.require.config.params);
        // console.log(data);
        console.dir(data.args, { depth: null });

        await browser.close();
    } catch (error) {
        console.error(error);
    }
}

getData();