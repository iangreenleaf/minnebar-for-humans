import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';
import {testHTMLData} from './schedule_test_data.js';

const URL = "https://sessions.minnestar.org";
const sessionUrlBase = "https://sessions.minnestar.org/sessions/";

// Uncomment this when scraping the real live schedule
// const scheduleReq = await axios.get(URL);
// const $allSchedule = cheerio.load(scheduleReq.data);

// Comment this when scraping the real live schedule
const $ = cheerio.load(testHTMLData);

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
console.log(timeslots);