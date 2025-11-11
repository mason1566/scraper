const puppeteer = require('puppeteer');
const { Pool } = require('pg');

async function getData(URL) {
    try {
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

// Setup PostgreSQL connection
const pool = new Pool({
  user: 'soccer',
  host: 'localhost',
  database: 'soccer',
  password: 'soccer',
  port: 5432,
});

async function queryDB() {
  const client = await pool.connect();

  try {
    const res = await client.query(
      'SELECT COUNT(*) FROM whoscored'
    );
    console.log(res);
  } 
  catch (err) {
    console.err(err);
  } 
  finally {
    client.release();
  }
}

const URL = "https://www.whoscored.com/matches/1903225/live/england-premier-league-2025-2026-tottenham-manchester-united";
// getData(URL);
queryDB();