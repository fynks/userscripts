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

  const { createElement: h, Fragment, render } = preact;
  const { useState, useEffect, useRef } = hooks;

  // Configuration
  const VERSION = "3.0.0";
  const SITES_URL = 'https://raw.githubusercontent.com/fynks/userscripts/refs/heads/main/imdb/imdb-multi.json';
  const GM_CONFIG_KEY = 'config';

  const DEFAULT_CONFIG = {
    enabled_sites: [],
    fetch_results: true,
    first_run: true,
    open_blank: true,
    show_category_captions: true
  };

  const CATEGORIES = {
    search: 'Search',
    movie_site: 'Movie Sites',
    pub_tracker: 'Public Trackers',
    filehoster: 'File Hosts',
    subtitles: 'Subtitles'
  };

  const FETCH_STATE = {
    LOADING: 0,
    NO_RESULTS: 1,
    RESULTS_FOUND: 2,
    NO_ACCESS: 3,
    TIMEOUT: 4,
    ERROR: 5
  };




  // Utility functions
  const replaceFields = (str, { id, title, year }, encode = true) =>
    str.replace(/{{IMDB_TITLE}}/g, encode ? encodeURIComponent(title) : title)
      .replace(/{{IMDB_ID}}/g, id)
      .replace(/{{IMDB_YEAR}}/g, year);

  // Modern CSS injection
  const createStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
        .lta-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 24px 0;
          position: relative;
        }
  
      .lta-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .lta-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .lta-settings-btn {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #374151;
        transition: all 0.2s ease;
      }

      .lta-settings-btn:hover {
        background: #e5e7eb;
        border-color: #9ca3af;
      }

      .lta-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .lta-modal.show {
        opacity: 1;
        pointer-events: auto;
      }

      .lta-modal-content {
        background: white;
        border-radius: 12px;
        width: 90vw;
        max-width: 800px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transform: scale(0.95);
        transition: transform 0.2s ease;
      }

      .lta-modal.show .lta-modal-content {
        transform: scale(1);
      }

      .lta-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f9fafb;
      }

      .lta-modal-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .lta-close-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        color: #6b7280;
        transition: all 0.2s ease;
      }

      .lta-close-btn:hover {
        background: #e5e7eb;
        color: #374151;
      }

      .lta-modal-body {
        padding: 24px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .lta-search {
        position: relative;
        margin-bottom: 20px;
      }

      .lta-search input {
        width: 100%;
        padding: 12px 16px 12px 44px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .lta-search input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .lta-search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
      }

      .lta-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 24px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
      }

      .lta-option {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #374151;
      }

      .lta-option input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
      }

      .lta-category {
        margin-bottom: 24px;
      }

      .lta-category-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 12px 0;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .lta-sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
      }

      .lta-site-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;
      }

      .lta-site-item:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
      }

      .lta-site-item.selected {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .lta-site-item input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
      }

      .lta-site-icon {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .lta-site-title {
        font-size: 13px;
        color: #374151;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .lta-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .lta-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        text-decoration: none;
        color: #374151;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .lta-link:hover {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .lta-link:visited {
        color: #374151;
      }

      .lta-link:visited:hover {
        color: white;
      }

      .lta-link img {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }

      .lta-status-icon {
        margin-left: 4px;
        display: inline-flex;
        align-items: center;
      }

      .lta-status-icon.loading {
        animation: spin 1s linear infinite;
      }

      .lta-status-icon.success {
        color: #10b981;
      }

      .lta-status-icon.error {
        color: #ef4444;
      }

      .lta-status-icon.warning {
        color: #f59e0b;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .lta-modal-footer {
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f9fafb;
      }

      .lta-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .lta-btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .lta-btn-primary:hover {
        background: #2563eb;
        border-color: #2563eb;
      }

      .lta-btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border-color: #d1d5db;
      }

      .lta-btn-secondary:hover {
        background: #e5e7eb;
        border-color: #9ca3af;
      }

      .lta-no-sites {
        text-align: center;
        padding: 20px;
        color: #6b7280;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  };

  // Icon component using inline SVG
  const Icon = ({ name, className = '', ...props }) => {
    const svgMap = {
      settings: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [
          h('circle', { cx: 12, cy: 12, r: 3 }),
          h('path', { d: 'M12 1v6m0 6v6m11-7h-6m-6 0H1' })
        ]
      ),
      close: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [h('path', { d: 'M18 6L6 18M6 6l12 12' })]
      ),
      search: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [
          h('circle', { cx: 11, cy: 11, r: 8 }),
          h('path', { d: 'm21 21-4.35-4.35' })
        ]
      ),
      check: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [h('polyline', { points: '20,6 9,17 4,12' })]
      ),
      x: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [h('path', { d: 'M18 6L6 18M6 6l12 12' })]
      ),
      loader: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [h('path', { d: 'M21 12a9 9 0 11-6.219-8.56' })]
      ),
      lock: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [
          h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }),
          h('circle', { cx: 12, cy: 7, r: 4 })
        ]
      ),
      alert: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [
          h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
          h('path', { d: 'M12 9v4m0 4h.01' })
        ]
      ),
      cog: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        [
          h('circle', { cx: 12, cy: 12, r: 3 }),
          h('path', { d: 'M12 1v6m0 6v6m11-7h-6m-6 0H1' })
        ]
      )
    };

    const svg = svgMap[name];
    if (!svg) return null;

    return h('span', {
      className: `lta-icon ${className}`,
      style: { display: 'inline-flex', alignItems: 'center' },
      ...props
    }, svg);
  };




  // Configuration hooks
  const useConfig = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
      const loadConfig = async () => {
        try {
          const saved = await GM.getValue(GM_CONFIG_KEY);
          setConfig(saved ? JSON.parse(saved) : DEFAULT_CONFIG);
        } catch (e) {
          setConfig(DEFAULT_CONFIG);
        }
      };
      loadConfig();
    }, []);

    const saveConfig = async (newConfig) => {
      await GM.setValue(GM_CONFIG_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    };

    return { config, setConfig: saveConfig };
  };

  // Sites loading hook
  const useSites = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadSites = () => {
        GM.xmlHttpRequest({
          method: 'GET',
          url: SITES_URL,
          nocache: true,
          onload: ({ response, status }) => {
            if (status === 200) {
              try {
                const sitesData = JSON.parse(response);
                setSites(sitesData.sort((a, b) => a.title.localeCompare(b.title)));
              } catch (e) {
                console.error('Failed to parse sites data:', e);
                setSites([]);
              }
            } else {
              console.error('Failed to load sites:', status);
              setSites([]);
            }
            setLoading(false);
          },
          onerror: (error) => {
            console.error('Failed to load sites:', error);
            setSites([]);
            setLoading(false);
          }
        });
      };

      loadSites();
    }, []);

    return { sites, loading };
  };

  // Response checking function (from original)
  const checkResponse = (resp, site) => {
    if (resp.responseHeaders && resp.responseHeaders.includes('Refresh: 0; url=')) {
      return FETCH_STATE.NO_ACCESS;
    }

    if (!resp.responseText) {
      return FETCH_STATE.ERROR;
    }

    if (resp.responseText.includes('The blog that you are about to view may contain content only suitable for adults.')) {
      return FETCH_STATE.NO_ACCESS;
    }

    if (resp.responseText.includes('Checking your browser before accessing')) {
      return FETCH_STATE.NO_ACCESS;
    }

    if (site.noAccessMatcher) {
      const matchers = Array.isArray(site.noAccessMatcher) ? site.noAccessMatcher : [site.noAccessMatcher];
      if (matchers.some(matcher => resp.responseText.includes(matcher))) {
        return FETCH_STATE.NO_ACCESS;
      }
    }

    if (Array.isArray(site.noResultsMatcher)) {
      const [checkType, selector, compType, number] = site.noResultsMatcher;
      const m = resp.responseHeaders.match(/content-type:\s([^\s;]+)/);
      const contentType = m ? m[1] : 'text/html';

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(resp.responseText, contentType);

        if (checkType === 'EL_COUNT') {
          const result = doc.querySelectorAll(selector);
          if (compType === 'GT' && result.length > number) {
            return FETCH_STATE.RESULTS_FOUND;
          }
          if (compType === 'LT' && result.length < number) {
            return FETCH_STATE.RESULTS_FOUND;
          }
        }
      } catch (e) {
        console.error('Could not parse document!', e);
        return FETCH_STATE.ERROR;
      }

      return FETCH_STATE.NO_RESULTS;
    }

    if (site.noResultsMatcher) {
      const matchers = Array.isArray(site.noResultsMatcher) ? site.noResultsMatcher : [site.noResultsMatcher];
      if (matchers.some(matcher => resp.responseText.includes(matcher))) {
        return FETCH_STATE.NO_RESULTS;
      }
    }

    return FETCH_STATE.RESULTS_FOUND;
  };

  // Result fetching hook
  const useResultFetcher = (imdbInfo, site, enabled) => {
    const [fetchState, setFetchState] = useState(null);

    useEffect(() => {
      if (!enabled || !site.noResultsMatcher) {
        setFetchState(null);
        return;
      }

      let xhr;
      const { url } = site;
      const isPost = Array.isArray(url);

      const opts = {
        timeout: 20000,
        onload: (resp) => setFetchState(checkResponse(resp, site)),
        onerror: () => setFetchState(FETCH_STATE.ERROR),
        ontimeout: () => setFetchState(FETCH_STATE.TIMEOUT)
      };

      if (isPost) {
        const [postUrl, fields] = url;
        opts.method = 'POST';
        opts.url = postUrl;
        opts.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        opts.data = Object.keys(fields)
          .map(key => `${key}=${replaceFields(fields[key], imdbInfo, false)}`)
          .join('&');
      } else {
        opts.method = 'GET';
        opts.url = replaceFields(url, imdbInfo);
      }

      xhr = GM.xmlHttpRequest(opts);
      setFetchState(FETCH_STATE.LOADING);

      return () => {
        if (xhr?.abort) {
          xhr.abort();
        }
      };
    }, [imdbInfo, site, enabled]);

    return fetchState;
  };

  // Components
  const StatusIcon = ({ fetchState }) => {
    if (fetchState === null) return null;

    const iconMap = {
      [FETCH_STATE.LOADING]: { name: 'loader', className: 'loading', title: 'Loading...' },
      [FETCH_STATE.RESULTS_FOUND]: { name: 'check', className: 'success', title: 'Results found!' },
      [FETCH_STATE.NO_RESULTS]: { name: 'x', className: 'error', title: 'No results found' },
      [FETCH_STATE.NO_ACCESS]: { name: 'lock', className: 'warning', title: 'Login required' },
      [FETCH_STATE.TIMEOUT]: { name: 'alert', className: 'warning', title: 'Request timeout' },
      [FETCH_STATE.ERROR]: { name: 'alert', className: 'error', title: 'Request error' }
    };

    const iconData = iconMap[fetchState];
    if (!iconData) return null;

    return h(Icon, {
      name: iconData.name,
      className: `lta-status-icon ${iconData.className}`,
      title: iconData.title
    });
  };

  const SiteLink = ({ site, imdbInfo, config }) => {
    const fetchState = useResultFetcher(imdbInfo, site, config.fetch_results);
    const formRef = useRef();

    const isPost = Array.isArray(site.url);
    const href = isPost ? site.url[0] : replaceFields(site.url, imdbInfo, false);

    const handleClick = (e) => {
      if (isPost && formRef.current) {
        e.preventDefault();
        formRef.current.submit();
      }
    };

    useEffect(() => {
      if (isPost) {
        const [postUrl, fields] = site.url;
        const form = document.createElement('form');
        form.action = postUrl;
        form.method = 'POST';
        form.style.display = 'none';
        form.target = config.open_blank ? '_blank' : '_self';

        Object.keys(fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = replaceFields(fields[key], imdbInfo, false);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        formRef.current = form;
      }

      return () => {
        if (formRef.current) {
          formRef.current.remove();
        }
      };
    }, [isPost, site.url, config.open_blank, imdbInfo]);

    const linkProps = {
      className: 'lta-link',
      href,
      onClick: handleClick,
      ...(config.open_blank && !isPost ? { target: '_blank', rel: 'noreferrer' } : {})
    };

    return h('a', linkProps, [
      site.icon && h('img', { src: site.icon, alt: '', className: 'lta-site-icon' }),
      site.title,
      h(StatusIcon, { fetchState })
    ]);
  };

  const ConfigModal = ({ isOpen, onClose, config, onSave, sites }) => {
    const [tempConfig, setTempConfig] = useState(config);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      setTempConfig(config);
    }, [config]);

    const filteredSites = sites.filter(site =>
      site.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedSites = Object.keys(CATEGORIES).reduce((acc, category) => {
      acc[category] = filteredSites.filter(site => site.category === category);
      return acc;
    }, {});

    const handleSiteToggle = (siteId, checked) => {
      setTempConfig(prev => ({
        ...prev,
        enabled_sites: checked
          ? [...prev.enabled_sites, siteId]
          : prev.enabled_sites.filter(id => id !== siteId)
      }));
    };

    const handleOptionChange = (option, checked) => {
      setTempConfig(prev => ({ ...prev, [option]: checked }));
    };

    const handleSave = () => {
      onSave(tempConfig);
      onClose();
    };

    if (!isOpen) return null;

    return h('div', {
      className: `lta-modal ${isOpen ? 'show' : ''}`,
      onClick: (e) => e.target === e.currentTarget && onClose()
    },
      h('div', { className: 'lta-modal-content' }, [
        h('div', { className: 'lta-modal-header' }, [
          h('h2', { className: 'lta-modal-title' }, 'Link \'em All Settings'),
          h('button', {
            className: 'lta-close-btn',
            onClick: onClose
          }, h(Icon, { name: 'close' }))
        ]),
        h('div', { className: 'lta-modal-body' }, [
          h('div', { className: 'lta-search' }, [
            h(Icon, { name: 'search', className: 'lta-search-icon' }),
            h('input', {
              type: 'text',
              placeholder: 'Search sites...',
              value: searchTerm,
              onInput: (e) => setSearchTerm(e.target.value)
            })
          ]),
          h('div', { className: 'lta-options' }, [
            h('label', { className: 'lta-option' }, [
              h('input', {
                type: 'checkbox',
                checked: tempConfig.open_blank,
                onChange: (e) => handleOptionChange('open_blank', e.target.checked)
              }),
              'Open links in new tab'
            ]),
            h('label', { className: 'lta-option' }, [
              h('input', {
                type: 'checkbox',
                checked: tempConfig.fetch_results,
                onChange: (e) => handleOptionChange('fetch_results', e.target.checked)
              }),
              'Show result indicators'
            ]),
            h('label', { className: 'lta-option' }, [
              h('input', {
                type: 'checkbox',
                checked: tempConfig.show_category_captions,
                onChange: (e) => handleOptionChange('show_category_captions', e.target.checked)
              }),
              'Show category captions'
            ])
          ]),
          Object.entries(CATEGORIES).map(([categoryKey, categoryName]) => {
            const categorySites = groupedSites[categoryKey];
            if (!categorySites.length) return null;

            return h('div', { className: 'lta-category', key: categoryKey }, [
              h('h3', { className: 'lta-category-title' },
                `${categoryName} (${categorySites.length})`
              ),
              h('div', { className: 'lta-sites-grid' },
                categorySites.map(site => {
                  const isSelected = tempConfig.enabled_sites.includes(site.id);
                  return h('label', {
                    className: `lta-site-item ${isSelected ? 'selected' : ''}`,
                    key: site.id
                  }, [
                    h('input', {
                      type: 'checkbox',
                      checked: isSelected,
                      onChange: (e) => handleSiteToggle(site.id, e.target.checked)
                    }),
                    site.icon && h('img', {
                      src: site.icon,
                      alt: '',
                      className: 'lta-site-icon'
                    }),
                    h('span', { className: 'lta-site-title' }, site.title)
                  ]);
                })
              )
            ]);
          })
        ]),
        h('div', { className: 'lta-modal-footer' }, [
          h('button', {
            className: 'lta-btn lta-btn-secondary',
            onClick: onClose
          }, 'Cancel'),
          h('button', {
            className: 'lta-btn lta-btn-primary',
            onClick: handleSave
          }, 'Save')
        ])
      ])
    );
  };

  const LinkList = ({ sites, config, imdbInfo }) => {
    const enabledSites = sites.filter(site => config.enabled_sites.includes(site.id));

    if (!enabledSites.length) {
      return h('div', { className: 'lta-no-sites' },
        'No sites selected. Click settings to choose sites.'
      );
    }

    // Group by categories if captions are enabled
    if (config.show_category_captions) {
      return h('div', null,
        Object.entries(CATEGORIES).map(([category, categoryName]) => {
          const catSites = enabledSites.filter(site => site.category === category);
          if (!catSites.length) return null;

          return h('div', { key: category }, [
            h('h4', {
              style: {
                margin: '16px 0 12px 0',
                color: '#2c3e50',
                fontSize: '16px',
                fontWeight: '600',
                borderLeft: '4px solid #3b82f6',
                paddingLeft: '12px',
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%)',
                padding: '8px 0 8px 12px',
                borderRadius: '0 6px 6px 0'
              }
            }, categoryName),
            h('div', { className: 'lta-links' },
              catSites.map(site =>
                h(SiteLink, {
                  key: site.id,
                  site,
                  imdbInfo,
                  config
                })
              )
            )
          ]);
        })
      );
    }

    // Simple list without categories
    return h('div', { className: 'lta-links' },
      enabledSites.map(site =>
        h(SiteLink, {
          key: site.id,
          site,
          imdbInfo,
          config
        })
      )
    );
  };

  const App = ({ imdbInfo }) => {
    const { config, setConfig } = useConfig();
    const { sites, loading } = useSites();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
      if (config && config.first_run && sites.length > 0) {
        setIsModalOpen(true);
        setConfig({
          ...config,
          first_run: false
        });
      }
    }, [config, sites]);

    if (!config || loading) {
      return h('div', { className: 'lta-container' }, 'Loading...');
    }

    return h('div', { className: 'lta-container' }, [
      h('div', { className: 'lta-header' }, [
        h('h3', { className: 'lta-title' }, 'External Links'),
        h('button', {
          className: 'lta-settings-btn',
          onClick: () => setIsModalOpen(true)
        }, [
          h(Icon, { name: 'settings' }),
          'Settings'
        ])
      ]),
      h(LinkList, { sites, config, imdbInfo }),
      h(ConfigModal, {
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        config,
        onSave: setConfig,
        sites
      })
    ]);
  };

  // Page detection and injection (similar to original)
  const detectLayout = (mUrl) => {
    if (['reference', 'combined'].includes(mUrl[2])) {
      return ['legacy', 'h3[itemprop=name]', '.titlereference-section-overview > *:last-child'];
    }
    if (document.querySelector('main section > .ipc-page-content-container')) {
      return ['redesign2020', 'title', 'main > * > section > div'];
    }
    return ['new', 'h1', '.title-overview'];
  };

  const parseImdbInfo = () => {
    const mUrl = /^\/(?:[a-z]{2}\/)?title\/tt([0-9]{7,8})(?:\/([a-z]*))?/.exec(window.location.pathname);
    if (!mUrl) throw new Error('Could not parse IMDb URL!');

    const [layout, titleSelector, containerSelector] = detectLayout(mUrl);
    const info = { id: mUrl[1], layout };

    const titleEl = document.querySelector(titleSelector);
    if (!titleEl) throw new Error('Could not find title element');

    info.title = titleEl.textContent.trim();
    const mTitle = /^(.+)\s+\((\d+)\)/.exec(info.title);
    if (mTitle) {
      info.title = mTitle[1].trim();
      info.year = parseInt(mTitle[2].trim(), 10);
    } else {
      info.year = new Date().getFullYear();
    }

    return [info, containerSelector];
  };

  // Initialize
  const init = () => {
    createStyle();

    const inject = () => {
      try {
        const [imdbInfo, containerSelector] = parseImdbInfo();
        let container = document.querySelector(containerSelector);

        if (!container) {
          // Fallback selectors
          const fallbacks = [
            '[data-testid="hero-title-block"]',
            '.hero-title-block',
            '.title_wrapper',
            '.titleBar',
            'section[data-testid="Details"]',
            '.title-overview',
            'main',
            'body'
          ];

          for (const selector of fallbacks) {
            container = document.querySelector(selector);
            if (container) break;
          }
        }

        if (!container) {
          console.warn('LTA: Could not find suitable container');
          return;
        }

        // Remove existing instance
        const existing = document.getElementById('lta-app');
        if (existing) existing.remove();

        // Create and inject our container
        const appContainer = document.createElement('div');
        appContainer.id = 'lta-app';

        // Insert appropriately based on layout
        if (imdbInfo.layout === 'redesign2020') {
          appContainer.className = 'ipc-page-content-container ipc-page-content-container--center';
          appContainer.style.backgroundColor = 'white';
          appContainer.style.padding = '0 var(--ipt-pageMargin)';
          appContainer.style.minHeight = '50px';
          container.prepend(appContainer);
        } else if (imdbInfo.layout === 'legacy') {
          appContainer.classList.add('article');
          container.appendChild(appContainer);
        } else {
          const titleBlock = container.querySelector('h1, .title_wrapper');
          if (titleBlock && titleBlock.parentNode === container) {
            container.insertBefore(appContainer, titleBlock.nextSibling);
          } else {
            container.appendChild(appContainer);
          }
        }

        // Render the app
        render(h(App, { imdbInfo }), appContainer);

      } catch (error) {
        console.error('LTA: Failed to initialize:', error);
      }
    };

    // Wait for page to load and inject
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      setTimeout(inject, 500);
    }

    // Handle navigation for single-page app behavior (like original)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (location.pathname.includes('/title/tt')) {
          setTimeout(inject, 1000);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // Start when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(preact, preactHooks);