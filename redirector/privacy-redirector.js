// ==UserScript==
// @name Privacy Redirector
// @description	Redirect social media platforms to their privacy respecting frontends
// @namespace https://github.com/fynks/fynks
// @author Fynks
// @version 1.0.0
// @downloadURL https://raw.githubusercontent.com/fynks/userscripts/main/redirector/privacy-redirector.js
// @updateURL https://raw.githubusercontent.com/fynks/userscripts/main/redirector/privacy-redirector.js
// @run-at document-start
// @match *://*.imdb.com/*
// @match *://*.imgur.com/*
// @match *://*.medium.com/*
// @match *://*.quora.com/*
// @match *://*.reddit.com/*
// @match *://*.twitter.com/*
// @match *://*.wikipedia.org/*
// @match *://imgur.com/*
// @match *://medium.com/*
// @match *://news.ycombinator.com/*
// @match *://reddit.com/*
// @match *://twitter.com/*
// ==/UserScript==

//based on https://raw.githubusercontent.com/dybdeskarphet/privacy-redirector/main/privacy-redirector.js

/*
  ___  _   _        ___  _____ _____
 / _ \| \ | |      / _ \|  ___|  ___|
| | | |  \| |_____| | | | |_  | |_
| |_| | |\  |_____| |_| |  _| |  _|
 \___/|_| \_|      \___/|_|   |_|

CHANGE THE RELEVANT VALUE TO "false" TO
DISABLE THE REDIRECTION/FARSIDE FOR THAT
PARTICULAR PLATFORM */

//           REDIRECTON / FARSIDE
let hackernews = [true, true];
let imdb = [true, true];
let imgur = [true, true];
let medium = [true, true];
let quora = [true, false];
let reddit = [true, true];
let twitter = [true, true];
let wikipedia = [true, true];

// PREFERRED FRONTEND
let redditFrontend = "libreddit"; 

// LIST OF INSTANCES TO USE IF FARSIDE IS NOT ENABLED

let libredditInstances = [
  "libreddit.spike.codes",
  "libreddit.org",
  "libreddit.kavin.rocks",
  "reddit.invak.id",
];

let libremdbInstances = [
  "libremdb.iket.me",
  "libremdb.pussthecat.org",
  "lmdb.tokhmi.xyz",
];

let nitterInstances = [
  "nitter.net",
  "nitter.pussthecat.org",
  "nitter.fdn.fr",
  "nitter.1d4.us",
];

let quetreInstances = [
  "quetre.iket.me",
  "quora.vern.cc",
  "quetre.pussthecat.org",
  "quetre.tokhmi.xyz",
];

let rimgoInstances = [
  "i.bcow.xyz",
  "rimgo.pussthecat.org",
  "rimgo.totaldarkness.net",
  "rimgo.bus-hit.me",
];

let scribeInstances = [
  "scribe.rip",
  "scribe.nixnet.services",
  "scribe.citizen4.eu",
  "scribe.bus-hit.me",
];

let wikilessInstances = [
  "wikiless.org",
  "wikiless.sethforprivacy.com",
  "wiki.604kph.xyz",
  "wikiless.lunar.icu",
];

let farsideInstance = "farside.link";

// // // // // // // // // // // // //

let debug_mode = false;

if (debug_mode == true) {
  alert(
    "Hostname: " +
      window.location.hostname +
      "\nPath: " +
      window.location.pathname +
      "\nQuery: " +
      window.location.search +
      "\nHash: " +
      window.location.hash
  );
}

function redirectTwitter() {
  if (twitter[0] == false) {
    return;
  }

  window.stop();

  var selectedInstance = "";

  if (twitter[1] == false) {
    selectedInstance =
      nitterInstances[Math.floor(Math.random() * nitterInstances.length)];
  } else {
    selectedInstance = `${farsideInstance}/nitter`;
  }

  let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(newURL);
}

function redirectReddit() {
  if (reddit[0] == false) {
    return;
  }

  window.stop();

  var selectedTeddit = "";
  var selectedLibreddit = "";

  if (reddit[1] == false) {
    selectedInstance = eval(redditFrontend + "Instances")[
      Math.floor(Math.random() * eval(redditFrontend + "Instances.length"))
    ];
  } else {
    selectedInstance = `${farsideInstance}/${redditFrontend}`;
  }

  let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(newURL);
}

function redirectImgur() {
  if (imgur[0] == false) {
    return;
  }

  window.stop();

  var selectedInstance = "";

  if (imgur[1] == false) {
    selectedInstance =
      rimgoInstances[Math.floor(Math.random() * rimgoInstances.length)];
  } else {
    selectedInstance = `${farsideInstance}/rimgo`;
  }

  let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(newURL);
}

function redirectMedium() {
  if (medium[0] == false || window.location.pathname == "/") {
    return;
  }

  window.stop();

  var selectedInstance = "";

  if (medium[1] == false) {
    selectedInstance =
      scribeInstances[Math.floor(Math.random() * scribeInstances.length)];
  } else {
    selectedInstance = `${farsideInstance}/scribe`;
  }

  let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(newURL);
}

function redirectHackerNews() {
  if (hackernews[0] == false) {
    return;
  }

  window.stop();
  let newURL = `${window.location.protocol}//hn.algolia.com`;
  window.location.replace(newURL);
}

function redirectWikipedia() {
  if (wikipedia[0] == false) {
    return;
  }

  window.stop();

  let langCodeIndex = window.location.hostname.search(/^[a-z][a-z]\./);
  var selectedInstance = "";

  if (wikipedia[1] == false) {
    selectedInstance =
      wikilessInstances[Math.floor(Math.random() * wikilessInstances.length)];
  } else {
    selectedInstance = `${farsideInstance}/wikiless`;
  }

  if (langCodeIndex != -1) {
    let newURL =
      window.location.protocol +
      "//" +
      selectedInstance +
      window.location.pathname +
      "?lang=" +
      window.location.hostname[langCodeIndex] +
      window.location.hostname[langCodeIndex + 1] +
      window.location.hash;
    window.location.replace(newURL);
  } else {
    let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}?lang=en${window.location.hash}`;
    window.location.replace(newURL);
  }
}

function redirectImdb() {
  if (imdb[0] == false) {
    return;
  }

  if (window.location.pathname.startsWith("/title/")) {
    window.stop();

    var selectedInstance = "";

    if (imdb[1] == false) {
      selectedInstance =
        libremdbInstances[Math.floor(Math.random() * libremdbInstances.length)];
    } else {
      selectedInstance = `${farsideInstance}/libremdb`;
    }

    let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

    window.location.replace(newURL);
  }
}

function redirectQuora() {
  if (quora[0] == false) {
    return;
  }

  window.stop();

  var selectedInstance = "";

  if (quora[1] == false) {
    selectedInstance =
      quetreInstances[Math.floor(Math.random() * quetreInstances.length)];
  } else {
    selectedInstance = `${farsideInstance}/quetre`;
  }

  let newURL = `${window.location.protocol}//${selectedInstance}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(newURL);
}

let urlHostname = window.location.hostname;

switch (urlHostname) {
  case "twitter.com":
  case "mobile.twitter.com":
    redirectTwitter();
    break;

  case "www.reddit.com":
  case "old.reddit.com":
    redirectReddit();
    break;

  case "news.ycombinator.com":
    redirectHackerNews();
    break;
    
  case "www.imdb.com":
    redirectImdb();
    break;

  case "www.quora.com":
    redirectQuora();
    break;

  default:
    if (urlHostname.includes("medium.com")) {
      redirectMedium();
    } else if (urlHostname.includes("imgur.com")) {
      redirectImgur();
    } else if (urlHostname.includes("wikipedia.org")) {
      redirectWikipedia();
    } else if (urlHostname.includes("fandom.com")) {
      redirectFandom();
    }
    break;
}