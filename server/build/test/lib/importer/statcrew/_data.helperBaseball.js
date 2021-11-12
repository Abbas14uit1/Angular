"use strict";
/**
 * Note: this entire file is called .test.ts so that NYC ignores it and doesn't try code coverage
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonfile = require("jsonfile");
const path = require("path");
const pify = require("pify");
const XMLParser_1 = require("../../../../src/lib/XMLParser");
const _testConfiguration_1 = require("../../../config/_testConfiguration");
/**
 * Path to Statcrew data
 */
exports.defaultDataPath = path.join(_testConfiguration_1.fixtureDir, "json", "statcrew", "baseball_TA01-LM.json");
/**
 * Load JSON file into a JS object
 * @param inputPath Path to JSON file to read in
 */
function readJson(inputPath = exports.defaultDataPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield pify(jsonfile.readFile)(inputPath);
    });
}
exports.readJson = readJson;
function readXml(inputData) {
    return __awaiter(this, void 0, void 0, function* () {
        const parser = new XMLParser_1.XMLParser(inputData);
        return parser.parseXml();
    });
}
exports.readXml = readXml;
/**
 * Overwrite the plays array with a single play from the game.
 * Good for testing specific behavior with data.
 * Modifies the input object.
 * @param inputData Statcrew JSON data
 * @param quarter Quarter index in game, from 0 to 3
 * @param play Play index in quarter, starts at 0 in each quarter
 */
function focusToSpecificPlay(inputData, inning, play) {
    inputData.plays[0].inning = [inputData.plays[0].inning[inning]];
    inputData.plays[0].inning[0].batting[0].play = [inputData.plays[0].inning[0].batting[0].play[play]];
}
exports.focusToSpecificPlay = focusToSpecificPlay;
//# sourceMappingURL=_data.helperBaseball.js.map