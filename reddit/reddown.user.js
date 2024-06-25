// ==UserScript==
// @name         Reddit Saved Posts Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fetch and display Reddit saved posts with options to download links and search titles
// @author       fynks
// @match        https://www.reddit.com/user/*/saved/
// @grant        none
// ==/UserScript==

(async function() {
    const username = "YOUR_USER_NAME";
    const redditSavedUrl = `https://www.reddit.com/user/${username}/saved.json`;

    try {
        const savedPosts = await fetchAllSavedPosts(redditSavedUrl);
        renderTable(savedPosts);
    } catch (error) {
        console.error("Error fetching or rendering saved posts:", error);
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    async function fetchAllSavedPosts(url) {
        const posts = [];
        let after = null;
        do {
            const fetchUrl = after ? `${url}?after=${after}` : url;
            console.log(`Fetching URL: ${fetchUrl}`);
            const response = await fetchData(fetchUrl);
            const extractedPosts = extractPosts(response);
            posts.push(...extractedPosts);
            after = response.data.after;
        } while (after);
        return posts;
    }

    function extractPosts(data) {
        return data.data.children.filter(item => item.kind === "t3").map(item => ({
            title: item.data.title,
            permalink: `https://www.reddit.com${item.data.permalink}`
        }));
    }

    function renderTable(posts) {
        const table = createTable(posts);
        const exportButton = createExportButton(posts);
        const searchInput = createSearchInput(table);
        displayTable(table, searchInput, exportButton);
    }

    function createTable(posts) {
        const table = document.createElement("table");
        table.classList.add("reddit-posts-table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.appendChild(createCell("th", "Title"));
        headerRow.appendChild(createCell("th", "Actions"));
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        posts.forEach(post => {
            const row = document.createElement("tr");
            row.appendChild(createCell("td", post.title));

            const actionsCell = document.createElement("td");
            actionsCell.appendChild(createLink("Post", post.permalink, "_blank", "post-link"));
            actionsCell.appendChild(document.createTextNode(" | "));
            actionsCell.appendChild(createLink("Download", getDownloadUrl(post.permalink), "_blank", "download-link"));
            row.appendChild(actionsCell);

            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }

    function createCell(type, textContent) {
        const cell = document.createElement(type);
        cell.textContent = textContent;
        return cell;
    }

    function createLink(text, href, target, className) {
        const link = document.createElement("a");
        link.textContent = text;
        link.href = href;
        link.target = target;
        link.classList.add(className);
        return link;
    }

    function createSearchInput(table) {
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search by title";
        searchInput.classList.add("search-input");
        searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            table.querySelectorAll("tbody tr").forEach(row => {
                const title = row.querySelector("td:first-child").textContent.toLowerCase();
                row.style.display = title.includes(searchTerm) ? "" : "none";
            });
        });
        return searchInput;
    }

    function createExportButton(posts) {
        const exportButton = document.createElement("button");
        exportButton.textContent = "Export";
        exportButton.addEventListener("click", function() {
            exportToTxt(posts);
        });
        return exportButton;
    }

    function displayTable(table, searchInput, exportButton) {
        const tableContainer = document.createElement("div");
        tableContainer.classList.add("reddit-table-container");
        tableContainer.appendChild(searchInput);
        tableContainer.appendChild(table);
        tableContainer.appendChild(exportButton);

        const newTab = window.open("");
        newTab.document.body.innerHTML = "";
        newTab.document.body.appendChild(tableContainer);

        const style = newTab.document.createElement("style");
        style.textContent = `
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            .reddit-table-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ccc;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .reddit-posts-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            .reddit-posts-table th, .reddit-posts-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            .search-input {
                width: 100%;
                padding: 8px;
                margin-bottom: 10px;
                box-sizing: border-box;
            }
            .post-link, .download-link {
                margin-right: 5px;
            }
        `;
        newTab.document.head.appendChild(style);
    }

    function getDownloadUrl(permalink) {
        const urlWithoutDomain = permalink.replace("https://www.reddit.com", "");
        return `https://rapidsave.com${urlWithoutDomain}`;
    }

    function exportToTxt(posts) {
        const urls = posts.map(post => getDownloadUrl(post.permalink)).join("\n");
        const blob = new Blob([urls], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reddit_saved_urls.txt";
        a.click();
        URL.revokeObjectURL(url);
    }
})();
