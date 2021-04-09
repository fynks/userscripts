// ==UserScript==
// @name           Teddit Cleaner
// @author         Fynks
// @version        1.5
// @description    Cleans and enhances teddit
// @icon           https://teddit.net/favicon.png
// @downloadURL    https://raw.githubusercontent.com/fynks/userscripts/main/teddit-cleaner.user.js
// @updateURL      https://raw.githubusercontent.com/fynks/userscripts/main/teddit-cleaner.user.js
// @namespace      https://github.com/fynks/userscripts/
// @match          https://teddit.net/*
// @grant none
// ==/UserScript==
(function() {
    'use strict';

    // adding the id to tab menu
    var elements = document.querySelectorAll('.top-links');
    if (elements.length) {
        elements[0].id = 'menu';
    }

    // adding a link element for prefrences with id 'pref'
    var link = document.createElement('a');
    link.id = 'pref';
    link.setAttribute('href', 'https://teddit.net/preferences');
    link.textContent = 'Preferences';
    document.getElementById('menu').append(link);

    var style = document.createElement('style');
    style.innerHTML = `
    body{overflow-x: hidden;}
    header,#intro,#sr-more-link,nav{display:none !important}
    .top-links{padding:1.5rem;background: #1f1f1f;margin-bottom:1rem}
    .top-links a{color:#0ff !important;border:1px solid #0ff;margin:2px 4px !important;font-size:0.70rem;padding:0.5rem;border-radius:0.25rem}
    input{width:100%  !important;padding:0.5rem !important;margin-top:0.25rem !important;border-radius:0.25rem  !important}
    #pref{z-index: 10;position: absolute;right: 4%;}`;
    document.head.appendChild(style);


})();
