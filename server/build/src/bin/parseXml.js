"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("graceful-fs");
const jsonfile = require("jsonfile");
const path = require("path");
const pify = require("pify");
const yargs = require("yargs");
const XMLParser_1 = require("../lib/XMLParser");
const argv = yargs
    .usage("Usage: $0 --in [file] --out [file]")
    .demandOption(["in", "out"])
    .argv;
const filePath = path.resolve(argv.in);
pify(fs.readFile)(filePath, "UTF-8")
    .then((xmlData) => {
    const parser = new XMLParser_1.XMLParser(xmlData);
    return parser.parseXml();
}).then((jsonData) => {
    return jsonfile.writeFile(argv.out, jsonData, { spaces: 2 });
});
//# sourceMappingURL=parseXml.js.map