const contentDb = [];

function addContent(title, summary) {
    contentDb[title] = summary;


    console.log("contentDb: ", contentDb);
}

module.exports = { addContent, contentDb }