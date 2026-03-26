import * as readline from 'node:readline';
import fs from 'node:fs';

const dataFile = "./src/pages/sessions.json";
const lists = [
  {"key": "1", "list": "ai"},
  {"key": "2", "list": "criticism"},
  {"key": "3", "list": "discussion"},
  {"key": "4", "list": "none"}
];

const readFile = fs.readFileSync(dataFile);
const sessionDetails = JSON.parse(readFile).sessions;

const rl = readline.createInterface({input: process.stdin, output: process.stdout});

// https://stackoverflow.com/a/51506718/5813879
const wrap = (string, wrap) => string.replace(
    new RegExp(`(?![^\\n]{1,${wrap}}$)(([^\n]{1,${wrap}})((?:\\s)|-))`, 'g'), '$1\n'
);

function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

for (const sessionDetail of sessionDetails) {
  if ("list" in sessionDetail)
    continue;

  console.log("\n\n\n\n\n\n");
  console.log("\x1b[34m", sessionDetail["title"]);
  console.log(sessionDetail["url"]);
  console.log("\x1b[31m", `Tags: ${sessionDetail["tags"].join(", ")}`);
  console.log("\x1b[0m", wrap(sessionDetail["description"], 120).trim().replace(/\n\n/g, "\n"));
  for (const list of lists) {
    console.log("\x1b[1m", "\x1b[31m", `${list['key']}: `, "\x1b[0m", list["list"]);
  }

  while (true) {
    const response = await askQuestion("Choose a list from above> ");
    const list = lists.find(element => element["key"] === response);
    if (list === undefined) {
      console.log("invalid input");
      continue;
    }
    sessionDetail["list"] = list['list'];
    break;
  }
  fs.writeFileSync(dataFile, JSON.stringify({ sessions: sessionDetails }, null, 4));
}

rl.close();