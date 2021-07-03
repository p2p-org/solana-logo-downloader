const async = require("async");
const got = require('got');
const get = require("async-get-file");
const fs = require('fs');
const path = require('path');
const iosAssetGenerator = require("xc-assetcat-gen");

// Enums
const Idiom = iosAssetGenerator.Enums.Idiom;
const Scale = iosAssetGenerator.Enums.Scale;
const Type = iosAssetGenerator.Enums.Type;

const logoDir = "./logos"

// download function
async function downloadImage(path, url, filename) {
    var options = {
        directory: logoDir + path,
        filename: filename
    }
    await get(url, options);
}

// loop throw tokens list and download
async function downloadImages() {
    const response = await got('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json');
    let tokens = JSON.parse(response.body).tokens;

    let assets = [];
    for (const index in tokens) {
        let token = tokens[index];
        let url = token.logoURI;

        if (!url) {
            console.log("Logo url for " + token.symbol + " is not found");
            continue;
        }

        // get filename
        let filename = token.symbol;

        let extension = "png";
        if (url.endsWith(".svg")) {
            extension = "svg";
        }

        // replace "/" in file name
        let log = "Downloading file " + filename + "." + extension;
        let replacer = filename.replace("/", "-").replace("Ü", "U");

        // add prefix for liquidity tokens
        if (token.name.startsWith("Raydium ") && token.symbol.includes("-")) {
            replacer = "Raydium-" + replacer;
        }

        if (token.name.startsWith("Orca ") && token.symbol.includes("/")) {
            replacer = "Orca-"+replacer;
        }

        if (token.name.startsWith("Mercurial ") && token.symbol.includes("/")) {
            replacer = "Mercurial-"+replacer;
        }

        if (filename != replacer) {
            log += " and rename to " + replacer + "." + extension;
            filename = replacer;
        }

        // check if file exists
        try {
            let fileExists = false;
            if (fs.existsSync(logoDir + "/" + filename + ".png")) {
                extension = "png";
                fileExists = true;
            }
            if (fs.existsSync(logoDir + "/" + filename + ".svg")) {
                extension = "svg"
                fileExists = true;
            }

            if (fileExists) {
                //file exists, skip
                assets.push({name: token.address, filename, extension});
                continue;
            }
        } catch(err) {
            console.error(err);
        }

        // download
        assets.push({name: token.address, filename, extension});
        try {
            console.log(log);
            await downloadImage("/", url, filename + "." + extension);
        } catch (err) {
            console.log("Error downloading " + token.symbol + "'s logo with url: " + token.logoURI + ", error: " + err);
        }
    }

    // Create assets
    for (const index in assets) {
        let asset = assets[index];
        // create asset
        let imageSetPath = logoDir + "/assets/ios/" + asset.name + ".imageset";
        const {filename, extension} = asset;
        fs.mkdir(imageSetPath, {recursive: true}, function (error) {
            if (error) {
                console.log("Error creating folder: " + imageSetPath);
                return;
            }
            fs.rename(logoDir + "/" + filename + "." + extension, imageSetPath + "/logo." + extension, function (error) {
                if (error) {
                    console.log("Error copying file: " + filename + "." + extension + ". Error: " + error);
                    return;
                }
                let content = JSON.parse("{\"images\":[{\"filename\":\"MEOW.png\",\"idiom\":\"universal\",\"scale\":\"1x\"},{\"idiom\":\"universal\",\"scale\":\"2x\"},{\"idiom\":\"universal\",\"scale\":\"3x\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}");
                content.images[0].filename = filename + "." + extension;
                let string = JSON.stringify(content);
                fs.writeFile(imageSetPath + "/Contents.json", string, function (error) {
                    if (error) {
                        console.log("Error writing file Content.json: " + string);
                        return;
                    }
                })
            })
        });
    }
}

// main function
async function main() {
    await downloadImages();
}

main();
