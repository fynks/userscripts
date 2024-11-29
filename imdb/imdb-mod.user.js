// ==UserScript==
// @name             IMDb Mod
// @description      Adds torrent search and Youtube trailer buttons to IMDb movie pages
// @namespace        Fynks
// @version          1.0.0
// @grant            none
// @license          MIT
// @match            https://www.imdb.com/*
// @icon             https://www.imdb.com/favicon.ico
// @updateURL        https://raw.githubusercontent.com/Fynks/userscripts/main/imdb-mod.user.js

// ==/UserScript==

(function() {
    'use strict';

    // Configuration options
    const config = {
        enableTGxButton: true,
        enableYouTubeButton: true,
        enableYTSButton: true
    };

    // Function to create a button with the specified properties
    function createButton(id, innerHTML, clickHandler) {
        const button = document.createElement('button');
        button.id = id;
        button.innerHTML = innerHTML;
        button.className = 'custom-button';
        button.setAttribute('aria-label', innerHTML);
        button.addEventListener('click', clickHandler);
        return button;
    }

    // Function to get movie ID for TGx search
    function getMovieId() {
        const pathSegments = window.location.pathname.split('/');
        return pathSegments.find(segment => segment.startsWith('tt') || segment.startsWith('TT'));
    }

    // Function to get movie title
    function getMovieTitle() {
        const titleElement = document.querySelector('.hero__primary-text[data-testid="hero__primary-text"]');
        return titleElement ? titleElement.textContent : null;
    }

    // Function to add buttons
    function addButtons() {
        const titleElement = document.querySelector('.hoBFcD');
        if (!titleElement) return;

        const buttonContainer = document.createElement('div');

        // Create TGx search button
        const movieId = getMovieId();
        if (config.enableTGxButton && movieId) {
            const tgxButton = createButton('TGxSearchButton', 'TGx Search', () => {
                const searchURL = `https://torrentgalaxy.to/torrents.php?search=${movieId}&nox=1&sort=seeders&order=desc`;
                window.open(searchURL, '_blank');
            });
            buttonContainer.appendChild(tgxButton);
        }

        // Create YouTube search button
        const movieTitle = getMovieTitle();
        if (config.enableYouTubeButton && movieTitle) {
            const formattedTitle = movieTitle.split(' ').join('+') + '+Trailer';
            const youtubeButton = createButton('YouTubeSearchButton', 'YouTube', () => {
                const searchURL = `https://www.youtube.com/results?search_query=${formattedTitle}`;
                window.open(searchURL, '_blank');
            });
            buttonContainer.appendChild(youtubeButton);
        }

        // Create YTS.mx search button
        if (config.enableYTSButton && movieId) {
            const ytsButton = createButton('YTSmxSearchButton', 'YTS.mx', () => {
                const searchURL = `https://yts.mx/browse-movies/${movieId}`;
                window.open(searchURL, '_blank');
            });
            buttonContainer.appendChild(ytsButton);
        }

        // Insert the button container above the title element
        titleElement.parentNode.insertBefore(buttonContainer, titleElement);
    }

    // Function to observe changes in the DOM with debouncing
    function observeDOMChanges() {
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (document.querySelector('.hoBFcD')) {
                    observer.disconnect();
                    addButtons();
                }
            }, 100);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
        .custom-button {
            display: inline-block;
            margin-right: 0.5rem;
            background-color: rgba(100, 100, 100, 0.0);
            color: #fff;
            border: 0.5px solid rgba(150, 150, 150, 0.6);
            border-radius: 1rem;
            padding: .18rem .75rem;
            font-size: .875rem;
            font-family: Arial, sans-serif;
            cursor: pointer;
            transition: background-color 0.3s, border-color 0.3s;
        }
        .custom-button:hover {
            background-color: rgba(150, 150, 150, 0.32);
        }
    `;
    document.head.appendChild(style);

    observeDOMChanges();
})();
