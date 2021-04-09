// ==UserScript==
// @name           XDA Cleaner
// @author         Fynks
// @version        1.1
// @description    Cleans and enhances the XDA-Forum
// @icon           https://icons.duckduckgo.com/ip2/xda-developers.com.ico
// @downloadURL    https://raw.githubusercontent.com/fynks/userscripts/main/xda-cleaner.user.js
// @updateURL      https://raw.githubusercontent.com/fynks/userscripts/main/xda-cleaner.user.js
// @namespace      https://github.com/fynks/userscripts/
// @match          https://forum.xda-developers.com/*
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    document.querySelectorAll(`.notice-content,.p-sectionLinks,
    #spot_thread_above_messages,#spot_container_content_above,.p-body-sidebar,.uix_sidebarNav,.p-nav-scroller,.hScroller,
    .p-navgroup-link--whatsnew,.p-breadcrumb--bottom,#footer`).forEach(el => el.remove());
})();