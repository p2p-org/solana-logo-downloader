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
    for (const index in tokens) {
        let token = tokens[index];
        let url = token.logoURI;

        if (url) {
            // get filename
            let filename = token.symbol + ".png";
            if (url.endsWith(".svg")) {
                filename = token.symbol + ".svg";
            }

            // replace "/" in file name
            let log = "Downloading file " + filename;
            let replacer = filename.replace("/", "-");
            if (filename != replacer) {
                log += " and rename to " + replacer;
                filename = replacer;
            }

            // check if file exists
            try {
                if (fs.existsSync(logoDir + "/" + filename)) {
                    //file exists, skip
                    continue;
                }
            } catch(err) {
                console.error(err)
            }

            // download
            try {
                console.log(log);
                await downloadImage("/", url, filename);
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
    source_images_root: logoDir + "/",
    asset_catalog_root: logoDir + "/ios/logos.xcassets",
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
                        devices: [Idiom.iPhone]
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
    // await generateAssets();
}

main();
