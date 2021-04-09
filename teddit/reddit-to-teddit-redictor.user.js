// ==UserScript==
// @name         Reddit to Teddit redirector
// @author       Fynks
// @version      1.3
// @description  Redirect reddit to teddit
// @icon         https://teddit.net/favicon.png
// @downloadURL  https://raw.githubusercontent.com/fynks/userscripts/main/reddit-to-teddit-redictor.user.js
// @updateURL    https://raw.githubusercontent.com/fynks/userscripts/main/reddit-to-teddit-redictor.user.js
// @namespace    https://github.com/fynks/userscripts/
// @match        https://www.reddit.com/*
// @match        https://reddit.com/*
// @match        https://old.reddit.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';
	top.location.hostname = "teddit.net";
})();

