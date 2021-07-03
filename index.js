const async = require("async");
const got = require('got');
const get = require("async-get-file");
const fs = require('fs');
const path = require('path');

const assetsDir = "./logos/assets/ios"

function copyImageOnly(body, index, token, extension, directory) {
    body.tokens[index].logoURI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/"
        + token.address + "/logo." + extension;
    let newDir = "./logos/token-list/" + token.address;
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir, {recursive: true});
    }
    fs.copyFile(directory + "/logo." + extension, newDir + "/logo." + extension, function (err) {
        if (err) {console.log("Error copying file: " + err);}
    });
}

// loop throw tokens list and download
async function downloadImages() {
    const response = await got('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json');
    let body = JSON.parse(response.body);
    let tokens = body.tokens;

    for (const index in tokens) {
        let token = tokens[index];
        let url = token.logoURI;

        if (!url) {
            console.log("Logo url for " + token.symbol + " is not found");
            continue;
        }

        // get filename
        const directory = assetsDir + "/" + token.address + ".imageset";
        let extension = "png";

        // check if file exists
        try {
            let fileExists = false;
            if (fs.existsSync(directory + "/logo.png")) {
                extension = "png";
                fileExists = true;
            }
            if (fs.existsSync(directory + "/logo.svg")) {
                extension = "svg"
                fileExists = true;
            }

            if (fileExists) {
                //file exists, skip
                copyImageOnly(body, index, token, extension, directory);
                continue;
            }
        } catch(err) {
            console.error(err);
        }

        // modify extension
        if (url.endsWith(".svg")) {
            extension = "svg";
        }

        const filename = "logo." + extension
        const fileURL = directory + "/" + filename;

        // download
        try {
            console.log("Downloading logo for " + token.symbol);
            await get(url, {
                directory: directory,
                filename: filename
            });

            // add Content.json
            let content = JSON.parse("{\"images\":[{\"filename\":\"logo.png\",\"idiom\":\"universal\",\"scale\":\"1x\"},{\"idiom\":\"universal\",\"scale\":\"2x\"},{\"idiom\":\"universal\",\"scale\":\"3x\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}");
            content.images[0].filename = "logo." + extension;
            let string = JSON.stringify(content);
            fs.writeFile(directory + "/Contents.json", string, function (error) {
                if (error) {
                    console.log("Error writing file Content.json: " + string);
                    return;
                }
            })

            // copy
            copyImageOnly(body, index, token, extension, directory);
        } catch (err) {
            console.log("Error downloading " + token.symbol + "'s logo with url: " + token.logoURI + ", error: " + err);
        }
    }
    fs.writeFile("./solana.tokenlist.json", JSON.stringify(body, null, 2), function (err) {
        if (err) {console.log("Error writing solana.tokenlist.json: " + err);}
    })
}

// main function
async function main() {
    await downloadImages();
}

main();
