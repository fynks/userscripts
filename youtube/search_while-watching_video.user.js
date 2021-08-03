// ==UserScript==
// @name         Youtube - Search While Watching Video
// @version      2.3.2
// @description  Search YouTube without interrupting the video, by loading the search results in the related video bar
// @author       Cpt_mathix
// @match        https://www.youtube.com/*
// @license      GPL-2.0-or-later
// @require      https://cdnjs.cloudflare.com/ajax/libs/JavaScript-autoComplete/1.0.4/auto-complete.min.js
// @namespace    https://greasyfork.org/users/16080
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/* jshint esversion: 6 */

(function() {
    'use strict';

    function youtube_search_while_watching_video() {
        var script = {
            initialized: false,

            ytplayer: null,

            search_bar: null,
            search_timeout: null,
            search_suggestions: [],
            searched: false,

            debug: false
        };

        document.addEventListener("DOMContentLoaded", initScript);

        // reload script on page change using youtube polymer fire events
        window.addEventListener("yt-page-data-updated", function(event) {
            if (script.debug) { console.log("# page updated #"); }
            startScript(2);
        });

        function initScript() {
            if (script.debug) { console.log("### Youtube Search While Watching Video Initializing ###"); }

            initSearch();
            injectCSS();

            if (script.debug) { console.log("### Youtube Search While Watching Video Initialized ###"); }
            script.initialized = true;

            startScript(5);
        }

        function startScript(retry) {
            if (script.initialized && isPlayerAvailable()) {
                if (script.debug) { console.log("videoplayer is available"); }
                if (script.debug) { console.log("ytplayer: ", script.ytplayer); }

                if (script.ytplayer) {
                    try {
                        if (script.debug) { console.log("initializing search"); }
                        loadSearch();
                    } catch (error) {
                        console.log("Failed to initialize search: ", (script.debug) ? error : error.message);
                    }
                }
            } else if (retry > 0) { // fix conflict with Youtube+ script
                setTimeout( function() {
                    startScript(--retry);
                }, 1000);
            } else {
                if (script.debug) { console.log("videoplayer is unavailable"); }
            }
        }

        // *** VIDEOPLAYER *** //

        function getVideoPlayer() {
            return document.getElementById('movie_player');
        }

        function isPlayerAvailable() {
            script.ytplayer = getVideoPlayer();
            return script.ytplayer !== null && script.ytplayer.getVideoData().video_id;
        }

        function isPlaylist() {
            return script.ytplayer.getVideoStats().list;
        }

        function isLivePlayer() {
            return script.ytplayer.getVideoData().isLive;
        }

        // *** SEARCH *** //

        function initSearch() {
            // callback function for search suggestion results
            window.suggestions_callback = suggestionsCallback;
        }

        function loadSearch() {
            // prevent double searchbar
            var playlistOrLiveSearchBar = document.querySelector('#suggestions-search.playlist-or-live');
            if (playlistOrLiveSearchBar) { playlistOrLiveSearchBar.remove(); }

            var searchbar = document.getElementById('suggestions-search');
            if (!searchbar) {
                createSearchBar();
            } else {
                searchbar.value = "";
            }

            script.searched = false;
            cleanupSuggestionRequests();
        }

        function createSearchBar() {
            var anchor, html;

            anchor = document.querySelector('ytd-compact-autoplay-renderer > #contents');
            if (anchor) {
                html = "<input id=\"suggestions-search\" type=\"search\" placeholder=\"Search\">";
                anchor.insertAdjacentHTML("afterend", html);
            } else { // playlist, live video or experimental youtube layout (where autoplay is not a separate renderer anymore)
                anchor = document.querySelector('#related > ytd-watch-next-secondary-results-renderer');
                if (anchor) {
                    html = "<input id=\"suggestions-search\" class=\"playlist-or-live\" type=\"search\" placeholder=\"Search\">";
                    anchor.insertAdjacentHTML("beforebegin", html);
                }
            }

            var searchBar = document.getElementById('suggestions-search');
            if (searchBar) {
                script.search_bar = searchBar;

                new window.autoComplete({
                    selector: '#suggestions-search',
                    minChars: 1,
                    delay: 250,
                    source: function(term, suggest) {
                        suggest(script.search_suggestions);
                    },
                    onSelect: function(event, term, item) {
                        prepareNewSearchRequest(term);
                    }
                });

                script.search_bar.addEventListener("keyup", function(event) {
                    if (this.value === "") {
                        resetSuggestions();
                    } else {
                        searchSuggestions(this.value);
                    }
                });

                // seperate keydown listener because the search listener blocks keyup..?
                script.search_bar.addEventListener("keydown", function(event) {
                    const ENTER = 13;
                    if (this.value.trim() !== "" && (event.key == "Enter" || event.keyCode === ENTER)) {
                        prepareNewSearchRequest(this.value.trim());
                    }
                });

                script.search_bar.addEventListener("search", function(event) {
                    if(this.value === "") {
                        script.search_bar.blur(); // close search suggestions dropdown
                        script.search_suggestions = []; // clearing the search suggestions

                        resetSuggestions();
                    }
                });

                script.search_bar.addEventListener("focus", function(event) {
                    this.select();
                });
            }
        }

        // callback from search suggestions attached to window
        function suggestionsCallback(data) {
            var raw = data[1]; // extract relevant data from json
            var suggestions = raw.map(function(array) {
                return array[0]; // change 2D array to 1D array with only suggestions
            });
            if (script.debug) { console.log(suggestions); }
            script.search_suggestions = suggestions;
        }

        function searchSuggestions(value) {
            if (script.search_timeout !== null) { clearTimeout(script.search_timeout); }

            // youtube search parameters
            const GeoLocation = window.yt.config_.INNERTUBE_CONTEXT_GL;
            const HostLanguage = window.yt.config_.INNERTUBE_CONTEXT_HL;

            // only allow 1 suggestion request every 100 milliseconds
            script.search_timeout = setTimeout(function() {
                if (script.debug) { console.log("suggestion request send", this.searchValue); }
                var scriptElement = document.createElement("script");
                scriptElement.type = "text/javascript";
                scriptElement.className = "suggestion-request";
                scriptElement.src = "https://clients1.google.com/complete/search?client=youtube&hl=" + HostLanguage + "&gl=" + GeoLocation + "&gs_ri=youtube&ds=yt&q=" + encodeURIComponent(this.searchValue) + "&callback=suggestions_callback";
                (document.body || document.head || document.documentElement).appendChild(scriptElement);
            }.bind({searchValue:value}), 100);
        }

        function cleanupSuggestionRequests() {
            var requests = document.getElementsByClassName('suggestion-request');
            forEachReverse(requests, function(request) {
                request.remove();
            });
        }

        // send new search request (with the search bar)
        function prepareNewSearchRequest(value) {
            if (script.debug) { console.log("searching for " + value); }

            script.search_bar.blur(); // close search suggestions dropdown
            script.search_suggestions = []; // clearing the search suggestions

            sendSearchRequest("https://www.youtube.com/results?pbj=1&search_query=" + encodeURIComponent(value));
        }

        // given the url, retrieve the search results
        function sendSearchRequest(url) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    processSearch(xmlHttp.responseText);
                }
            };

            xmlHttp.open("GET", url, true);
            xmlHttp.setRequestHeader("x-youtube-client-name", window.yt.config_.INNERTUBE_CONTEXT_CLIENT_NAME);
            xmlHttp.setRequestHeader("x-youtube-client-version", window.yt.config_.INNERTUBE_CONTEXT_CLIENT_VERSION);
            xmlHttp.setRequestHeader("x-youtube-client-utc-offset", new Date().getTimezoneOffset() * -1);

            if (window.yt.config_.ID_TOKEN) { // null if not logged in
                xmlHttp.setRequestHeader("x-youtube-identity-token", window.yt.config_.ID_TOKEN);
            }

            xmlHttp.send(null);
        }

        // process search request
        function processSearch(responseText) {
            try {
                var data = JSON.parse(responseText);

                var found = searchJson(data, (key, value) => {
                    if (key === "itemSectionRenderer") {
                        if (script.debug) { console.log(value.contents); }
                        var succeeded = createSuggestions(value.contents);
                        return succeeded;
                    }
                    return false;
                });

                if (!found) {
                    alert("The search request was succesful but the script was unable to parse the results");
                }
            } catch (error) {
                alert("Failed to retrieve search data, sorry!\nError message: " + error.message + "\nSearch response: " + responseText);
            }
        }

        function searchJson(json, func) {
            var found = false;

            for (var item in json) {
                found = func.apply(this, [item, json[item]]);
                if (found) { break; }

                if (json[item] !== null && typeof(json[item]) == "object") {
                    found = searchJson(json[item], func);
                    if (found) { break; }
                }
            }

            return found;
        }

        // *** HTML & CSS *** //

        function createSuggestions(data) {
            // filter out promotional stuff
            if (data.length < 10) {
                return false;
            }

            // remove current suggestions
            var watchRelated = document.querySelector('#related ytd-watch-next-secondary-results-renderer #items ytd-item-section-renderer #contents') || document.querySelector('#related ytd-watch-next-secondary-results-renderer #items');
            forEachReverse(watchRelated.children, function(item) {
                if (item.tagName === "YTD-CONTINUATION-ITEM-RENDERER") {
                    item.style.display = "none";
                    item.id = "hidden-continuation-item-renderer";
                } else if (item.tagName !== "YTD-COMPACT-AUTOPLAY-RENDERER") {
                    item.remove();
                }
            });

            // create suggestions
            forEach(data, function(videoData) {
                if (videoData.videoRenderer || videoData.compactVideoRenderer) {
                    window.Polymer.dom(watchRelated).appendChild(videoQueuePolymer(videoData.videoRenderer || videoData.compactVideoRenderer, "ytd-compact-video-renderer"));
                } else if (videoData.radioRenderer || videoData.compactRadioRenderer) {
                    window.Polymer.dom(watchRelated).appendChild(videoQueuePolymer(videoData.radioRenderer || videoData.compactRadioRenderer, "ytd-compact-radio-renderer"));
                } else if (videoData.playlistRenderer || videoData.compactPlaylistRenderer) {
                    window.Polymer.dom(watchRelated).appendChild(videoQueuePolymer(videoData.playlistRenderer || videoData.compactPlaylistRenderer, "ytd-compact-playlist-renderer"));
                }
            });

            script.searched = true;

            return true;
        }

        function resetSuggestions() {
            if (script.searched) {
                var itemSectionRenderer = document.querySelector('#related ytd-watch-next-secondary-results-renderer #items ytd-item-section-renderer') || document.querySelector("#related ytd-watch-next-secondary-results-renderer");
                var data = itemSectionRenderer.__data.data;
                createSuggestions(data.contents || data.results);

                // restore continuation renderer
                var continuation = document.getElementById('hidden-continuation-item-renderer')
                itemSectionRenderer.querySelector('#contents').insertBefore(continuation, null);
                continuation.style.display = "block";
            }

            script.searched = false;
        }

        function videoQueuePolymer(videoData, type) {
            let node = document.createElement(type);
            node.classList.add("style-scope", "ytd-watch-next-secondary-results-renderer", "yt-search-generated");
            node.data = videoData;
            return node;
        }

        function injectCSS() {
            var css = `
.autocomplete-suggestions {
text-align: left; cursor: default; border: 1px solid var(--ytd-searchbox-legacy-border-color); border-top: 0; background: var(--ytd-searchbox-background);
position: absolute; display: none; z-index: 9999; max-height: 254px; overflow: hidden; overflow-y: auto; box-sizing: border-box; box-shadow: -1px 1px 3px rgba(0,0,0,.1);
}
.autocomplete-suggestion { position: relative; padding: 0 .6em; line-height: 23px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.22em; color: var(--ytd-searchbox-text-color); }
.autocomplete-suggestion b { font-weight: normal; color: #b31217; }
.autocomplete-suggestion.selected { background: #ddd; }
[dark] .autocomplete-suggestion.selected { background: #333; }

ytd-compact-autoplay-renderer { padding-bottom: 0px; }

#suggestions-search {
outline: none; width: 100%; padding: 6px 5px; margin-bottom: 16px;
border: 1px solid var(--ytd-searchbox-legacy-border-color); border-radius: 2px 0 0 2px;
box-shadow: inset 0 1px 2px var(--ytd-searchbox-legacy-border-shadow-color);
color: var(--ytd-searchbox-text-color); background-color: var(--ytd-searchbox-background);
}
`;

            var style = document.createElement("style");
            style.type = "text/css";
            if (style.styleSheet){
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            (document.body || document.head || document.documentElement).appendChild(style);
        }

        // *** FUNCTIONALITY *** //

        function forEach(array, callback, scope) {
            for (var i = 0; i < array.length; i++) {
                callback.call(scope, array[i], i);
            }
        }

        // When you want to remove elements
        function forEachReverse(array, callback, scope) {
            for (var i = array.length - 1; i >= 0; i--) {
                callback.call(scope, array[i], i);
            }
        }
    }

    if (!document.getElementById("autocomplete_script")) {
        var autoCompleteScript = document.createElement('script');
        autoCompleteScript.id = "autocomplete_script";
        autoCompleteScript.appendChild(document.createTextNode('window.autoComplete = ' + autoComplete + ';'));
        (document.body || document.head || document.documentElement).appendChild(autoCompleteScript);
    }

    if (!document.getElementById("search_while_watching_video")) {
        var searchWhileWatchingVideoScript = document.createElement('script');
        searchWhileWatchingVideoScript.id = "search_while_watching_video";
        searchWhileWatchingVideoScript.appendChild(document.createTextNode('('+ youtube_search_while_watching_video +')();'));
        (document.body || document.head || document.documentElement).appendChild(searchWhileWatchingVideoScript);
    }
})();
