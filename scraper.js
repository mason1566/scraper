import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { Pool } from 'pg';
import fs, { read, write } from 'fs';


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
async function insertWhoscoredData(data) {
    return;
} 


/* WEB SCRAPING */
// Web Scraper Configuration
puppeteer.use(StealthPlugin());

// scrapeWhoscoredMatchPage(URL) Implementation
async function scrapeWhoscoredMatchPage(URL) {
    return;
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
        return JSON.parse(data);
    } catch (err) {
        console.error('Error in readNextScrapeId:', err);
    }
}


/* UTIL HELPERS */
const BASE_URL = "https://www.whoscored.com/matches/";
const START_ID = 1;
const MIN_ID = 1;


/* MAIN SCRAPE LOOP */
