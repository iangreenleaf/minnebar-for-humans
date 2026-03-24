import * as cheerio from 'cheerio';
import axios from 'axios';
import {scrape_result} from './test_data.js';
import fs from 'node:fs';

// Constants
const allSessions = "https://sessions.minnestar.org/events/46/sessions";
const minnebarBase = "https://sessions.minnestar.org";
const dataFile = "./src/raw_sessions.json";

// Handles fetching all sessions page
// const allSessionReq = await axios.get(allSessions);
// const allSessionCheerio = cheerio.load(allSessionReq.data);
const $allSession = cheerio.load(scrape_result);

// Reads all data already scraped in the past
const readFile = fs.readFileSync(dataFile);
const sessionDetails = JSON.parse(readFile);

// Scrapes pages detected as new
const sessionAElements = $allSession("a[href^='/sessions/']:not([class])");
for (const sessionA of sessionAElements) {
  const sessionUrl = `${minnebarBase}${sessionA.attribs['href']}`;
  const sessionPageReq = await axios.get(sessionUrl);
  const $sessionPage = cheerio.load(sessionPageReq.data);

  const title = $sessionPage("h1.page-title").text();

  const tags = [];
  for (const tagElement of $sessionPage("ul.tags > li")) {
    tags.push($sessionPage(tagElement).text());
  }

  sessionDetails.push({"url": sessionUrl, "title": title, "tags": tags})

  break;
}

// Saves updated sessions list
fs.writeFileSync(dataFile, JSON.stringify(sessionDetails));
