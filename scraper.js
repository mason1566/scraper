import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { Pool } from 'pg';
import fs from 'fs';


/* POSTGRESQL */
// Database Connection Configuration
const pool = new Pool({
  user: 'soccer',
  host: 'localhost',
  database: 'soccer',
  password: 'soccer',
  port: 5432,
});

// insertWhoscoredData(data) Implementation
async function insertWhoscoredData(id, data, client) {
    try {
        let name = `${data.matchheader.input[2]} vs ${data.matchheader.input[3]} ${data.matchheader.input[4]}`;
        let hasEventData = (data.args.matchCentreData?.events != null);

        console.log(name, id, hasEventData);

        const res = await client.query(
            `INSERT INTO whoscored VALUES ($1, $2, $3, $4)`,
            [id, name, hasEventData, data]
        );

    } catch (err) {
        console.error('Error in insertWhoscoredData:', err);
    }
} 


/* WEB SCRAPING */
// Web Scraper Configuration
puppeteer.use(StealthPlugin());
const UA = new UserAgent();


// scrapeWhoscoredMatchPage(URL) Implementation
async function scrapeWhoscoredMatchPage(URL, page) {
    try {
        await page.goto(URL, { waitUntil: 'domcontentloaded' });

        const html = await page.content();

        const data = await page.evaluate(() => window.require.config.params);
        console.log("Successful query of page: ", URL);

        return data;
    } catch (err) {
        throw new Error('Error in scrapeWhoscoredMatchPage:', err);
    }
}


/* FILESYSTEM */
// writeNextScrapeId(id) Implementation
function writeNextScrapeId(id) {
    try {
        if (id < MIN_ID) {
            throw new Error('Error: match id is smaller than minimum.');
        }

        let idData = { nextScrapeId: id };

        fs.writeFileSync('/Users/masonjohnson/Projects/web/scraping/env.json',
            JSON.stringify(idData),
        );
    } catch (err) {
        console.error('Error in writeNextScrapeId:', err);
    }
}

// readNextScrapeId() Implementation
function readNextScrapeId() {
    try {
        let idData = undefined;

        const data = fs.readFileSync('/Users/masonjohnson/Projects/web/scraping/env.json',
            'utf8',
        );
        return JSON.parse(data)?.nextScrapeId || START_ID;
    } catch (err) {
        console.error('Error in readNextScrapeId:', err);
    }
}


/* UTIL HELPERS */
const BASE_URL_START = "https://www.whoscored.com/matches/";
const BASE_URL_END = "/live/";
const START_ID = 1;
const MIN_ID = 1;

const MIN_DELAY_MS = 500;
const MAX_DELAY_MS = 1500;

function randDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

try {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.createBrowserContext()
    const page = await context.newPage();

    await page.emulate({
        userAgent: UA.toString(),
        viewport: { width: 1280, height: 720 }
    });

    const dbClient = await pool.connect();

    let idCounter = readNextScrapeId();

    /* MAIN SCRAPE LOOP */
    while (true) {
        try {
            let data = await scrapeWhoscoredMatchPage(`${BASE_URL_START}${idCounter}${BASE_URL_END}`, page);

            await insertWhoscoredData(idCounter, data, dbClient);

            // wait between 30-45 seconds to confuse bot-detectors
            await new Promise(r => setTimeout(r, randDelay()));

            idCounter++;
            writeNextScrapeId(idCounter); // Keep track of which match to scrape next
        } catch (err) {
            console.error('Error while scraping:', err);
            console.log(`Failed on id ${idCounter}`);

            dbClient.release();
            await page.close();
            await browser.close();

            throw new Error('Error in main loop:', err)
        }
    }
} catch (err) {
    console.error('Error in main loop:', err);
}