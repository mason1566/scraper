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
async function insertWhoscoredData(data, client) {
    return;
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
        
        console.log("Successful query of page: ", URL);
    } catch (err) {
        console.error(err);
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
const BASE_URL = "https://www.whoscored.com/matches/";
const START_ID = 1;
const MIN_ID = 1;

const MIN_DELAY_MS = 3000;
const MAX_DELAY_MS = 45000;

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
            scrapeWhoscoredMatchPage(`${BASE_URL}${idCounter}`, page);

            // wait between 30-45 seconds to confuse bot-detectors
            await new Promise(r => setTimeout(r, randDelay()));

            idCounter++;
        } catch (err) {
            writeNextScrapeId(idCounter);
            console.error('Error while scraping:', err);
            console.log(`Failed on id ${idCounter}`);
            break;
        }
    }
} catch (err) {
    console.error('Error in main loop:', err);
} finally {
    dbClient.release();
    await page.close();
    await browser.close();
}