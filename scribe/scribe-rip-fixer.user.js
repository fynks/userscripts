// ==UserScript==
// @name           scribe.rip Fixer
// @author         Fynks
// @version        1.1
// @description    Cleans and enhances scribe.rip
// @icon           https://icons.duckduckgo.com/ip2/scribe.rip.ico
// @downloadURL    https://raw.githubusercontent.com/fynks/userscripts/main/scribe/scribe-rip-fixer.user.js
// @updateURL      https://raw.githubusercontent.com/fynks/userscripts/main/scribe/scribe-rip-fixer.user.js
// @namespace      https://github.com/fynks/userscripts/
// @match          https://scribe.rip/*
// @grant          none
// ==/UserScript==

(function() {
    'use strict';

    var style = document.createElement('style');
    style.innerHTML = `
    *,*::before,*::after{font-family:sans-serif;color:#eeeeee}
    html,body{background-color:#1c1b22;}
    p{font-size:1.4rem;}p a{text-decoration:underline;color:#45a1ff !important;background-color:inherit;text-shadow:none !important}
    h1{font-size:1.8rem !important;font-weight:600;}h1::before{content :"‟ ";}h1::after{content :" ”";}
    h2,h3{font-style:normal !important;font-weight:700;color:lightgreen;}
    article{margin:-5rem auto !important}`;
    document.head.appendChild(style);

})();