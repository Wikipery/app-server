require('dotenv').config();
const config = require("./db/config.js");

const express = require('express');
const axios = require('axios');
const app = express();
const SERVER_PORT = process.env.SERVICE_PORT;

app.get('/', (req, res) => {
    res.send("server is up");
});

// Fetch main Wikipedia summary
async function getWikipediaIntro(title) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        const test = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(title)}`);

        // const options = response.data.pages
        console.log("Full response data:", test.data);

        if (response.data.type === 'disambiguation') {
            return { summary: null, isDisambiguation: true };
        }
        // If summary exists, add it to config and return the extract
        if (response.data.extract) {
            config.addContent(response.data.title, response.data.extract);
            return { summary: response.data.extract, isDisambiguation: false };

        }
        return { summary: null, isDisambiguation: false };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { summary: null, isDisambiguation: false };
    }
}

// Fetch related articles for disambiguation pages
async function getWikipediaRelatedPages(title) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(title)}`);

        // Map through related pages to create an array with titles and URLs
        const options = response.data.pages.map(page => ({
            title: page.title,
            summary: page.extract,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
        }));

        // // Log each title and URL
        // options.forEach(option => {
        //     console.log("Title:", option.title, "URL:", option.url);
        // });

        return options;
    } catch (error) {
        console.error('Error fetching related pages:', error);
        return null;
    }
}

// Route to handle Wikipedia summary or disambiguation
app.get('/wikipedia/:title', async (req, res) => {
    const title = req.params.title;

    // Attempt to fetch the main article summary
    const intro = await getWikipediaIntro(title);

    if (intro.isDisambiguation) {
        // If it's a disambiguation page, fetch related options
        const options = await getWikipediaRelatedPages(title);

        if (options) {
            res.json({ options });
        } else {
            res.status(404).json({ message: 'No options found for the given term.' });
        }
    } else if (intro.summary) {
        // If a summary exists, send it directly
        res.json({ intro: intro.summary });
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port: ${SERVER_PORT}`);
});
