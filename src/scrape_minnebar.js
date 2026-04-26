import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';

// Constants
const allSessions = "https://sessions.minnestar.org/events/46/sessions";
const baseURL = "https://sessions.minnestar.org";
const dataFile = "./src/_data/sessions.json";
const requestDelayTime = 3000;  // Delay between http requests, in ms

let update;
if (process.argv[2] === "update") {
  console.log("Running full update");
  update = true;
} else {
  console.log("Only scraping newest sessions");
  update = false;
}

// Handles fetching all sessions page
const allSessionReq = await axios.get(allSessions);
const $allSession = cheerio.load(allSessionReq.data);

// Reads all data already scraped in the past
const readFile = fs.readFileSync(dataFile);
let sessionDetails = JSON.parse(readFile);


//
// Controls which URLS are scraped
//
const sessionAElements = $allSession("a[href^='/sessions/']:not([class])").toArray();
const sessionUrls = [];
for (const sessionA of sessionAElements.reverse()) {
  const sessionUrl = `${baseURL}${sessionA.attribs['href']}`;
  // If page is already scraped, skip it
  if (!update && sessionDetails.some(session => session.url === sessionUrl)) {
    console.log(`Skipping ${sessionUrl}: already fetched`);
    continue;
  }
  sessionUrls.push(sessionUrl);
}


//
// Scrapes the URLS
//
for (const sessionUrl of sessionUrls) {
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

  const participantElements = $sessionPage("#participants > li").toArray();
  const participants = [];
  for (const participantElement of participantElements) {
    const participantName = $sessionPage(participantElement).text().trim();
    const participantA = $sessionPage(participantElement).find("a")[0];
    const participantUrl = participantA.attribs['href'];
    participants.push({"name": participantName, "url": participantUrl});
  }

  const speakers = [];
  for (const element of $sessionPage(".session_presenters > *")) {
    const elementText = $sessionPage(element).text();
    if (element.name === "h4") {
      speakers.push({"speakerName": elementText.trim(), "speakerBio": ""});
      continue;
    }
    speakers[speakers.length - 1]["speakerBio"] += elementText + "\n";
  }

  const session = {"url": sessionUrl, title, description, tags, categories, participants, speakers};

  const duplicateIndex = sessionDetails.findIndex(session => session["url"] === sessionUrl);
  if (duplicateIndex === -1)
    sessionDetails.push(session);
  else
    Object.assign(sessionDetails[duplicateIndex], session);
}

//
// Removes sessions that no longer exist
//
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
