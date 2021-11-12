#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("graceful-fs");
const path = require("path");
const pify = require("pify");
const yargs = require("yargs");
const checkData_1 = require("../lib/importer/statcrew/helpers/checkData");
const winstonLogger_1 = require("../lib/winstonLogger");
const XMLParser_1 = require("../lib/XMLParser");
function main(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        winstonLogger_1.winstonLogger.addConsole({
            colorize: true,
            prettyPrint: true,
            level: "debug",
        });
        winstonLogger_1.winstonLogger.addFile({
            colorize: true,
            prettyPrint: true,
            level: "debug",
            filename: inputPath.split(".")[0] + "unexpected.txt",
        });
        const inputXmlData = yield pify(fs.readFile)(inputPath);
        const parser = new XMLParser_1.XMLParser(inputXmlData);
        const parsed = yield parser.parseXml();
        checkData_1.checkInputData(parsed);
    });
}
const argv = yargs
    .usage("Usage: $0 [file]")
    .demandCommand(1, "Needs a path to an XML file")
    .argv;
const inputFile = path.resolve(argv._[0]);
main(inputFile)
    .then(() => winstonLogger_1.winstonLogger.log("info", "Done!"));
//# sourceMappingURL=unexpectedStatcrewPropFinder.js.map