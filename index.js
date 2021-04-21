const tokens = require('./tokens.json').tokens;
const async = require("async");
const get = require("async-get-file");
const fs = require('fs');
const path = require('path');
const iosAssetGenerator = require("xc-assetcat-gen");

// Enums
const Idiom = iosAssetGenerator.Enums.Idiom;
const Scale = iosAssetGenerator.Enums.Scale;
const Type = iosAssetGenerator.Enums.Type;

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

// asset generator
this.config = {
    source_images_root: logoDir,
    asset_catalog_root: logoDir + "ios/logos.xcassets",
    author: "Chung tran"
};

async function generateAssets() {
    // for iOS
    fs.readdir(logoDir, (err, files) => {
        var assets = [];

        files.forEach(file => {
            if (!fs.lstatSync(path.resolve(logoDir, file)).isDirectory()) {
                if (file == ".DS_Store") {
                    return;
                }
                console.log('File: ' + file);
                let assetName = file.split(".")
                assetName = assetName[0]
                assets.push(
                    {
                        name: assetName,
                        source: file,
                        target: "",
                        size: { width: 50, height: 50 },
                        format: "png",
                        type: Type.ImageSet,
                        devices: [Idiom.iPhone, Idiom.iPad, Idiom.mac, Idiom.tv]
                    }
                )
            }
        });

        console.log(this.config);
        const parser = new iosAssetGenerator.Parser(assets);
        parser.parse();
    });

    // for android
}

// main function
async function main() {
    await downloadImages();
    await generateAssets();
}

main();
