// ==UserScript==
// @name           Whatsapp Web Privacy
// @author         Fynks
// @version        1.0.0
// @description    Add button and hotkey to hide contact names and avatars on web.whatsapp.com
// @icon           https://i.imgur.com/LeZuNg7.png
// @downloadURL    https://raw.githubusercontent.com/fynks/userscripts/main/whatsapp/whatsapp_privacy.user.js
// @updateURL      https://raw.githubusercontent.com/fynks/userscripts/main/whatsapp/whatsapp_privacy.user.js
// @namespace      https://github.com/fynks/userscripts/
// @match          https://web.whatsapp.com/
// @grant          none
// ==/UserScript==

(function() {
    'use strict';

    // switch button background color
    var defaultbkg = 'lightgrey';

    waitForId('side').then(el => {
      //console.log(el);
    });

    function waitForId(id, nodeToObserve = document) {
      const el = document.getElementById(id);
      return el ?
        Promise.resolve(el) :
        new Promise(resolve => {
          new MutationObserver((mutations, observer) => {
            const el = document.getElementById(id);
            if (el) {
              // add F7 shortcut
              document.addEventListener("keydown", function(e) {
                  var keyCode = e.keyCode;
                  if(keyCode==118) {
                      toggleShowHide();
                  }
              }, false);
              // add Button
              addButton('Hide / F7', toggleShowHide);
              //console.log("WA Privacy: Button added.");
              observer.disconnect();
              resolve(el);
            }
          }).observe(nodeToObserve, {childList: true, subtree: true});
        });
    }

    function addButton(text, onclick, cssObj) {
        cssObj = cssObj || {position: 'absolute', top: '15px', left:'70px', 'z-index': 5000, 'font-weight':'bold', border:'black solid', 'border-radius':'10px',
                            padding:'4px', 'background-color': defaultbkg, 'min-width': '75px', 'box-shadow':'grey 3px 3px 0px 0px'};
        let button = document.createElement('button'), btnStyle = button.style;
      try{
        document.getElementById('side').appendChild(button);
      }
      catch(err){
        console.log("addButton: " + err);
      }
        button.innerHTML = text;
        button.onclick = onclick;
        button.classList = ['show-hide-btn unpressed'];

        button.onmouseover = function() {
            button.style["background-color"] = 'salmon';
        };
        button.onmouseout = function() {
            button.style["background-color"] = defaultbkg;
        };
        Object.keys(cssObj).forEach(key => btnStyle[key] = cssObj[key]);
        return button;
    }

    function toggleShowHide() {
        var btn = document.getElementsByClassName('show-hide-btn')[0];
        var panel = document.getElementById('pane-side');

        if (panel.style.display === 'none') {
            // show
            panel.style.display = 'block';
            defaultbkg = 'lightgrey';
            btn.innerHTML = 'Hide / F7';
            btn.style.left = '70px';
            btn.style.top = '15px';
            btn.style["box-shadow"] = 'grey 3px 3px 0px 0px';
        } else {
            // hide
            panel.style.display = 'none';
            defaultbkg = 'grey';
            btn.innerHTML = 'Show / F7';
            btn.style.left = '73px';
            btn.style.top = '18px';
            btn.style["box-shadow"] = '';
        }
        btn.style["background-color"] = defaultbkg;
    }

})();
