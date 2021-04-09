// ==UserScript==
// @name Youtube Cleaner
// @author Fynks
// @version 1.2
// @description Cleans youtube from extra distractions
// @icon https://www.google.com/s2/favicons?domain=www.youtube.com
// @downloadURL https://raw.githubusercontent.com/fynks/userscripts/main/youtube-cleaner.user.js
// @updateURL https://raw.githubusercontent.com/fynks/userscripts/main/youtube-cleaner.user.js
// @namespace https://github.com/fynks/userscripts/
// @match https://*.youtube.com/*
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // removing the tight side buttons
    var rButtons = document.getElementById('buttons');
    if (rButtons) {
        rButtons.parentNode.removeChild(rButtons);
    }

    //removing chat,comments and voice search button
    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
    addGlobalStyle('#buttons,#watch-discussion, #comments,ytd-live-chat-frame,#voice-search-button,#search-icon-legacy.ytd-searchbox{display: none !important;}\
#container.ytd-searchbox,#container.ytd-searchbox:focus {text-align:center;border:0;background: transparent !important;}\
');

})();
