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
const path = require("path");
const yargs = require("yargs");
const StatObjectInspector_1 = require("../lib/StatObjectInspector");
const winstonLogger_1 = require("../lib/winstonLogger");
const XMLParser_1 = require("../lib/XMLParser");
const argv = yargs
    .usage("Usage: $0 [file]")
    .demandCommand(1, "Needs a path to an XML file")
    .argv;
const inputFile = path.resolve(argv._[0]);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const parser = new XMLParser_1.XMLParser(inputFile);
        const parsed = yield parser.parseXml();
        const builder = new StatObjectInspector_1.StatObjectInspector(parsed);
        return builder.buildUniqArr();
    });
}
main()
    .then((tree) => {
    winstonLogger_1.winstonLogger.addConsole({
        colorize: true,
        prettyPrint: true,
    });
    winstonLogger_1.winstonLogger.log("info", JSON.stringify(tree, undefined, 2));
});
//# sourceMappingURL=statObjectInspector.js.map