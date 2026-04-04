import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';
import {testHTMLData} from './schedule_test_data.js';

const URL = "https://sessions.minnestar.org";
const sessionUrlBase = "https://sessions.minnestar.org/sessions/";

let $;
if (process.argv[2] === "test") {
  console.log("using test data");
  $ = cheerio.load(testHTMLData);
} else {
  console.log("using live data");
  const scheduleReq = await axios.get(URL);
  $ = cheerio.load(scheduleReq.data);
}

const timeslotElements = $("div.timeslot").toArray();
const timeslots = [];
for (const timeslotElement of timeslotElements) {
  const timeslotTime = $(timeslotElement).find("h2 > .time").text();
  const timeslotTitle = $(timeslotElement).find("h2 > .title").text();

  const sessionElements = $(timeslotElement).find(".session").toArray();
  const sessions = [];
  for (const sessionElement of sessionElements) {
    const dataElement = $(sessionElement).find("[data-session-id]")[0];
    const sessionID = dataElement.attribs['data-session-id'];
    const sessionURL = sessionUrlBase + sessionID;
    sessions.push(sessionURL);
  }

  timeslots.push({"time": timeslotTime, "title": timeslotTitle, "sessions": sessions});
}

fs.writeFileSync("./src/_data/schedule.json", JSON.stringify(timeslots, null, 4));