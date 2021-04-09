// ==UserScript==
// @name         GitHub theme switch
// @version      1.0.1
// @description  Add theme preferences switch to GitHub's profile dropdown.
// @license      MIT
// @author       kidonng
// @namespace    https://github.com/kidonng/cherry
// @match        https://github.com/*
// @icon         https://github.githubassets.com/favicons/favicon.svg
// ==/UserScript==
const e=e=>{if(null==e)return new DocumentFragment;const t=document.createElement("template");return t.innerHTML=e,t.content};e.one=t=>{var r;return null!==(r=e(t).firstElementChild)&&void 0!==r?r:void 0};const t=Symbol("null");let r=0;var s=class extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[e]=arguments;if(null!=e){if("function"!=typeof e[Symbol.iterator])throw new TypeError(typeof e+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[t,r]of e)this.set(t,r)}}_getPublicKeys(e,t=!1){if(!Array.isArray(e))throw new TypeError("The keys parameter must be an array");const r=this._getPrivateKey(e,t);let s;return r&&this._publicKeys.has(r)?s=this._publicKeys.get(r):t&&(s=[...e],this._publicKeys.set(r,s)),{privateKey:r,publicKey:s}}_getPrivateKey(e,s=!1){const o=[];for(let n of e){null===n&&(n=t);const e="object"==typeof n||"function"==typeof n?"_objectHashes":"symbol"==typeof n&&"_symbolHashes";if(e)if(this[e].has(n))o.push(this[e].get(n));else{if(!s)return!1;{const t=`@@mkm-ref-${r++}@@`;this[e].set(n,t),o.push(t)}}else o.push(n)}return JSON.stringify(o)}set(e,t){const{publicKey:r}=this._getPublicKeys(e,!0);return super.set(r,t)}get(e){const{publicKey:t}=this._getPublicKeys(e);return super.get(t)}has(e){const{publicKey:t}=this._getPublicKeys(e);return super.has(t)}delete(e){const{publicKey:t,privateKey:r}=this._getPublicKeys(e);return Boolean(t&&super.delete(t)&&this._publicKeys.delete(r))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}};var o=()=>{const e={};return e.promise=new Promise(((t,r)=>{e.resolve=t,e.reject=r})),e};const n=new s;var i=(e,{target:t=document,stopOnDomReady:r=!0,timeout:s=1/0}={})=>{const i=[t,e,r,s],c=n.get(i);if(c)return c;let l;const a=o(),{promise:u}=a;n.set(i,u);const m=()=>{cancelAnimationFrame(l),n.delete(i,u),a.resolve()};return s!==1/0&&setTimeout(m,s),function s(){const o=t.querySelector(e);o?(a.resolve(o),m()):!r||"interactive"!==document.readyState&&"complete"!==document.readyState?l=requestAnimationFrame(s):m()}(),Object.assign(u,{stop:m})};
// ==UserScript==
(async()=>{const t=document.createElement("style");t.innerHTML="\n  .github-theme-switch:hover {\n    color: var(--color-text-primary);\n    background-color: var(--color-bg-overlay);\n  }\n  ",document.head.appendChild(t);const r=document.createElement("span");r.setAttribute("role","menuitem"),r.classList.add("dropdown-item","github-theme-switch"),r.textContent="Theme preference";const s=await i('.dropdown-item[href="https://gist.github.com/mine"]',{stopOnDomReady:!1}),o=await(async()=>{const t=await fetch("https://github.com/settings/appearance"),r=await t.text(),s=e(r).querySelector(".js-color-mode-settings");s.classList.add("mt-1","ml-1"),s.querySelector(".flex-column").classList.remove("flex-lg-row");for(const e of s.querySelectorAll("img"))e.parentElement.style.border="none",e.parentElement.style.fontWeight="normal",e.remove();for(const e of s.querySelectorAll(".position-relative"))e.classList.remove("mb-4");return s})();s.after(r,o)})();
