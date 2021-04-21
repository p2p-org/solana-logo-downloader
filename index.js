const tokens = require('./tokens.json').tokens;
const async = require("async");
const get = require("async-get-file");
const fs = require('fs');

const logoDir = "./logos/"

// download function
async function downloadImage(url, symbol) {
    var options = {
        directory: logoDir,
        filename: symbol + ".png"
    }
    await get(url, options);
}

// loop throw tokens list and download
async function downloadImages() {
    for (const index in tokens) {
        let token = tokens[index];
        let url = token.logoURI;

        if (url) {
            try {
                if (fs.existsSync(logoDir + token.symbol + ".png")) {
                    //file exists, skip
                    continue;
                }
            } catch(err) {
                // console.error(err)
            }

            console.log("Downloading image for " + token.symbol);
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
