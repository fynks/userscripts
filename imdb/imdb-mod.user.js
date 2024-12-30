// ==UserScript==
// @name             IMDb Mod
// @description      Adds customizable search buttons for torrents and trailers to IMDb pages
// @author           Fynks
// @version          2.1.0
// @grant            GM_setValue
// @grant            GM_getValue
// @grant            GM_registerMenuCommand
// @namespace        https://github.com/fynks/userscripts
// @match            https://www.imdb.com/title/*
// @icon             https://www.imdb.com/favicon.ico
// @license          MIT
// ==/UserScript==

// Configuration management with persistence
const Config = {
    DEFAULT_SETTINGS: {
        searchEngines: [
            {
                name: 'TGx',
                enabled: true,
                urlTemplate: (title) =>
                    `https://torrentgalaxy.to/torrents.php?search=${encodeURIComponent(title)}&nox=1&sort=seeders&order=desc`
            },
            {
                name: 'YTS',
                enabled: true,
                urlTemplate: (title) =>
                    `https://yts.mx/browse-movies/${encodeURIComponent(title)}`
            },
            {
                name: 'YouTube',
                enabled: true,
                urlTemplate: (title) =>
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+Trailer`
            }
        ],
        buttonStyle: {
            backgroundColor: 'rgba(100, 100, 100, 0.1)',
            color: '#fff',
            hoverColor: 'rgba(150, 150, 150, 0.2)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem'
        },
        useCache: true,
        cacheExpiration: 3600000 // 1 hour
    },

    getSettings() {
        return {
            ...this.DEFAULT_SETTINGS,
            ...GM_getValue('imdbModSettings', {})
        };
    },

    saveSettings(settings) {
        GM_setValue('imdbModSettings', settings);
    }
}

// UI Components
class UI {
    static createButton({ id, text, icon, onClick, className = 'imdb-mod-button' }) {
        const button = document.createElement('button');
        button.id = id;
        button.className = className;
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');

        if (Config.getSettings().showIcons && icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'button-icon';
            iconSpan.textContent = icon;
            button.appendChild(iconSpan);
        }

        const textSpan = document.createElement('span');
        textSpan.className = 'button-text';
        textSpan.textContent = text;
        button.appendChild(textSpan);

        this.attachButtonEvents(button, onClick);
        return button;
    }

    static attachButtonEvents(button, onClick) {
        const events = ['click', 'keydown'];
        const handler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                onClick(e);
            }
        };

        events.forEach(event => button.addEventListener(event, handler));
    }

    static injectStyles() {
        const settings = Config.getSettings();
        const style = document.createElement('style');
        style.textContent = `
            .imdb-mod-container {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
}

.imdb-mod-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: rgba(37, 37, 37, 0.9);
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    text-decoration: none;
    line-height: 1.5;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.imdb-mod-button:hover {
    background-color: rgba(45, 45, 45, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.imdb-mod-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.imdb-mod-button .button-icon {
    font-size: 1rem;
    line-height: 1;
}

@media (max-width: 768px) {
    .imdb-mod-container {
        flex-direction: row;
        gap: 0.5rem;
    }

    .imdb-mod-button {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
    }
}
        `;
        document.head.appendChild(style);
    }
}

// Main script manager
class IMDbModManager {
    constructor() {
        this.cache = new MovieCache();
        this.initialized = false;
    }

    async init() {
        try {
            this.registerSettingsMenu();
            await this.waitForElement('[data-testid="hero__primary-text"]');
            UI.injectStyles();

            const movieData = await MovieInfo.getMovieData();
            this.injectButtons(movieData);

            this.initialized = true;
        } catch (error) {
            console.error('IMDb Mod initialization failed:', error);
        }
    }

    registerSettingsMenu() {
        GM_registerMenuCommand('Configure IMDb Mod', () => {
            const settings = Config.getSettings();
            settings.showIcons = !settings.showIcons;
            Config.saveSettings(settings);
            location.reload();
        });
    }

    async waitForElement(selector, timeout = 5000) {
        const element = document.querySelector(selector);
        if (element) return element;

        return new Promise((resolve, reject) => {
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    injectButtons(movieData) {
        const settings = Config.getSettings();
        const container = document.createElement('div');
        container.className = 'imdb-mod-container';

        settings.searchEngines
            .filter(engine => engine.enabled)
            .forEach(engine => {
                const button = UI.createButton({
                    id: `${engine.name.toLowerCase()}-search-btn`,
                    text: engine.name,
                    icon: engine.icon,
                    onClick: () => window.open(engine.urlTemplate(movieData.title), '_blank')
                });
                container.appendChild(button);
            });

        const titleElement = document.querySelector('[data-testid="hero__primary-text"]');
        if (titleElement && titleElement.parentNode) {
            titleElement.parentNode.insertBefore(container, titleElement.nextSibling);
        }
    }
}

// Movie information extractor
const MovieInfo = {
    getMovieId() {
        const pathSegments = window.location.pathname.split('/');
        return pathSegments.find(segment =>
            segment.startsWith('tt') || segment.startsWith('TT')
        );
    },

    getMovieTitle() {
        const titleElement = document.querySelector('.hero__primary-text[data-testid="hero__primary-text"]');
        return titleElement ? titleElement.textContent.trim() : null;
    },

    async getMovieData() {
        const id = this.getMovieId();
        const title = this.getMovieTitle();
        if (!id || !title) throw new Error('Movie information not found');
        return { id, title };
    }
};

// Cache management
class MovieCache {
    constructor() {
        this.CACHE_KEY = 'imdbModCache';
    }

    get() {
        return GM_getValue(this.CACHE_KEY, {});
    }

    set(key, value) {
        const cache = this.get();
        cache[key] = {
            value,
            timestamp: Date.now()
        };
        GM_setValue(this.CACHE_KEY, cache);
    }

    get(key) {
        const cache = this.get();
        const entry = cache[key];

        if (!entry) return null;

        const settings = Config.getSettings();
        if (Date.now() - entry.timestamp > settings.cacheExpiration) {
            delete cache[key];
            GM_setValue(this.CACHE_KEY, cache);
            return null;
        }

        return entry.value;
    }

    clear() {
        GM_setValue(this.CACHE_KEY, {});
    }
}

// Initialize the script
(async () => {
    const imdbMod = new IMDbModManager();
    await imdbMod.init();
})();
