import fs from 'node:fs';

const dataFile = "./src/_data/sessions.json";
const categoriesFile = "./src/_data/categories.json";
const outFile = "./src/_data/stats.json";

const readFile = fs.readFileSync(dataFile);
const sessionDetails = JSON.parse(readFile);
const categoriesReadFile = fs.readFileSync(categoriesFile);
const categories = JSON.parse(categoriesReadFile);

const categoryCounter = {}
for (const category of categories) {
  const categoryId = category["id"];
  categoryCounter[categoryId] = {"aiSessions": 0, "nonAiSessions": 0, "aiVotes": 0, "nonAiVotes": 0};
}
const overallCounter = {"aiSessions": 0, "nonAiSessions": 0, "aiVotes": 0, "nonAiVotes": 0};

for (const session of sessionDetails) {
  if (!("list" in session)) {
    console.log(`${session['url']} is untagged, skipping it's count in stats update.`);
    continue;
  }
  if (session["list"] === "ai") {
    overallCounter["aiSessions"] += 1;
    overallCounter["aiVotes"] += session["participants"].length;
    for (const category of session["categories"]) {
      categoryCounter[category]["aiSessions"] += 1;
      categoryCounter[category]["aiVotes"] += session["participants"].length;
    }
  } else if (session["list"] === "none") {
    overallCounter["nonAiSessions"] += 1;
    overallCounter["nonAiVotes"] += session["participants"].length;
    for (const category of session["categories"]) {
      categoryCounter[category]["nonAiSessions"] += 1;
      categoryCounter[category]["nonAiVotes"] += session["participants"].length;
    }
  } else {
    throw new Error(`${session['url']} was not in a valid list`);
  }
}

overallCounter["avgAi"] = overallCounter["aiVotes"] / overallCounter["aiSessions"];
overallCounter["avgNonAi"] = overallCounter["nonAiVotes"] / overallCounter["nonAiSessions"];
overallCounter["ppVotesAi"] = overallCounter["aiVotes"] / (overallCounter["aiVotes"] + overallCounter["nonAiVotes"]) * 100;
overallCounter["ppAvgAi"] = overallCounter["avgAi"] / (overallCounter["avgAi"] + overallCounter["avgNonAi"]) * 100;
overallCounter["ppSessionsAi"] = overallCounter["aiSessions"] / (overallCounter["nonAiSessions"] + overallCounter["aiSessions"]) * 100;
for (const [id ,category] of Object.entries(categoryCounter)) {
  category["avgAi"] = category["aiVotes"] / category["aiSessions"];
  category["avgNonAi"] = category["nonAiVotes"] / category["nonAiSessions"];
  category["ppVotesAi"] = category["aiVotes"] / (category["aiVotes"] + category["nonAiVotes"]) * 100;
  category["ppAvgAi"] = category["avgAi"] / (category["avgAi"] + category["avgNonAi"]) * 100;
  category["ppSessionsAi"] = category["aiSessions"] / (category["nonAiSessions"] + category["aiSessions"]) * 100;
}

const outData = {"overall": overallCounter, "byCategory": categoryCounter};

fs.writeFileSync(outFile, JSON.stringify(outData, null, 4));