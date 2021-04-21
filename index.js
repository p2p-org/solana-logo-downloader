const tokens = require('./tokens.json').tokens;
const async = require("async");
const get = require("async-get-file");

// download function
async function downloadImage(url, symbol) {
    var options = {
        directory: "./logos/",
        filename: symbol + ".png"
    }
    await get(url, options);
}

// loop throw tokens list and download
async function downloadImages() {
    for (const index in tokens) {
        let token = tokens[index];
        console.log("Downloading image for " + token.symbol);
        let url = token.logoURI;

        if (url) {
            try {
                await downloadImage(url, token.symbol)
            } catch (err) {
                console.log("Error downloading " + token.symbol + "'s logo with url: " + token.logoURI + ", error: " + err);
            }
        } else {
            console.log("Logo url for " + token.symbol + " is not found");
        }

    }
}

downloadImages();
