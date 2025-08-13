// ==UserScript==
// @name        IMDb: Link 'em all!
// @description Adds all kinds of links to IMDb, customizable!
// @namespace   https://greasyfork.org/en/users/8981-buzz
// @match       *://*.imdb.com/*title/tt*
// @connect     *
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://unpkg.com/preact@10.25.2/dist/preact.umd.js
// @require     https://unpkg.com/preact@10.25.2/hooks/dist/hooks.umd.js
// @license     GPLv2
// @noframes
// @author      buzz
// @version     2.0.15
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.xmlHttpRequest
// ==/UserScript==

(function (preact, hooks) {
  'use strict';

  var version = "2.0.15";
  var description = "Adds all kinds of links to IMDb, customizable!";
  var homepage = "https://github.com/buzz/imdb-link-em-all#readme";

  const DESCRIPTION = description;
  const HOMEPAGE = homepage;
  const NAME_VERSION = `Link 'em all! v${version}`;
  const SITES_URL = 'https://raw.githubusercontent.com/fynks/userscripts/refs/heads/main/imdb/imdb-multi.json'; // gets replaced by rollup!
  const GM_CONFIG_KEY = 'config';
  const GREASYFORK_URL = 'https://greasyfork.org/scripts/17154-imdb-link-em-all';
  const DEFAULT_CONFIG = {
    enabled_sites: [],
    fetch_results: true,
    first_run: true,
    open_blank: true,
    show_category_captions: true
  };
  const CATEGORIES = {
    search: 'Search',
    movie_site: 'Movie sites',
    pub_tracker: 'Public trackers',
    priv_tracker: 'Private trackers',
    streaming: 'Streaming',
    filehoster: 'Filehosters',
    subtitles: 'Subtitles',
    tv: 'TV'
  };
  const FETCH_STATE = {
    LOADING: 0,
    NO_RESULTS: 1,
    RESULTS_FOUND: 2,
    NO_ACCESS: 3,
    TIMEOUT: 4,
    ERROR: 5
  };

  var img$8 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAABkklEQVQoz1VRTUsCYRBe/AHe/Qn+j710EbKLVJcyiAqLLkWJkdkSUdChOpQRRWVRG6RQUqirtq7pupZRUvRxyOIlIU9ed5+mbSFjDjPvzDPPM+8MB+7PVG9ekiXJ25qzXMVZtqu2fP0D7xDrZ7aY/djZAqiEy3qRKY4se8ULYizqENm+vhO2ADf+Z3zhCdlmyqjiDieG2FTBEMeC3wQUA7LxTIVHAlVNfwsVV5gwRgOWRE64QwkFXGAD28hCQYb65wVT4kqTa+nGAzQkMKOM81P8knJJIA2LjblaSONk/ZOICyhjD7P8T886L0ImNoUGHtI5SX8jTYU6olg2Aav8ATHEkaZ8j87taEu1rcY1QUrYVNb4FZLIkNw5+hqeWodmDikKORorhzwOsU9RCqcUDQjWHo4CEeOeyioqNEuemHJI0mvY6P/95q4/gVdEEGoKhkzqPmO4GSH9abj91h6C4RG9j405Qkwlhl7W6fAwl94WbjnWiHPQPmkL1pOIoaveaeu2u5z/rvlrPq9Hapfc/879DQmIXQjyme6GAAAAAElFTkSuQmCC";

  var img$7 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIsSURBVDjLpVNLSJQBEP7+h6uu62vLVAJDW1KQTMrINQ1vPQzq1GOpa9EppGOHLh0kCEKL7JBEhVCHihAsESyJiE4FWShGRmauu7KYiv6Pma+DGoFrBQ7MzGFmPr5vmDFIYj1mr1WYfrHPovA9VVOqbC7e/1rS9ZlrAVDYHig5WB0oPtBI0TNrUiC5yhP9jeF4X8NPcWfopoY48XT39PjjXeF0vWkZqOjd7LJYrmGasHPCCJbHwhS9/F8M4s8baid764Xi0Ilfp5voorpJfn2wwx/r3l77TwZUvR+qajXVn8PnvocYfXYH6k2ioOaCpaIdf11ivDcayyiMVudsOYqFb60gARJYHG9DbqQFmSVNjaO3K2NpAeK90ZCqtgcrjkP9aUCXp0moetDFEeRXnYCKXhm+uTW0CkBFu4JlxzZkFlbASz4CQGQVBFeEwZm8geyiMuRVntzsL3oXV+YMkvjRsydC1U+lhwZsWXgHb+oWVAEzIwvzyVlk5igsi7DymmHlHsFQR50rjl+981Jy1Fw6Gu0ObTtnU+cgs28AKgDiy+Awpj5OACBAhZ/qh2HOo6i+NeA73jUAML4/qWux8mt6NjW1w599CS9xb0mSEqQBEDAtwqALUmBaG5FV3oYPnTHMjAwetlWksyByaukxQg2wQ9FlccaK/OXA3/uAEUDp3rNIDQ1ctSk6kHh1/jRFoaL4M4snEMeD73gQx4M4PsT1IZ5AfYH68tZY7zv/ApRMY9mnuVMvAAAAAElFTkSuQmCC";

  var img$6 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKcSURBVDjLpZPLa9RXHMU/d0ysZEwmMQqZiTaP0agoaKGJUiwIxU0hUjtUQaIuXHSVbRVc+R8ICj5WvrCldJquhVqalIbOohuZxjDVxDSP0RgzyST9zdzvvffrQkh8tBs9yy9fPhw45xhV5X1U8+Yhc3U0LcEdVxdOVq20OA0ooQjhpnfhzuDZTx6++m9edfDFlZGMtXKxI6HJnrZGGtauAWAhcgwVnnB/enkGo/25859l3wIcvpzP2EhuHNpWF9/dWs/UnKW4EOGDkqhbQyqxjsKzMgM/P1ymhlO5C4ezK4DeS/c7RdzQoa3x1PaWenJjJZwT9rQ1gSp/js1jYoZdyfX8M1/mp7uFaTR8mrt29FEMQILr62jQ1I5kA8OF59jIItVA78dJertTiBNs1ZKfLNG+MUHX1oaURtIHEAOw3p/Y197MWHEJEUGCxwfHj8MTZIcnsGKxzrIURYzPLnJgbxvG2hMrKdjItjbV11CYKeG8R7ygIdB3sBMFhkem0RAAQ3Fuka7UZtRHrasOqhYNilOwrkrwnhCU/ON5/q04vHV48ThxOCuoAbxnBQB+am65QnO8FqMxNCjBe14mpHhxBBGCWBLxD3iyWMaYMLUKsO7WYH6Stk1xCAGccmR/Ozs/bKJuXS39R/YgIjgROloSDA39Deit1SZWotsjD8pfp5ONqZ6uTfyWn+T7X0f59t5fqDhUA4ry0fYtjJcWeZQvTBu4/VqRuk9/l9Fy5cbnX+6Od26s58HjWWaflwkusKGxjm1bmhkvLXHvh1+WMbWncgPfZN+qcvex6xnUXkzvSiYP7EvTvH4toDxdqDD4+ygT+cKMMbH+3MCZ7H9uAaDnqytpVX8cDScJlRY0YIwpAjcNcuePgXP/P6Z30QuoP4J7WbYhuQAAAABJRU5ErkJggg==";

  var img$5 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJ/SURBVDjLbVJBaxNBGH2bpEkTmxi1NTRKTZtoQUHEWz0Igj2I4kG9eVNQhEBO7bEHc+yv8JAiHnr2B4gFqVrQRhObljQolBSTJqZJdnZmfbNr2rU68DEz33zfm/fejGHbNrxjaWlpRCk1J6WcYZxkgPGTsWJZ1mIul/vlrTe8AIVC4Qqbl5PJ5GQsFoPP5wP36PV6qNfr2OIg0L35+fm1fwDYPMLDj+l0OmOaJmq1Gjqdjr4dgUAAiUTCqSsWixvMXV5YWOjqvW+AxOSz8fHxjBAC5XJ5s91up7gO6tDrUqn0QwOTXYZSsoO+wGDB5EwkEkGlUgGb7mSz2apHajWfz9+sVqvFVCrl1P4PYExr5m16vYUjQ+c0O11DtmN/ebD95pG9UpnGzl7Y0Xz30ir8toAtLdiWG0JIvFi76piaGG7g9plVTD/5YLgMCPLg/g0YtMTwhznfApRBfsP6kAYJSKuN57Md5oXTsvHy7aEEfZMutHZfIRAahWGMsHAICMeZVsD+HmTrG8zudyhrH+HJLGyz7wEgRSh9k4nm+nvqPIb4xWuovV5k/2lMXJ9F8+s6ARqIpk6QsIQtTC+AcGTYpBqfvgBfcJTuKMi+xKfdMCZgIp6eRK8TYu2+w2oA4PwDm+5qVK218XmNLN7xxILqKfS7pGqTWekLmuVtV65STs8hA73RqJQQP5+CP3KKACamHj7FlGBDawfH00kEW0MuA8o9AmA6qMrSHqwTIAoM08hAkHkN0ES3UYfotBGdiNFu5cr2AmgJobOPET7nhxEMuU/o40soSjO7iHbbVNgnUen6pY0/AOCTbC7PuV44H0f8Cetg5g9zP5aU7loDcfwGcrKyzYdvwUUAAAAASUVORK5CYII=";

  var img$4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLvZPZLkNhFIV75zjvYm7VGFNCqoZUJ+roKUUpjRuqp61Wq0NKDMelGGqOxBSUIBKXWtWGZxAvobr8lWjChRgSF//dv9be+9trCwAI/vIE/26gXmviW5bqnb8yUK028qZjPfoPWEj4Ku5HBspgAz941IXZeze8N1bottSo8BTZviVWrEh546EO03EXpuJOdG63otJbjBKHkEp/Ml6yNYYzpuezWL4s5VMtT8acCMQcb5XL3eJE8VgBlR7BeMGW9Z4yT9y1CeyucuhdTGDxfftaBO7G4L+zg91UocxVmCiy51NpiP3n2treUPujL8xhOjYOzZYsQWANyRYlU4Y9Br6oHd5bDh0bCpSOixJiWx71YY09J5pM/WEbzFcDmHvwwBu2wnikg+lEj4mwBe5bC5h1OUqcwpdC60dxegRmR06TyjCF9G9z+qM2uCJmuMJmaNZaUrCSIi6X+jJIBBYtW5Cge7cd7sgoHDfDaAvKQGAlRZYc6ltJlMxX03UzlaRlBdQrzSCwksLRbOpHUSb7pcsnxCCwngvM2Rm/ugUCi84fycr4l2t8Bb6iqTxSCgNIAAAAAElFTkSuQmCC";

  var img$3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAALnSURBVDjLpZNbSNNxFMcN9b3opZce7CHqIagegqAgLB+NyMIMFCRBSX3wPm+Z1ZZZlhpT03ReZs7ZvKDpps7LmKa2uTbTnO7inM3L5vxvc3P+1X37zYeVGBF04Mvvxzmcz+/8Duf4AfD7Hx1yDPIKg0dbHonlnYz1r8JsWt6VRUubk1ZE1Unt7e+yLv8VIOGzylS9jG2jegxry1rYbFZQlAVLCyqopDwI38duNr9JyP0jYIjHLNHIymE1G6A2WPFxQI8ywTRK+d/Q0KPB5NwK9OpRdFfFgcOMSTsAEDUUXJF1ptKWVT0kChNaB/XQGG2w2Bww2zahXrShoVeDtmEdZhU94D6956xiPbzgA/TXZXTPk8D3hXXwxTp4zUpRmPuxjC1y98rhASq6NJAqDejjpqAiJ6LBBxioT1w2GabAFc1jhrzs3PHA4XSCXcPBKgHZ3W4IRAOQzFF42aTE1EQzqrLD9D6AuC5hy2pZQmGjEqsuGlb3HrZJIPNxPritHcjIy0fv6DimKBrJ7HEs6sdRk33H5QMIK2O3LGta5HMUWHTQBLIHI2XHs1dF+8kShQrmHUBmoZFY/BkG7TCqM8N+AQSvo3TaqR4U85UYnqdgIp822ml0D41At27Dyi6gamFjIPIM+oMD0R92HE2RZykfoJYZxRlqZmBUOYcCvhpm0jArDdj3iMh9vq0MqvSr2PpUBM+MEE5eMr7En/P0Xg9I3AdUP48/X/8k3DUrq0djjxwv+LNQ6DfgIP1wOGn0R5yCiySjNBTIOAawgmAuvAbRDX+db5Aq86MZHwruYmasDIMTMrA4Y0gvHUFKsXS/bI+8Fb/bRt4J4g/wHBhldk5kbiXjlqOj/D4mxUzoZrjQTdei7/ZRbFY/AEiSO90PViJDnD9EIf5Lh5aJnRt9qSQtrOlt8k1DeWqoyytBzEVqLOa0x5QRhLXMQGhjjkAcGrArDPHP+ue1lYafZJAX9d6yyWn0Jnv9PwH2GPv45gRecwAAAABJRU5ErkJggg==";

  var img$2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIhSURBVDjLlZPrThNRFIWJicmJz6BWiYbIkYDEG0JbBiitDQgm0PuFXqSAtKXtpE2hNuoPTXwSnwtExd6w0pl2OtPlrphKLSXhx07OZM769qy19wwAGLhM1ddC184+d18QMzoq3lfsD3LZ7Y3XbE5DL6Atzuyilc5Ciyd7IHVfgNcDYTQ2tvDr5crn6uLSvX+Av2Lk36FFpSVENDe3OxDZu8apO5rROJDLo30+Nlvj5RnTlVNAKs1aCVFr7b4BPn6Cls21AWgEQlz2+Dl1h7IdA+i97A/geP65WhbmrnZZ0GIJpr6OqZqYAd5/gJpKox4Mg7pD2YoC2b0/54rJQuJZdm6Izcgma4TW1WZ0h+y8BfbyJMwBmSxkjw+VObNanp5h/adwGhaTXF4NWbLj9gEONyCmUZmd10pGgf1/vwcgOT3tUQE0DdicwIod2EmSbwsKE1P8QoDkcHPJ5YESjgBJkYQpIEZ2KEB51Y6y3ojvY+P8XEDN7uKS0w0ltA7QGCWHCxSWWpwyaCeLy0BkA7UXyyg8fIzDoWHeBaDN4tQdSvAVdU1Aok+nsNTipIEVnkywo/FHatVkBoIhnFisOBoZxcGtQd4B0GYJNZsDSiAEadUBCkstPtN3Avs2Msa+Dt9XfxoFSNYF/Bh9gP0bOqHLAm2WUF1YQskwrVFYPWkf3h1iXwbvqGfFPSGW9Eah8HSS9fuZDnS32f71m8KFY7xs/QZyu6TH2+2+FAAAAABJRU5ErkJggg==";

  var img$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAMtSURBVDjLVZNLa1xlAIafc5szk8xkMkkm5MKY2EpT2qa2MTVCmoLS2gq6EKooimAW7iQb/0I2bgTRIog0oFW7KQpCS7VqrSmmJGlSQtswqWlLLmbGmcmcZM6cy/edz00r6bt8eXh4N6+mlGJnxiZHR4APgSNAFjCBKjClInXm05Gzl3by2mPB2OSoCUwAp1/LHbcziSyO24gbgJAegg2urF8UUsifhZBvfvXK99v/C8YmRy3gt8G2/cMv517E8Wx8ApYcjZiyKbkRSgQkcFn3rzG9Nn1LhOLYt2/8UNUfLZkYaN0zfLRrkLIMCHUNIXTqIoZLjLJvU/ASrFQtnko+z2BH38HAD78DMConHh4FPn5nz6vGgqyxTp16JNj2kpR9C8eD/OoW1VoNO1NCS+d5oW0vV27f2PX11MS8MTR6+JOTXUMHNCPBui5AtdMpk8xsGNQ9ndur20TxCnbPIn5TnmJUwaxIDrTm9Jn7d1tM4EiuqZs5d41iXGefsZsIwYNCgOfVSXconJbLLEWb4CuahU2+6HO8d4DQF/0m0NpgNvLAXaPgu6QadrEZpKhUItJZj/aMS1EewvHnsdUWW/+WKG82kEykCAPRbCqlNE1B4DsocpiW5OJfIVoiyfqSQFdNdGXrpLZGcFZDPKYJg2VQCiGEZkoRlZ3A6W41mknFn2WlaOKFFrG4Tbw9wb2/S3g3miHySLdbNDd2kzYKVGpVpIiqugjF7P3yQ55pyLFWmCSyVokZPqHnEoYmsWQGuyWOGdexNIkRFOnqbGN5bRngjh4G4rMLd6+KnmQW012lWrpOJuNjCh9LU9i6gRkEZHIrpNv/QK8vcijXz5lfLijgS+PmuYV75+fPDXr1Wt9znfsouy5x+2miuoltW1iawBJV0o0/wT8lBvbv5WZ+gaWNlasz43MfmQChH777e37uT78eHDx5+BiLBROjqhDaFmGkQ1KS6+mlr7+XX2evc+nWVB54+4kznfr8pZQIxXkRyhPvDb9vIjtQqgFN12hLO2yUZ/ni8o8SuAa8NTM+t/GE4HGGx4del0J+IGXUH8ko86iuAneAszPjc9/s5P8DuO6ZcsXuRqAAAAAASUVORK5CYII=";

  var img = "data:image/gif;base64,R0lGODlhEAAQAPUCAHR2dOTi5Pz6/PTy9MzKzNTW1Ly6vHx+fOTm5LSytHx6fLy+vPT29Nze3ISChIyOjOzq7JSWlJyenKSmpNTS1JSSlJyanNza3Pz+/MTGxOzu7KSipKyqrIyKjISGhLS2tMTCxMzOzKyurP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQACACwAAAAAEAAQAAAFUaAgjsJ1kWgpXoBypsIGbGV7BlMwMi3AlK/JjCSjoXA60g+m3Eg0TGJLEo1EYtPqFSLZQKLHRRIcUNiODcxo0VscXTszXPMVYC7qnXiVAftFIQAh+QQJBQABACwAAAAADwAQAAAFUWAgjoEGkeioKYqWBouzlKzLZMLoAI5oihlFZhSboQS4l7JkMOSWMJ5h2TRIqc4mA6q6bKEMD+9LIl94QohEcgp/w+MKq+IrewMdNJdyOFBQIQAh+QQJBQAKACwAAAEADwAPAAAFSaAijkpVkWRhFaI5ImQEWKgSAMG71jbvv5TfC3AI+igFCtHIS9qYQtGgSYCMJDMU5LC0EXECgyH8JbSyCWICwS2+zllIlbojhQAAIfkECQUAEAAsAAABABAADwAABVMgJI6QYZDosAyiOTLoAiwoxBzwa7C1UP8/BAJoezwaCIVi+DMCjkpmzfmwSXvGAFEkCPhGMhpJ4PxCHM9WwfYEaFsOGuFJICvNJNnMih8nEjkkIQAh+QQJBQAGACwAAAEAEAAPAAAFV6AhjgZFiUMxkNiFiaYxOICzwsBFlnU+ti8WzbYrylS/oHHA4Qwwj4dyx6k5owKjoargyKY7plPL2hUihWLVO4p0URBZLwtDyxWBLYBdLNTSMmQtBGAGIQAh+QQJBQABACwBAAAADwAQAAAGVsCAUNh4PBrDZNIIeAQwGkxyIOw0OxhLU/oEUIudBqTpHVKV2a1yLYiu3xhQRvD5vIlNuf0Oyt/Nclx/aAZnSRlhQwYABkJtVU2AGl0KX4lsfoMBYm9BACH5BAkFAAQALAEAAAAPABAAAAZVQIJQOOBwBsMkYoEgbAAATpKogAY4UOnn8BEuoNHiBnmAUq3TbZfInLrf08uFEArB6db6/VKd39l/bxgXAm4XEn54iUMSUUMChF4bVItJHR2BRIVuQQAh+QQFBQABACwAAAAAEAAPAAAGWsCAcCgAgQTDZIBxYQRAAABIKWR4FB5mdPGshIYXrKJpRFYAFeI1qwx5k0UkNUlxjOdVTcAexWuwf1EOflEadQ4UeEt6io0DcwwLTmqPbQpccGAZVZKKIiJzQQA7";

  const iconSrcs = {
    cog: img$8,
    error: img$7,
    info: img$6,
    lock: img$5,
    tick: img$4,
    timeout: img$3,
    world: img$1,
    x: img$2,
    spinner: img
  };
  const Icon = ({
    className,
    title,
    type
  }) => preact.h("img", {
    alt: `${type} icon`,
    className: className,
    src: iconSrcs[type],
    title: title
  });

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$6 = ".Options_options__5TB2e {\n  margin-top: 0;\n}\n\n  .Options_options__5TB2e > label {\n    display: flex;\n    align-items: center;\n    padding: 16px 20px;\n    margin: 8px 0;\n    background: #f8f9fa;\n    border-radius: 8px;\n    border: 1px solid #e9ecef;\n    cursor: pointer;\n    transition: all 0.2s ease;\n    font-weight: 500;\n    color: #2c3e50;\n}\n\n  .Options_options__5TB2e > label:hover {\n    background: #e9ecef;\n    border-color: #dee2e6;\n    transform: translateY(-1px);\n}\n\n  .Options_options__5TB2e > label > input {\n    margin-right: 12px;\n    transform: scale(1.2);\n    accent-color: #667eea;\n}\n\n  .Options_options__5TB2e > label > span {\n    margin-left: 0;\n    font-size: 14px;\n}\n\n  .Options_options__5TB2e > label > br {\n    display: none;\n}\n";
  var css$6 = {"options":"Options_options__5TB2e"};
  styleInject(css_248z$6);

  const Options = ({
    options
  }) => {
    const optionLabels = options.map(([key, title, val, setter]) => preact.h("label", {
      key: key
    }, preact.h("input", {
      checked: val,
      onInput: ev => setter(ev.target.checked),
      type: "checkbox"
    }), preact.h("span", null, title), preact.h("br", null)));
    return preact.h("div", {
      className: css$6.options
    }, optionLabels);
  };

  const SiteIcon = ({
    className,
    site,
    title
  }) => site.icon ? preact.h("img", {
    alt: site.title,
    className: className,
    src: site.icon,
    title: title
  }) : null;

  var css_248z$5 = ".Sites_searchBar__omy0k {\n  display: flex;\n  flex-direction: row;\n  margin-bottom: 20px;\n  align-items: center;\n  gap: 16px;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY {\n    background: #f8f9fa;\n    border-radius: 8px;\n    border: 2px solid #e9ecef;\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    height: 44px;\n    line-height: normal;\n    outline: 0;\n    padding: 0 16px;\n    transition: all 0.2s ease;\n    flex: 1;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY:focus-within {\n      background: #ffffff;\n      border-color: #667eea;\n      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08);\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > * {\n      background-color: transparent;\n      border: none;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > span {\n      color: #6c757d;\n      font-size: 16px;\n      margin-right: 12px;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > button {\n      margin-left: 8px;\n      padding: 6px;\n      border-radius: 4px;\n      cursor: pointer;\n      transition: background-color 0.2s ease;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > button:hover {\n      background-color: #f1f3f4;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > input {\n      flex-grow: 1;\n      outline: none;\n      padding: 0;\n      font-size: 14px;\n      color: #2c3e50;\n      background: transparent;\n}\n\n  .Sites_searchBar__omy0k .Sites_searchInput__0o5oY > input::placeholder {\n      color: #9ca3af;\n}\n\n  .Sites_searchBar__omy0k .Sites_resultCount__xMc-y {\n    font-weight: 600;\n    color: #6c757d;\n    font-size: 14px;\n    white-space: nowrap;\n    padding: 12px 16px;\n    background: #f8f9fa;\n    border-radius: 8px;\n    border: 1px solid #e9ecef;\n}\n\n  .Sites_searchBar__omy0k .Sites_resultCount__xMc-y > span {\n      color: #667eea;\n      font-weight: 700;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 {\n    display: flex;\n    flex-wrap: wrap;\n    margin-bottom: 24px;\n    background: #f8f9fa;\n    border-radius: 12px;\n    padding: 20px;\n    border: 1px solid #e9ecef;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 h4 {\n      width: 100%;\n      margin: 0 0 16px 0;\n      color: #2c3e50;\n      font-size: 16px;\n      font-weight: 600;\n      padding-bottom: 12px;\n      border-bottom: 2px solid #e9ecef;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label {\n      align-items: center;\n      color: #495057;\n      display: flex;\n      flex-flow: row;\n      padding: 8px 12px;\n      margin: 4px;\n      transition: all 0.2s ease;\n      width: calc(25% - 8px);\n      background: #ffffff;\n      border-radius: 8px;\n      border: 1px solid #e9ecef;\n      cursor: pointer;\n      position: relative;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label:hover {\n        color: #2c3e50;\n        background: #f1f3f4;\n        border-color: #dee2e6;\n        transform: translateY(-1px);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label.Sites_checked__nqnSg {\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: #ffffff;\n        border-color: #667eea;\n        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label.Sites_checked__nqnSg span {\n        color: #ffffff;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label .Sites_title__4rEy0 {\n        flex-grow: 1;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        font-weight: 500;\n        font-size: 13px;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label input {\n        margin-right: 8px;\n        transform: scale(1.1);\n        accent-color: #667eea;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label .Sites_extraIcon__YYfVy {\n        height: 14px;\n        margin-left: 6px;\n        width: 14px;\n        opacity: 0.8;\n}\n\n.Sites_siteList__4rCbT .Sites_catList__Fv8G0 label .Sites_siteIcon__GRVSj {\n        flex-shrink: 0;\n        height: 18px;\n        margin-right: 8px;\n        width: 18px;\n        border-radius: 3px;\n}\n";
  var css$5 = {"searchBar":"Sites_searchBar__omy0k","searchInput":"Sites_searchInput__0o5oY","resultCount":"Sites_resultCount__xMc-y","siteList":"Sites_siteList__4rCbT","catList":"Sites_catList__Fv8G0","checked":"Sites_checked__nqnSg","title":"Sites_title__4rEy0","extraIcon":"Sites_extraIcon__YYfVy","siteIcon":"Sites_siteIcon__GRVSj"};
  styleInject(css_248z$5);

  const SearchInput = ({
    q,
    setQ
  }) => preact.h("div", {
    className: css$5.searchInput
  }, preact.h("span", null, "\uD83D\uDD0D"), preact.h("input", {
    onInput: e => {
      setQ(e.target.value.toLowerCase().trim());
    },
    placeholder: "Search",
    value: q
  }), preact.h("button", {
    style: {
      display: q.length ? 'unset' : 'none'
    },
    title: "Clear",
    type: "button",
    onClick: () => setQ('')
  }, preact.h(Icon, {
    type: "x"
  })));
  const DummyIcon = ({
    size
  }) => {
    const sizePx = `${size}px`;
    const style = {
      display: 'inline-block',
      height: sizePx,
      width: sizePx
    };
    return preact.h("div", {
      className: css$5.siteIcon,
      style: style
    });
  };
  const SiteLabel = ({
    checked,
    setEnabled,
    site
  }) => {
    const input = preact.h("input", {
      checked: checked,
      onInput: e => setEnabled(prev => e.target.checked ? [...prev, site.id] : prev.filter(id => id !== site.id)),
      type: "checkbox"
    });
    const icon = site.icon ? preact.h(SiteIcon, {
      className: css$5.siteIcon,
      site: site,
      title: site.title
    }) : preact.h(DummyIcon, {
      size: 16
    });
    const title = preact.h("span", {
      className: css$5.title,
      title: site.title
    }, site.title);
    const extraIcons = [site.noAccessMatcher ? preact.h(Icon, {
      className: css$5.extraIcon,
      title: "Access restricted",
      type: "lock"
    }) : null, site.noResultsMatcher ? preact.h(Icon, {
      className: css$5.extraIcon,
      title: "Site supports fetching of results",
      type: "tick"
    }) : null];
    return preact.h("label", {
      className: checked ? css$5.checked : null
    }, input, icon, " ", title, " ", extraIcons);
  };
  const CategoryList = ({
    enabled,
    name,
    setEnabled,
    sites
  }) => {
    const siteLabels = sites.map(site => preact.h(SiteLabel, {
      checked: enabled.includes(site.id),
      setEnabled: setEnabled,
      site: site
    }));
    return preact.h("div", {
      className: css$5.catList
    }, preact.h("h4", null, name, " ", preact.h("span", null, "(", sites.length, ")")), siteLabels);
  };
  const Sites = ({
    enabledSites,
    setEnabledSites,
    sites
  }) => {
    const [q, setQ] = hooks.useState('');
    const catSites = Object.keys(CATEGORIES).map(cat => {
      const s = sites.filter(site => site.category === cat);
      if (q.length) {
        return s.filter(site => site.title.toLowerCase().includes(q));
      }
      return s;
    });
    const cats = Object.entries(CATEGORIES).map(([cat, catName], i) => catSites[i].length ? preact.h(CategoryList, {
      enabled: enabledSites,
      key: cat,
      name: catName,
      setEnabled: setEnabledSites,
      sites: catSites[i]
    }) : null);
    const total = catSites.reduce((acc, s) => acc + s.length, 0);
    return preact.h(preact.Fragment, null, preact.h("div", {
      className: css$5.searchBar
    }, preact.h(SearchInput, {
      q: q,
      setQ: setQ
    }), preact.h("div", {
      className: css$5.resultCount
    }, "Showing ", preact.h("span", null, total), " sites.")), preact.h("div", {
      className: css$5.siteList
    }, cats));
  };

  var css_248z$4 = ".About_about__wuWQp {\n  padding: 0;\n  position: relative;\n  color: #2c3e50;\n  line-height: 1.7;\n}\n\n  .About_about__wuWQp ul {\n    list-style: none;\n    padding: 0;\n    margin: 16px 0;\n}\n\n  .About_about__wuWQp ul > li {\n    margin-bottom: 8px;\n    padding: 8px 0;\n    border-left: 3px solid #667eea;\n    padding-left: 16px;\n    background: #f8f9fa;\n    margin-left: 0;\n    border-radius: 0 6px 6px 0;\n}\n\n  .About_about__wuWQp ul > li > a {\n    color: #667eea;\n    text-decoration: none;\n    font-weight: 500;\n    transition: color 0.2s ease;\n}\n\n  .About_about__wuWQp ul > li > a:hover {\n    color: #764ba2;\n    text-decoration: underline;\n}\n\n  .About_about__wuWQp h2 {\n    font-size: 18px;\n    margin: 24px 0 16px 0;\n    color: #2c3e50;\n    font-weight: 600;\n    border-bottom: 2px solid #e9ecef;\n    padding-bottom: 8px;\n}\n\n  .About_about__wuWQp h3 {\n    color: #2c3e50;\n    font-weight: 600;\n    margin-bottom: 8px;\n}\n\n  .About_about__wuWQp > *:last-child {\n    margin-bottom: 0;\n}\n\n  .About_about__wuWQp .About_top__jQHYs {\n    text-align: center;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    padding: 24px;\n    border-radius: 8px;\n    margin-bottom: 24px;\n}\n\n  .About_about__wuWQp .About_top__jQHYs h3 {\n    color: white;\n    margin-bottom: 8px;\n    font-size: 20px;\n}\n\n  .About_about__wuWQp .About_top__jQHYs p {\n    margin: 0;\n    opacity: 0.9;\n    font-size: 15px;\n}\n\n  .About_about__wuWQp .About_content__hReHO {\n    width: 100%;\n    margin: 0;\n}\n\n  .About_about__wuWQp p {\n    margin: 12px 0;\n    font-size: 14px;\n}\n\n  .About_about__wuWQp em {\n    color: #667eea;\n    font-style: normal;\n    font-weight: 600;\n}\n";
  var css$4 = {"about":"About_about__wuWQp","top":"About_top__jQHYs","content":"About_content__hReHO"};
  styleInject(css_248z$4);

  const About = () => preact.h("div", {
    className: css$4.about
  }, preact.h("div", {
    className: css$4.top
  }, preact.h("h3", null, "\uD83C\uDFA5 ", NAME_VERSION), preact.h("p", null, DESCRIPTION)), preact.h("div", {
    className: css$4.content
  }, preact.h("h2", null, "\uD83D\uDD17 Links"), preact.h("ul", null, preact.h("li", null, preact.h("a", {
    target: "_blank",
    rel: "noreferrer",
    href: HOMEPAGE
  }, "GitHub")), preact.h("li", null, preact.h("a", {
    target: "_blank",
    rel: "noreferrer",
    href: GREASYFORK_URL
  }, "Greasy Fork"))), preact.h("h2", null, "\u2728 Contributions"), preact.h("p", null, "Add new sites or update existing entries."), preact.h("ul", null, preact.h("li", null, preact.h("a", {
    target: "_blank",
    rel: "noreferrer",
    href: "https://github.com/buzz/imdb-link-em-all/issues/new"
  }, "Open a GitHub issue"), ' ', "or"), preact.h("li", null, preact.h("a", {
    target: "_blank",
    rel: "noreferrer",
    href: "https://greasyfork.org/en/scripts/17154-imdb-link-em-all/feedback"
  }, "Give feedback"), ' ', "on Greasy Fork.")), preact.h("p", null, preact.h("em", null, "Thanks to all the contributors!"), " \uD83D\uDC4D"), preact.h("h2", null, "\u2696 License"), preact.h("p", null, "This script is licensed under the terms of the", ' ', preact.h("a", {
    target: "_blank",
    rel: "noreferrer",
    href: "https://github.com/buzz/imdb-link-em-all/blob/master/LICENSE"
  }, "GPL-2.0 License"), ".")));

  var css_248z$3 = ".Config_popover__qMfu9 {\n  background: linear-gradient(145deg, #ffffff, #f8f9fa);\n  border-radius: 12px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);\n  color: #2c3e50;\n  display: block;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n  font-size: 13px;\n  left: calc(-800px + 35px);\n  line-height: 1.6;\n  padding: 0;\n  position: absolute;\n  top: calc(20px + 8px);\n  white-space: nowrap;\n  width: 800px;\n  z-index: 1000;\n  border: 1px solid rgba(0, 0, 0, 0.08);\n  backdrop-filter: blur(10px);\n  opacity: 0;\n  transform: translateY(-10px) scale(0.95);\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  pointer-events: none;\n}\n\n.Config_popover__qMfu9[style*=\"block\"] {\n  opacity: 1;\n  transform: translateY(0) scale(1);\n  pointer-events: auto;\n}\n.Config_popover__qMfu9.Config_layout-legacy__M6fyd {\n    left: calc(-800px + 235px);\n}\n.Config_popover__qMfu9.Config_layout-legacy__M6fyd:before {\n      right: calc(235px - 2 * 10px);\n}\n.Config_popover__qMfu9:before {\n    border-bottom: 10px solid #ffffff;\n    border-left: 10px solid transparent;\n    border-right: 10px solid transparent;\n    border-top: 10px solid transparent;\n    content: \"\";\n    display: block;\n    height: 10px;\n    right: calc(35px - 2 * 10px);\n    position: absolute;\n    top: calc(-2 * 10px);\n    width: 0;\n    filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK {\n    display: flex;\n    flex-direction: column;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 {\n      display: flex;\n      flex-direction: row;\n      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);\n      border-radius: 12px 12px 0 0;\n      padding: 16px 20px;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 .Config_link__GTbGq {\n        flex-grow: 1;\n        text-align: right;\n        display: flex;\n        align-items: center;\n        justify-content: flex-end;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 .Config_link__GTbGq > a {\n          color: #ffffff;\n          margin-left: 16px;\n          margin-right: 8px;\n          text-decoration: none;\n          font-weight: 500;\n          display: flex;\n          align-items: center;\n          transition: opacity 0.2s ease;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 .Config_link__GTbGq > a:visited {\n            color: #ffffff;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 .Config_link__GTbGq > a:hover {\n            opacity: 0.8;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 > button {\n        background: rgba(255, 255, 255, 0.15);\n        border: 1px solid rgba(255, 255, 255, 0.2);\n        border-radius: 8px 8px 0 0;\n        color: #ffffff;\n        font-size: 13px;\n        font-weight: 500;\n        margin: 0 4px 0 0;\n        outline: none;\n        padding: 10px 16px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 > button:hover {\n          background: rgba(255, 255, 255, 0.25);\n          transform: translateY(-1px);\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 > button.Config_active__vD-Fl {\n          background: #ffffff;\n          color: #667eea;\n          border-color: #ffffff;\n          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 > button:last-child {\n          margin-right: 0;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_top__6DKJ8 > button > img {\n          opacity: 0.9;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_body__wtDKH {\n      background: #ffffff;\n      border-radius: 0 0 12px 12px;\n      padding: 24px;\n      min-height: 400px;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_body__wtDKH > div {\n        overflow: hidden;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_body__wtDKH > div > *:first-child {\n          margin-top: 0;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_body__wtDKH > div > *:last-child {\n          margin-bottom: 0;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev {\n      display: flex;\n      flex-direction: row;\n      margin-top: 20px;\n      padding-top: 20px;\n      border-top: 1px solid #e9ecef;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev > div:first-child {\n        flex-grow: 1;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev button {\n        padding: 10px 20px;\n        margin-right: 12px;\n        border-radius: 6px;\n        font-weight: 500;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        border: 1px solid transparent;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev button.btn.primary {\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: white;\n        border: none;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev button.btn.primary:hover {\n          transform: translateY(-1px);\n          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev button.btn:not(.primary) {\n        background: #f8f9fa;\n        color: #6c757d;\n        border-color: #dee2e6;\n}\n.Config_popover__qMfu9 .Config_inner__oVRAK .Config_controls__-N2ev button.btn:not(.primary):hover {\n          background: #e9ecef;\n          color: #495057;\n}\n";
  var css$3 = {"popover":"Config_popover__qMfu9","layout-legacy":"Config_layout-legacy__M6fyd","inner":"Config_inner__oVRAK","top":"Config_top__6DKJ8","link":"Config_link__GTbGq","active":"Config_active__vD-Fl","body":"Config_body__wtDKH","controls":"Config_controls__-N2ev"};
  styleInject(css_248z$3);

  const OPTIONS = [['show_category_captions', 'Show category captions'], ['open_blank', 'Open links in new tab'], ['fetch_results', 'Automatically fetch results']];
  const Config = ({
    config,
    layout,
    setConfig,
    setShow,
    show,
    sites
  }) => {
    const [enabledSites, setEnabledSites] = hooks.useState(config.enabled_sites);
    const showCategoryCaptionsArr = hooks.useState(config.show_category_captions);
    const openBlankArr = hooks.useState(config.open_blank);
    const fetchResultsArr = hooks.useState(config.fetch_results);
    const [showCategoryCaptions, setShowCategoryCaptions] = showCategoryCaptionsArr;
    const [openBlank, setOpenBlank] = openBlankArr;
    const [fetchResults, setFetchResults] = fetchResultsArr;
    const optStates = [showCategoryCaptionsArr, openBlankArr, fetchResultsArr];
    const options = OPTIONS.map((opt, i) => [...opt, ...optStates[i]]);
    const [tab, setTab] = hooks.useState(0);
    const tabs = [{
      title: 'Sites',
      icon: 'world',
      comp: preact.h(Sites, {
        enabledSites: enabledSites,
        setEnabledSites: setEnabledSites,
        sites: sites
      })
    }, {
      title: 'Options',
      icon: 'cog',
      comp: preact.h(Options, {
        options: options
      })
    }, {
      title: 'About',
      icon: 'info',
      comp: preact.h(About, null)
    }];
    const onClickCancel = () => {
      setShow(false);
      // Restore state
      setEnabledSites(config.enabled_sites);
      setFetchResults(config.fetch_results);
      setOpenBlank(config.open_blank);
      setShowCategoryCaptions(config.show_category_captions);
    };
    const onClickSave = () => {
      setConfig({
        enabled_sites: enabledSites,
        fetch_results: fetchResults,
        open_blank: openBlank,
        show_category_captions: showCategoryCaptions
      });
      setShow(false);
    };
    return preact.h("div", {
      className: `${css$3.popover} ${css$3['layout-' + layout]}`,
      style: {
        display: show ? 'block' : 'none'
      }
    }, preact.h("div", {
      className: css$3.inner
    }, preact.h("div", {
      className: css$3.top
    }, tabs.map(({
      title,
      icon
    }, i) => preact.h("button", {
      className: tab === i ? css$3.active : null,
      type: "button",
      onClick: () => setTab(i)
    }, preact.h(Icon, {
      title: title,
      type: icon
    }), " ", title)), preact.h("div", {
      className: css$3.link
    }, preact.h("a", {
      target: "_blank",
      rel: "noreferrer",
      href: HOMEPAGE
    }, "\uD83C\uDFA5 ", NAME_VERSION))), preact.h("div", {
      className: css$3.body
    }, tabs.map(({
      comp
    }, i) => preact.h("div", {
      style: {
        display: tab === i ? 'block' : 'none'
      }
    }, comp))), preact.h("div", {
      className: css$3.controls
    }, preact.h("div", null, preact.h("button", {
      className: "btn primary small",
      onClick: onClickSave,
      type: "button"
    }, "OK"), preact.h("button", {
      className: "btn small",
      onClick: onClickCancel,
      type: "button"
    }, "Cancel")))));
  };

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  const replaceFields = (str, {
    id,
    title,
    year
  }, encode = true) => str.replace(new RegExp('{{IMDB_TITLE}}', 'g'), encode ? encodeURIComponent(title) : title).replace(new RegExp('{{IMDB_ID}}', 'g'), id).replace(new RegExp('{{IMDB_YEAR}}', 'g'), year);

  const checkResponse = (resp, site) => {
    // Likely a redirect to login page
    if (resp.responseHeaders && resp.responseHeaders.includes('Refresh: 0; url=')) {
      return FETCH_STATE.NO_ACCESS;
    }

    // There should be a responseText
    if (!resp.responseText) {
      return FETCH_STATE.ERROR;
    }

    // Detect Blogger content warning
    if (resp.responseText.includes('The blog that you are about to view may contain content only suitable for adults.')) {
      return FETCH_STATE.NO_ACCESS;
    }

    // Detect CloudFlare anti DDOS page
    if (resp.responseText.includes('Checking your browser before accessing')) {
      return FETCH_STATE.NO_ACCESS;
    }

    // Check site access
    if (site.noAccessMatcher) {
      const matchStrings = Array.isArray(site.noAccessMatcher) ? site.noAccessMatcher : [site.noAccessMatcher];
      if (matchStrings.some(matchString => resp.responseText.includes(matchString))) {
        return FETCH_STATE.NO_ACCESS;
      }
    }
    // Check results
    if (Array.isArray(site.noResultsMatcher)) {
      // Advanced ways of checking, currently only EL_COUNT is supported
      const [checkType, selector, compType, number] = site.noResultsMatcher;
      const m = resp.responseHeaders.match(/content-type:\s([^\s;]+)/);
      const contentType = m ? m[1] : 'text/html';
      let doc;
      try {
        const parser = new DOMParser();
        doc = parser.parseFromString(resp.responseText, contentType);
      } catch (e) {
        console.error('Could not parse document!');
        return FETCH_STATE.ERROR;
      }
      switch (checkType) {
        case 'EL_COUNT':
          {
            let result;
            try {
              result = doc.querySelectorAll(selector);
            } catch (err) {
              console.error(err);
              return FETCH_STATE.ERROR;
            }
            if (compType === 'GT') {
              if (result.length > number) {
                return FETCH_STATE.RESULTS_FOUND;
              }
            }
            if (compType === 'LT') {
              if (result.length < number) {
                return FETCH_STATE.RESULTS_FOUND;
              }
            }
            break;
          }
      }
      return FETCH_STATE.NO_RESULTS;
    }
    const matchStrings = Array.isArray(site.noResultsMatcher) ? site.noResultsMatcher : [site.noResultsMatcher];
    if (matchStrings.some(matchString => resp.responseText.includes(matchString))) {
      return FETCH_STATE.NO_RESULTS;
    }
    return FETCH_STATE.RESULTS_FOUND;
  };
  const useResultFetcher = (imdbInfo, site) => {
    const [fetchState, setFetchState] = hooks.useState(null);
    hooks.useEffect(() => {
      let xhr;
      if (site.noResultsMatcher) {
        // Site supports result fetching
        const {
          url
        } = site;
        const isPost = Array.isArray(url);
        const opts = {
          timeout: 20000,
          onload: resp => setFetchState(checkResponse(resp, site)),
          onerror: resp => {
            console.error(`Failed to fetch results from URL '${url}': ${resp.statusText}`);
            setFetchState(FETCH_STATE.ERROR);
          },
          ontimeout: () => setFetchState(FETCH_STATE.TIMEOUT)
        };
        if (isPost) {
          const [postUrl, fields] = url;
          opts.method = 'POST';
          opts.url = postUrl;
          opts.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
          };
          opts.data = Object.keys(fields).map(key => {
            const val = replaceFields(fields[key], imdbInfo, false);
            return `${key}=${val}`;
          }).join('&');
        } else {
          opts.method = 'GET';
          opts.url = replaceFields(url, imdbInfo);
        }
        xhr = GM.xmlHttpRequest(opts);
        setFetchState(FETCH_STATE.LOADING);
      }
      return () => {
        if (xhr && xhr.abort) {
          xhr.abort();
        }
      };
    }, [imdbInfo, site]);
    return fetchState;
  };

  var css_248z$2 = ".SiteLink_linkWrapper__wGnJ- {\n  display: inline-block;\n  margin-right: 8px;\n  margin-bottom: 8px;\n}\n\n  .SiteLink_linkWrapper__wGnJ- img {\n    vertical-align: middle;\n}\n\n  .SiteLink_linkWrapper__wGnJ- a {\n    white-space: nowrap;\n    display: inline-flex;\n    align-items: center;\n    padding: 8px 12px;\n    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);\n    border: 1px solid #dee2e6;\n    border-radius: 6px;\n    text-decoration: none;\n    color: #495057;\n    font-weight: 500;\n    font-size: 13px;\n    transition: all 0.2s ease;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);\n}\n\n  .SiteLink_linkWrapper__wGnJ- a:hover {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    border-color: #667eea;\n    transform: translateY(-1px);\n    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);\n}\n\n  .SiteLink_linkWrapper__wGnJ- a:visited {\n    color: #495057;\n}\n\n  .SiteLink_linkWrapper__wGnJ- a:visited:hover {\n    color: white;\n}\n\n  .SiteLink_linkWrapper__wGnJ- a > img {\n      height: 16px;\n      width: 16px;\n      margin-right: 6px;\n      border-radius: 2px;\n}\n\n  .SiteLink_linkWrapper__wGnJ- .SiteLink_resultsIcon__mjHYM {\n    margin-left: 6px;\n    display: inline-flex;\n    align-items: center;\n}\n";
  var css$2 = {"linkWrapper":"SiteLink_linkWrapper__wGnJ-","resultsIcon":"SiteLink_resultsIcon__mjHYM"};
  styleInject(css_248z$2);

  const ResultsIndicator = ({
    imdbInfo,
    site
  }) => {
    const fetchState = useResultFetcher(imdbInfo, site);
    let iconType;
    let title;
    switch (fetchState) {
      case FETCH_STATE.LOADING:
        iconType = 'spinner';
        title = 'Loading…';
        break;
      case FETCH_STATE.NO_RESULTS:
        iconType = 'x';
        title = 'No Results found!';
        break;
      case FETCH_STATE.RESULTS_FOUND:
        iconType = 'tick';
        title = 'Results found!';
        break;
      case FETCH_STATE.NO_ACCESS:
        iconType = 'lock';
        title = 'You have to login to this site!';
        break;
      case FETCH_STATE.TIMEOUT:
        iconType = 'timeout';
        title = 'You have to login to this site!';
        break;
      case FETCH_STATE.ERROR:
        iconType = 'error';
        title = 'Error fetching results! (See dev console for details)';
        break;
      default:
        return null;
    }
    return preact.h(Icon, {
      className: css$2.resultsIcon,
      title: title,
      type: iconType
    });
  };

  // As it is not possible to open links with POST request we need a trick
  const usePostLink = (url, openBlank, imdbInfo) => {
    const formEl = hooks.useRef();
    const isPost = Array.isArray(url);
    const href = isPost ? url[0] : replaceFields(url, imdbInfo, false);
    const onClick = event => {
      if (isPost && formEl.current) {
        event.preventDefault();
        formEl.current.submit();
      }
    };
    hooks.useEffect(() => {
      if (isPost) {
        const [postUrl, fields] = url;
        const form = document.createElement('form');
        form.action = postUrl;
        form.method = 'POST';
        form.style.display = 'none';
        form.target = openBlank ? '_blank' : '_self';
        Object.keys(fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = key;
          input.value = replaceFields(fields[key], imdbInfo, false);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        formEl.current = form;
      }
      return () => {
        if (formEl.current) {
          formEl.current.remove();
        }
      };
    });
    return [href, onClick];
  };

  const SiteLink = ({
    config,
    imdbInfo,
    site
  }) => {
    const extraAttrs = config.open_blank ? {
      target: '_blank',
      rel: 'noreferrer'
    } : {};
    const [href, onClick] = usePostLink(site.url, config.open_blank, imdbInfo);
    return preact.h("span", {
      className: css$2.linkWrapper
    }, preact.h("a", _extends({
      className: "ipc-link ipc-link--base",
      href: href,
      onClick: onClick
    }, extraAttrs), preact.h(SiteIcon, {
      site: site
    }), preact.h("span", null, site.title)), config.fetch_results ? preact.h(ResultsIndicator, {
      imdbInfo: imdbInfo,
      site: site
    }) : null);
  };

  var css_248z$1 = ".LinkList_linkList__beWAL {\n  line-height: 1.6;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 16px;\n}\n\n.LinkList_h4__OVHW- {\n  margin: 16px 0 12px 0;\n  color: #2c3e50;\n  font-size: 16px;\n  font-weight: 600;\n  border-left: 4px solid #667eea;\n  padding-left: 12px;\n  background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, transparent 100%);\n  padding: 8px 0 8px 12px;\n  border-radius: 0 6px 6px 0;\n}\n\n.LinkList_h4__OVHW-:first-child {\n  margin-top: 8px;\n}\n";
  var css$1 = {"linkList":"LinkList_linkList__beWAL","h4":"LinkList_h4__OVHW-"};
  styleInject(css_248z$1);

  const LinkList = ({
    config,
    imdbInfo,
    sites
  }) => Object.entries(CATEGORIES).map(([category, categoryName]) => {
    const catSites = sites.filter(site => site.category === category && config.enabled_sites.includes(site.id));
    if (!catSites.length) {
      return null;
    }
    const caption = config.show_category_captions ? preact.h("h4", {
      className: css$1.h4
    }, categoryName) : null;
    return preact.h(preact.Fragment, null, caption, preact.h("div", {
      className: css$1.linkList
    }, catSites.map((site, i) => preact.h(SiteLink, {
      config: config,
      imdbInfo: imdbInfo,
      site: site,
      key: site.id
    }))));
  });

  var css_248z = ".App_configWrapper__bVP2M {\n  position: absolute;\n  right: 20px;\n  top: 20px;\n}\n\n  .App_configWrapper__bVP2M > button {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n    outline: none;\n    padding: 12px;\n    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);\n    transition: all 0.2s ease;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n  .App_configWrapper__bVP2M > button:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);\n    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);\n}\n\n  .App_configWrapper__bVP2M > button > img {\n      filter: brightness(0) invert(1);\n      opacity: 0.9;\n}\n";
  var css = {"configWrapper":"App_configWrapper__bVP2M"};
  styleInject(css_248z);

  // Note: GM.* only work in async functions
  const restoreConfig = async () => JSON.parse(await GM.getValue(GM_CONFIG_KEY));
  const saveConfig = async config => GM.setValue(GM_CONFIG_KEY, JSON.stringify(config));
  const useConfig = () => {
    const [config, setConfig] = hooks.useState();
    hooks.useEffect(() => {
      restoreConfig().then(c => setConfig(c)).catch(() => setConfig(DEFAULT_CONFIG));
    }, []);
    hooks.useEffect(() => {
      if (config) {
        saveConfig(config);
      }
    }, [config]);
    return {
      config,
      setConfig
    };
  };

  const loadSites = () => new Promise((resolve, reject) => GM.xmlHttpRequest({
    method: 'GET',
    url: SITES_URL,
    nocache: true,
    onload({
      response,
      status,
      statusText
    }) {
      if (status === 200) {
        try {
          resolve(JSON.parse(response).sort((a, b) => a.title.localeCompare(b.title)));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`LTA: Could not load sites (URL=${SITES_URL}): ${status} ${statusText}`));
      }
    },
    onerror({
      status,
      statusText
    }) {
      reject(new Error(`LTA: Could not load sites (URL=${SITES_URL}): ${status} ${statusText}`));
    }
  }));
  const useSites = () => {
    const [sites, setSites] = hooks.useState([]);
    hooks.useEffect(() => {
      loadSites().then(s => setSites(s)).catch(err => setSites(err.message));
    }, []);
    return sites;
  };

  const App = ({
    imdbInfo
  }) => {
    const {
      config,
      setConfig
    } = useConfig();
    const sites = useSites();
    const [showConfig, setShowConfig] = hooks.useState(false);
    hooks.useEffect(() => {
      if (config && config.first_run) {
        setShowConfig(true);
        setConfig(prev => ({
          ...prev,
          first_run: false
        }));
      }
    }, [config]);
    if (typeof sites === 'string') {
      return sites; // Display error message
    }
    if (!config || !sites.length) {
      return null;
    }
    return preact.h(preact.Fragment, null, imdbInfo.layout === 'legacy' ? preact.h("hr", null) : null, preact.h("div", {
      className: css.configWrapper
    }, preact.h("button", {
      onClick: () => setShowConfig(cur => !cur),
      title: "Configure",
      type: "button"
    }, preact.h(Icon, {
      type: "cog"
    })), preact.h(Config, {
      config: config,
      layout: imdbInfo.layout,
      setConfig: setConfig,
      setShow: setShowConfig,
      sites: sites,
      show: showConfig
    })), preact.h(LinkList, {
      config: config,
      imdbInfo: imdbInfo,
      sites: sites
    }));
  };

  const divId = '__LTA__';
  const detectLayout = mUrl => {
    // Currently there seem to be 3 different IMDb layouts:
    // 1) "legacy": URL ends with '/reference'
    if (['reference', 'combined'].includes(mUrl[2])) {
      return ['legacy', 'h3[itemprop=name]', '.titlereference-section-overview > *:last-child'];
    }
    // 2) "redesign2020": Redesign 2020
    //    https://www.imdb.com/preferences/beta-control?e=tmd&t=in&u=/title/tt0163978/
    if (document.querySelector('main section > .ipc-page-content-container')) {
      return ['redesign2020', 'title', 'main > * > section > div'];
    }
    // 3) "new": The old default (has been around for many years)
    return ['new', 'h1', '.title-overview'];
  };
  const parseImdbInfo = () => {
    // TODO: extract type (TV show, movie, ...)

    // Parse IMDb number and layout
    const mUrl = /^\/(?:[a-z]{2}\/)?title\/tt([0-9]{7,8})(?:\/([a-z]*))?/.exec(window.location.pathname);
    if (!mUrl) {
      throw new Error('LTA: Could not parse IMDb URL!');
    }
    const [layout, titleSelector, containerSelector] = detectLayout(mUrl);
    const info = {
      id: mUrl[1],
      layout
    };
    info.title = document.querySelector(titleSelector).innerText.trim();
    const mTitle = /^(.+)\s+\((\d+)\)/.exec(info.title);
    if (mTitle) {
      info.title = mTitle[1].trim();
      info.year = parseInt(mTitle[2].trim(), 10);
    }
    return [info, containerSelector];
  };
  const [imdbInfo, containerSelector] = parseImdbInfo();
  const injectAndStart = () => {
    let injectionEl = document.querySelector(containerSelector);
    if (!injectionEl) {
      throw new Error('LTA: Could not find target container!');
    }
    const container = document.createElement('div');
    container.id = divId;
    container.style.position = 'relative';
    if (imdbInfo.layout === 'redesign2020') {
      container.className = 'ipc-page-content-container ipc-page-content-container--center';
      container.style.backgroundColor = 'white';
      container.style.padding = '0 var(--ipt-pageMargin)';
      container.style.minHeight = '50px';
      injectionEl.prepend(container);
    } else {
      container.classList.add('article');
      injectionEl.appendChild(container);
    }
    preact.render(preact.h(App, {
      imdbInfo: imdbInfo
    }), container);
  };
  const containerWatchdog = () => {
    const container = document.querySelector(`#${divId}`);
    if (container === null) {
      injectAndStart();
    }
    window.setTimeout(containerWatchdog, 1000);
  };
  window.setTimeout(containerWatchdog, 500);

})(preact, preactHooks);