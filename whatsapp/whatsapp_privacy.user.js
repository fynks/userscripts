// ==UserScript==
// @name           Whatsapp Web Privacy
// @author         Fynks
// @version        1.0.1
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
  const defaultBackgroundColor = 'lightgrey';

  // Add custom class names to blur or show
  const blurClassNames = ["._23P3O", "._3IzYj"];

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
              const keyCode = e.keyCode;
              if (keyCode === 118) {
                toggleShowBlur();
              }
            }, false);
            console.log(`WhatsApp Privacy: Button added to ${el.id}`);
            observer.disconnect();
            resolve(el);
          }
        }).observe(nodeToObserve, {childList: true, subtree: true});
      });
  }

  function toggleShowBlur() {
    const panel = document.getElementById('pane-side');
    const images = document.querySelectorAll("img");

    if (panel.style.filter === 'blur(5px)') {
      // show
      panel.style.filter = '';
      defaultBackgroundColor = 'lightgrey';
      updateBlurClassNames(false);
      images.forEach(img => img.style.display = '');
    } else {
      // hide
      panel.style.filter = 'blur(5px)';
      defaultBackgroundColor = 'grey';
      updateBlurClassNames(true);
      images.forEach(img => img.style.display = 'none');
    }
  }

  function updateBlurClassNames(blur) {
    blurClassNames.forEach(className => {
      document.querySelectorAll(className).forEach(el => {
        el.style.filter = blur ? 'blur(5px)' : '';
      });
    });
  }
})();
