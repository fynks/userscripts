// ==UserScript==
// @name           Github Menu
// @author         Fynks
// @version        1.2
// @description    Adds custom menu to github
// @downloadURL    https://raw.githubusercontent.com/fynks/userscripts/main/github-menu.user.js
// @updateURL      https://raw.githubusercontent.com/fynks/userscripts/main/github-menu.user.js
// @namespace      https://github.com/fynks/userscripts/
// @icon           https://github.githubassets.com/favicons/favicon.svg
// @match          https://github.com/*
// @run-at         document-end
// @grant          none
// ==/UserScript==
//script is based on https://github.com/HaleShaw/TM-GitHubMenu
(function () {
  'use strict';

  const urlSeparator = "/";
  const defaultAccountName = "fynks";
  const defaultAClassName = "HeaderMenu-link no-underline py-3 d-block d-lg-inline-block";
  const defaultLiClassName = "border-bottom border-lg-bottom-0 mr-0 mr-lg-3";
  const menuArr = ["Stars", "Profile", "Repositories", "Configs", "Settings"];
  let hasLogin = false;

  main();

  function main() {
    logInfo(GM_info.script.name,GM_info.script.version);let accountName=getAccountName();null==accountName?(console.warn("Failed to get account name, default account name ["+defaultAccountName+"] will be used"),accountName=defaultAccountName):hasLogin=!0;const menu=getMenu(hasLogin);null!=menu&&addMenuItem(menu,accountName,hasLogin);
  }

  /**
   * Log the title and version at the front of the console.
   * @param {String} title title.
   * @param {String} version script version.
   */
  function logInfo(title, version) {
    const titleStyle = "color:white;background-color:#606060";
    const versionStyle = "color:white;background-color:#1475b2";
    const logTitle = " " + title + " ";
    const logVersion = " " + version + " ";
    console.log("%c" + logTitle + "%c" + logVersion, titleStyle, versionStyle);
  }

  /**
   * Add menu item.
   */
  function addMenuItem(menu, accountName, hasLogin) {
    const aClassName = getAClassName(menu, hasLogin);
    if (hasLogin) {
      for (let i = 0; i < menuArr.length; i++) {
        let menuItem = createMenuA(menuArr[i], aClassName, accountName);
        menu.appendChild(menuItem);
      }
    } else if ("github.com" == document.domain) {
      // If it is not logged in, and only the domain is 'github.com', then add the menu.
      const liClassName = getLiClassName(menu);
      for (let i = 0; i < menuArr.length - 2; i++) {
        let menuItem = createMenuLi(menuArr[i], liClassName, aClassName, accountName);
        menu.appendChild(menuItem);
      }
    }
  }

  /**
   * Create the menu item A.
   * @param {String} buttonName button name.
   * @param {String} aClassname className of A.
   * @param {String} accountName account name.
   */
  function createMenuA(buttonName, aClassname, accountName) {
    const menuItem = document.createElement("a");
    menuItem.text = buttonName;
    menuItem.className = aClassname;
    menuItem.href = getURL(buttonName, accountName);
    return menuItem;
  }

  /**
   * Create the menu item LI.
   * @param {String} buttonName button name.
   * @param {String} liClassName className of LI.
   * @param {String} aClassName className of A.
   * @param {String} accountName account name.
   */
  function createMenuLi(buttonName, liClassName, aClassName, accountName) {
    const menuItem = document.createElement("li");
    menuItem.className = liClassName;
    const menuA = createMenuA(buttonName, aClassName, accountName);
    menuItem.appendChild(menuA);
    return menuItem;
  }

  /**
   * Get the URL of the button by the button name and account name.
   * @param {String} buttonName button name.
   * @param {String} accountName account name.
   */
  function getURL(buttonName, accountName) {
    let url;
    switch (buttonName) {
      case "Configs":
        url = location.origin + urlSeparator + accountName + urlSeparator + "configs";
        break;
      case "Settings":
        url = location.origin + urlSeparator + "settings/profile";
        break;
      case "Stars":
        url = location.origin + urlSeparator + accountName + "?tab=stars";
        break;
      case "Profile":
        url = location.origin + urlSeparator + accountName;
        break;
      case "Repositories":
        url = location.origin + urlSeparator + accountName + "?tab=repositories";
        break;
      default:
        break;
    }
    return url;
  }

  /**
   * Get account name.
   */
  function getAccountName() {
    let accountName = getAccountNameWay1();
    if (accountName == undefined) {
      accountName = getAccountNameWay2();
    }
    return accountName;
  }

  /**
   * The first way to get account name.
   */
  function getAccountNameWay1() {
    let accountName;const detailsEle=document.getElementsByClassName("details-overlay details-reset js-feature-preview-indicator-container");if(detailsEle&&null!=detailsEle&&null!=detailsEle[0]){const e=detailsEle[0].getAttribute("data-feature-preview-indicator-src");if(null!=e){accountName=e.split("/")[2]}}
    return accountName;
  }

  /**
   * The second way to get account name.
   */
  function getAccountNameWay2() {
    let accountName;const dropdownItems=document.querySelectorAll("a[class=dropdown-item]"),itemLength=dropdownItems.length;if(0!=itemLength){let e;for(let t=0;t<itemLength;t++){if("Header, go to profile, text:your profile"==dropdownItems[t].getAttribute("data-ga-click")){e=dropdownItems[t].href;break}}if(null!=e){const t=e.split("/");accountName=t[t.length-1]}}
    return accountName;
  }

  /**
   * Get the menu object.
   * @param {Boolean} hasLogin Whether it is logged in.
   */
  function getMenu(hasLogin) {
    const navs = document.getElementsByTagName("nav");
    if (navs && navs != undefined && navs[0] != undefined && "Global" == navs[0].getAttribute("aria-label")) {
      return hasLogin ? navs[0] : navs[0].children[0];
    }
  }

  /**
   * Get the className of menu item A.
   * @param {Object} menu menu.
   * @param {Boolean} hasLogin hasLogin.
   */
  function getAClassName(menu, hasLogin) {
    let className;const items=menu.children;if(hasLogin){for(let e=0;e<items.length;e++)if("A"==items[e].tagName&&"Explore"==items[e].innerText){className=items[e].className;break}}else for(let e=0;e<items.length;e++)if("LI"==items[e].tagName&&"A"==items[e].children[0].tagName){className=items[e].children[0].className;break}
    return className ? className : defaultAClassName;
  }

  /**
   * Get the className of the menu item LI.
   * @param {Object} menu menu.
   */
  function getLiClassName(menu) {
let className;const items=menu.children;for(let e=0;e<items.length;e++)if("LI"==items[e].tagName&&"A"==items[e].children[0].tagName){className=items[e].className;break}
    return className ? className : defaultLiClassName;
  }
})();
