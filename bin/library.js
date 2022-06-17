#!/usr/bin/env node

/*
Make a plugin library containing all of the cannedfish plugins

node ./bin/make-cannedfish-library.js <path-to-directory-of-cannedfish-json-files> <path-to-output-folder>
*/

const fs = require("fs"),
    path = require("path");
// const { formatWithOptions } = require("util");

// Check arguments

const cannedfishPath = process.argv[2] || "./docs/plugin",
    outputPath = process.argv[3] || "./docs/library";

if (!cannedfishPath) {
    throw "Missing cannedfish directory path";
}

if (!outputPath) {
    throw "Missing output path";
}

// Get the pathnames of all of the cannedfish plugins

const cannedfishPluginFilepaths = fs
    .readdirSync(cannedfishPath)
    .map((filename) => path.resolve(cannedfishPath, filename))
    .filter((filepath) => !fs.statSync(filepath).isDirectory() && filepath.endsWith(".json"));

// Process each plugin in turn, writing it to the output path and collecting the metadata

const pluginDataArry = [];

for (const filepath of cannedfishPluginFilepaths) {
    const outputFilePath = path.resolve(outputPath, "recipes", "library", "tiddlers");
    fs.mkdirSync(outputFilePath, { recursive: true });

    const pluginData = JSON.parse(fs.readFileSync(filepath, "utf8"));
    const readmeTitle = pluginData.title + "/readme";
    const pluginText = JSON.parse(pluginData.text);

    pluginDataArry.push(Object.assign({}, pluginData, { text: undefined,readme: pluginText.tiddlers[readmeTitle].text }));
    fs.writeFileSync(path.resolve(outputFilePath, encodeURIComponent(pluginData.title) + ".json"), JSON.stringify(pluginData));
}

// Write the metadata JSON file

fs.writeFileSync(path.resolve(outputPath, "recipes", "library", "tiddlers.json"), JSON.stringify(pluginDataArry, null, 4));

// Write the library index file

const htmlTemplate = fs.readFileSync(path.resolve(__dirname, "empty-library", "index.html"), "utf8");

const insertMarker = " var assetList =";
const insertPos = htmlTemplate.indexOf(insertMarker) + insertMarker.length;
const html = htmlTemplate.slice(0, insertPos) + JSON.stringify(pluginDataArry, null, 4) + htmlTemplate.slice(insertPos);

fs.writeFileSync(path.resolve(outputPath, "index.html"), html, "utf8");
