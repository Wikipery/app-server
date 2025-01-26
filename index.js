const cors = require('cors');
require('dotenv').config();
const config = require("./db/config.js");

const express = require('express');
const cheerio = require('cheerio');

const axios = require('axios');
const app = express();
app.use(cors());

const SERVER_PORT = process.env.SERVICE_PORT;

app.get('/', (req, res) => {
    res.send("server is up");
});


// Fetch main Wikipedia summary
async function getWikipediaIntro(title, language) {

    try {
        // Fetch HTML content of the page
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);

        // if summary isn't exict then return disambiguation
        if (response.data.type === 'disambiguation') {
            return { summary: null, isDisambiguation: true };
        }

        const firstParagraph = response.data.extract;
        // if summary is exit return it
        if (firstParagraph) {
            return { summary: firstParagraph, isDisambiguation: false }
        }

        // Select the first paragraph
        console.log("firstParagraph: ", firstParagraph);

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

        return options;
    } catch (error) {
        console.error('Error fetching related pages:', error);
        return null;
    }
}

// Route to handle Wikipedia summary or disambiguation
app.get('/wikipedia/:title', async (req, res) => {
    const title = req.params.title;
    const lang = req.query.lang;


    console.log('lang:', lang);
    console.log('title:', title);
    const language = lang;

    // Attempt to fetch the main article summary
    const intro = await getWikipediaIntro(title, language);

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















