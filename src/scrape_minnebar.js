import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';

// Constants
const allSessions = "https://sessions.minnestar.org/events/46/sessions";
const baseURL = "https://sessions.minnestar.org";
const dataFile = "./src/_data/sessions.json";
const requestDelayTime = 3000;  // Delay between http requests, in ms

// Handles fetching all sessions page
const allSessionReq = await axios.get(allSessions);
const $allSession = cheerio.load(allSessionReq.data);

// Reads all data already scraped in the past
const readFile = fs.readFileSync(dataFile);
let sessionDetails = JSON.parse(readFile);

// Scrapes pages detected as new
const sessionAElements = $allSession("a[href^='/sessions/']:not([class])").toArray();

for (const sessionA of sessionAElements.reverse()) {
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

  const categories = [];
  for (const categoryA of $sessionPage("ul.tags > li a.tag")) {
    const matchdata = categoryA.attribs['href'].match(/\/categories\/([0-9]+)/);
    if (matchdata) { categories.push(matchdata[1]) }
  }

  $sessionPage(".session_description .tags").remove();
  const description = $sessionPage(".session_description").text();

  sessionDetails.push({"url": sessionUrl, title, description, tags, categories});
}

sessionDetails = sessionDetails.filter(function (session) {
  const matchingATag = sessionAElements.find(function (aElement) {
    return baseURL + aElement.attribs['href'] === session['url'];
  });
  if (matchingATag !== undefined)
    return true;
  // Session exists in json file, but did not exist in most recent scrape.
  console.log(`Session "${session['title']}" was removed`);
  return false;
});

// Saves updated sessions list
fs.writeFileSync(dataFile, JSON.stringify(sessionDetails, null, 4));
