import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const readme = fs.readFileSync("README.md", "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readConstant(name) {
  const match = app.match(new RegExp(`const ${name} = "([^"]+)"`));
  assert(match, `Missing ${name}`);
  return match[1];
}

function readNumberConstant(name) {
  const match = app.match(new RegExp(`const ${name} = ([0-9_]+);`));
  assert(match, `Missing ${name}`);
  return Number(match[1].replaceAll("_", ""));
}

const version = readConstant("APP_VERSION");
const build = readConstant("APP_BUILD");
const spotifySearchLimit = readNumberConstant("SPOTIFY_SEARCH_LIMIT");

assert(
  html.includes(`v${version} · ${build}`),
  "Visible app version does not match app.js constants",
);
assert(
  html.includes(`./app.js?v=${build}`),
  "Script cache-busting query does not match APP_BUILD",
);
assert(readme.includes(`v${version} · ${build}`), "README version does not match app.js constants");
assert(spotifySearchLimit >= 1 && spotifySearchLimit <= 10, "Spotify search limit must be 1-10");
assert(
  !app.includes("https://api.spotify.com/v1/artists?"),
  "Removed Spotify Get Several Artists endpoint must not be used",
);

[
  "spotify-client-id",
  "save-spotify-client",
  "connect-spotify",
  "retry-spotify-player",
  "diagnose-spotify",
  "disconnect-spotify",
  "source-status",
  "toggle-answer",
  "toggle-playback",
  "next-song",
  "quiz-results",
  "quiz-results-count",
  "quiz-result-list",
  "run-category-qa",
  "harness-log",
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `Missing #${id}`);
});

["korea", "japan", "western", "global", "korea-top100", "shorts-challenge", "dance"].forEach((value) => {
  assert(html.includes(`value="${value}"`), `Missing category value ${value}`);
  assert(app.includes(`${value}:`) || app.includes(`"${value}":`), `Missing category label ${value}`);
});

assert(!html.includes('value="challenge"'), "Challenge should not appear as a music style");

assert(!html.includes("데모"), "Demo text should not appear in the production UI");
assert(
  styles.includes(".player-actions button:disabled"),
  "Disabled player action buttons need visible styling",
);
assert(
  styles.includes(".result-track-button"),
  "Quiz result track buttons need visible styling",
);
assert(app.includes("playFullResultTrack"), "Finished quiz must support full-track replay");

console.log(`QA smoke passed: v${version} · ${build}`);
