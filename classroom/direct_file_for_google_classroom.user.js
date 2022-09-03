// ==UserScript==
    // @name         Direct File for Google Classroom
    // @namespace    http://tampermonkey.net/
    // @version      0.3.1
    // @description  Directly Download the Files in Google Classroom using Ctrl Click
    // @author       You
    // @match        https://classroom.google.com/*
    // @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
    // @grant        none
    // @license MIT
    // ==/UserScript==

    (function() {
        'use strict';

        // Your code here...

        const M_HREF="https://drive.google.com/file/d/"

        const chkEvtKey=(evt)=>evt.ctrlKey || evt.metaKey;
        const chkEvtKey2=(evt)=>evt.key=='Control' || evt.key=='Meta';

        document.addEventListener('mouseenter',function(evt){
            const linkElm = evt.target.closest(`[data-ozhref*="${M_HREF}"]`) ;
            if(!linkElm)return;
            const orhref= linkElm.dataset.ozhref;
            const mres=orhref.match(/\https\:\/\/drive\.google\.com\/file\/d\/([0-9a-zA-Z\-\_\+]+)\/\w+/);
            if(!mres)return;
            let newHref=chkEvtKey(evt)?`https://drive.google.com/u/1/uc?id=${mres[1]}&export=download`:orhref
            if(linkElm.href===newHref) return;
            linkElm.href=newHref;
        },true);

        document.addEventListener('keydown',function(evt){
            if(!chkEvtKey2(evt)) return;
            const links = document.querySelectorAll(`[href*="${M_HREF}"]`)
            if(links.length>0){
                for(const linkElm of links) linkElm.dataset.ozhref=linkElm.href;
                evt.preventDefault();
            }
        },true);




    })();

