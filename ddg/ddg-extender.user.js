// ==UserScript==
// @name            DDG Extendor
// @author          Fynks
// @version         1.3
// @description     Cleans and adds custom search to duckduckgo.com
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/DuckDuckGo_Extended/large.png
// @downloadURL     https://raw.githubusercontent.com/fynks/userscripts/main/ddg/ddg-extender.user.js
// @updateURL       https://raw.githubusercontent.com/fynks/userscripts/main/ddg/ddg-extender.user.js
// @namespace       https://github.com/fynks/userscripts/
// @match           https://duckduckgo.com/*
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// ==/UserScript==
// This script is based on https://github.com/tumpio/gmscripts/tree/master/DuckDuckGo_Extended
if (window.top !== window.self) // NOTE: Do not run on iframes
    return;

var ddg_e = {

    list: document.createElement("div"),
    engines: [],

    default: "|==#\
;;Google==https://www.google.com/search?q={searchTerms}\
;;Github==https://github.com/search?q={searchTerms}\
;;Youtube==https://www.youtube.com/results?search_query={searchTerms}&aq=f\
;;AUR==https://aur.archlinux.org/packages/?O=0&K={searchTerms}",

    style: "\
#duckbar_static{display:flex;flex-direction:row !important;}\
.js-header-aside,.feedback-prompt,.feedback-btn__send,.feedback-btn,.footer,.js-zci-link--news{display:none !important}\
",

    get: function () {
        for(var e=GM_getValue("engines",this.default).split(";;"),a=[],i=0;i<e.length;i++)a.push(e[i].split("=="));this.length=a.length;
        return a;
    },

        set: function () {
            for(var e="",i=0;i<this.engines.length;i++)e+=";;"+this.engines[i].textContent+"=="+this.engines[i].firstChild.getAttribute("data-engine");GM_setValue("engines",e.substr(2));
        },
            // Creating the elements
        newList: function () {
                for(var l="",e=this.get(),t=escape(document.getElementById("search_form_input").value),i=0;i<e.length;i++)l+='<li class="zcm__item"><a rel=noreferrer class="zcm__link  js-zci-link" data-engine="'+e[i][1]+'"href="'+e[i][1].replace("{searchTerms}",t)+'">'+e[i][0]+"</a></li>";this.list.innerHTML=l,this.engines=this.list.getElementsByTagName("li");
        },
                // apending all the data
        append: function () {
                    var e=document.getElementById("duckbar_static");GM_addStyle(this.style),e.appendChild(this.list),this.newList();
                    var z=document.getElementById("duckbar_static");z.lastChild.setAttribute("id", "custom_search");

        }
};

// FUNCTIONS
function onHashChange(){-1!==window.location.hash.indexOf("{searchTerms}")&&(window.location.hash=""),window.addEventListener("hashchange",function(){-1!==window.location.hash.indexOf("{searchTerms}")&&(window.location.href=window.location.hash.substr(1).replace("{searchTerms}",escape(document.getElementById("search_form_input").value)))},!1)}
ddg_e.append();
