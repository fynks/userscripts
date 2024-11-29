// ==UserScript==
// @name             IMDb Mod
// @description      Adds torrent search and Youtube trailer buttons to IMDb movie pages
// @author           Fynks
// @version          1.0.2
// @grant            none
// @namespace        https://github.com/fynks/userscripts
// @match            https://www.imdb.com/*
// @icon             https://www.imdb.com/favicon.ico
// @updateURL        https://github.com/fynks/userscripts/raw/refs/heads/main/imdb/imdb-mod.user.js
// @updateURL        https://github.com/fynks/userscripts/raw/refs/heads/main/imdb/imdb-mod-enhanced.user.js
// @downloadURL      https://github.com/fynks/userscripts/raw/refs/heads/main/imdb/imdb-mod-enhanced.user.js
// @license          MIT
// @supportURL       https://github.com/fynks/userscripts/issues
// ==/UserScript==

(function() {
    'use strict';

    // Utility functions
    const Utils = {
        // Sanitize search query
        sanitizeSearchQuery(query) {
            return query
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
        },

        // Create accessible button
        createButton(options) {
            const {
                id,
                text,
                onClick,
                title = '',
                className = 'custom-button'
            } = options;

            const button = document.createElement('button');
            button.id = id;
            button.innerHTML = text;
            button.className = className;
            button.setAttribute('aria-label', title || text);
            button.setAttribute('role', 'button');
            button.setAttribute('tabindex', '0');

            // Add click and keyboard event handling
            button.addEventListener('click', onClick);
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            });

            return button;
        },

        // Debounce function to limit rapid repeated calls
        debounce(func, wait = 100) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Movie information extractor
    const MovieInfo = {
        // Get movie ID from URL
        getMovieId() {
            const pathSegments = window.location.pathname.split('/');
            return pathSegments.find(segment =>
                segment.startsWith('tt') || segment.startsWith('TT')
            );
        },

        // Get movie title
        getMovieTitle() {
            const titleElement = document.querySelector('.hero__primary-text[data-testid="hero__primary-text"]');
            return titleElement ? titleElement.textContent.trim() : null;
        }
    };

    // Search engines configuration
    const SearchEngines = [
        {
            name: 'TGx',
            urlTemplate: (movieId, title) =>
                `https://torrentgalaxy.to/torrents.php?search=${encodeURIComponent(title)}&nox=1&sort=seeders&order=desc`
        },
        {
            name: 'YTS.mx',
            urlTemplate: (movieId, title) =>
                `https://yts.mx/browse-movies/${encodeURIComponent(title)}`
        },
        {
            name: 'YouTube',
            urlTemplate: (movieId, title) =>
                `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+Trailer`
        }
    ];

    // Main script manager
    class IMDbModManager {
        // Observe DOM for page load
        observePageLoad() {
            const observer = new MutationObserver(
                Utils.debounce(() => {
                    const titleElement = document.querySelector('.hoBFcD');
                    if (titleElement) {
                        this.injectButtons();
                        observer.disconnect();
                    }
                })
            );

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Inject search buttons
        injectButtons() {
            const titleElement = document.querySelector('.hoBFcD');
            if (!titleElement) return;

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('imdb-mod-button-container');

            // Get movie information
            const movieId = MovieInfo.getMovieId();
            const movieTitle = MovieInfo.getMovieTitle();

            if (!movieTitle) return;

            // Generate and append buttons
            SearchEngines.forEach(engine => {
                const button = Utils.createButton({
                    id: `${engine.name.toLowerCase().replace(/\s+/g, '-')}-search-btn`,
                    text: engine.name,
                    onClick: () => window.open(
                        engine.urlTemplate(movieId, movieTitle),
                        '_blank'
                    ),
                    title: `Search ${engine.name} for this movie`
                });
                buttonContainer.appendChild(button);
            });

            // Insert button container
            titleElement.parentNode.insertBefore(buttonContainer, titleElement);
        }

        // Inject custom styles
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .imdb-mod-button-container {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    flex-wrap: wrap;
                }
                .custom-button {
                    display: inline-block;
                    margin-right: 0.25rem;
                    margin-bottom: 0.25rem;
                    background-color: rgba(100, 100, 100, 0.1);
                    color: #fff;
                    border: 1px solid rgba(150, 150, 150, 0.3);
                    border-radius: 0.75rem;
                    padding: 0.15rem 0.5rem;
                    font-size: 0.8rem;
                    font-family: Arial, sans-serif;
                    cursor: pointer;
                    transition: background-color 0.2s, border-color 0.2s;
                }
                .custom-button:hover {
                    background-color: rgba(150, 150, 150, 0.2);
                }
            `;
            document.head.appendChild(style);
        }

        // Initialize the script
        init() {
            this.injectStyles();
            this.observePageLoad();
        }
    }

    // Run the script
    const imdbMod = new IMDbModManager();
    imdbMod.init();
})();
