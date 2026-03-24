import * as cheerio from 'cheerio';
import axios from 'axios';
import {scrape_result} from './test_data.js';

const allSessions = "https://sessions.minnestar.org/events/46/sessions";
const outFile = "./raw_sessions.json";

// const allSessionReq = await axios.get(allSessions);
// const allSessionCheerio = cheerio.load(allSessionReq.data);
const allSessionCheerio = cheerio.load(scrape_result);

const sessionAElements = allSessionCheerio("a[href^='/sessions/']:not([class])");
const sessionDetails = []
for (const sessionA of sessionAElements) {
  sessionDetails.push({"rel_link": sessionA.attribs['href']});
}
console.log(sessionDetails);