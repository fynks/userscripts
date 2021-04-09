// ==UserScript==
// @name                Boxy-SVG.com Bypass
// @description         Bypass subscription block and enable file exporting
// @author              ScamCast
// @version             1.0
// @grant               none
// @match               https://boxy-svg.com/app*
// @icon                https://boxy-svg.com/images/app/16.png
// @namespace https://greasyfork.org/users/718362
// ==/UserScript==

(function() {
    'use strict';
    document.getElementById('app').checkDiskWriteAccess = function() {return ["granted", null]};
})();
