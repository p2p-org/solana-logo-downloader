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
            if (fs.existsSync(logoDir + "/" + filename + "." + extension)) {
                //file exists, skip
                continue;
            }
        } catch(err) {
            console.error(err)
        }

        // download
        try {
            console.log(log);
            await downloadImage("/new", url, filename + "." + extension);
        } catch (err) {
            console.log("Error downloading " + token.symbol + "'s logo with url: " + token.logoURI + ", error: " + err);
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
