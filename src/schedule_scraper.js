import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'node:fs';
import {testHTMLData} from './schedule_test_data.js';

const URL = "https://sessions.minnestar.org";

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
  timeslots.push({"time": timeslotTime, "title": timeslotTitle, "sessions": []});
}
console.log(timeslots);