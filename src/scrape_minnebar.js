import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';

// Constants
const allSessions = "https://sessions.minnestar.org/events/46/sessions";
const baseURL = "https://sessions.minnestar.org";
const dataFile = "./src/pages/sessions.json";
const requestDelayTime = 3000;  // Delay between http requests, in ms

// Handles fetching all sessions page
const allSessionReq = await axios.get(allSessions);
const $allSession = cheerio.load(allSessionReq.data);

// Reads all data already scraped in the past
const readFile = fs.readFileSync(dataFile);
const sessionDetails = JSON.parse(readFile).sessions;

// Scrapes pages detected as new
const sessionAElements = $allSession("a[href^='/sessions/']:not([class])");

for (const sessionA of sessionAElements) {
  const sessionUrl = `${baseURL}${sessionA.attribs['href']}`;

  // If page is already scraped, skip it
  if (sessionDetails.some(session => session.url === sessionUrl)) {
    console.log(`Skipping ${sessionUrl}: already fetched`);
    continue;
  }

  await new Promise(resolve => setTimeout(resolve, requestDelayTime));
  console.log(`Fetching ${sessionUrl}...`);
  const sessionPageReq = await axios.get(sessionUrl);
  const $sessionPage = cheerio.load(sessionPageReq.data);

  const title = $sessionPage("h1.page-title").text();

  const tags = [];
  for (const tagElement of $sessionPage("ul.tags > li")) {
    tags.push($sessionPage(tagElement).text());
  }

  $sessionPage(".session_description .tags").remove();
  const description = $sessionPage(".session_description").text();

  sessionDetails.push({"url": sessionUrl, title, description, tags});
}

// Saves updated sessions list
fs.writeFileSync(dataFile, JSON.stringify({ sessions: sessionDetails }, null, 4));
