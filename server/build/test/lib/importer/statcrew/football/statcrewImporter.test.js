"use strict";
/**
 * Tests the whole Statcrew importer rather than its individual class components
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
const ava_1 = require("ava");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const pify = require("pify");
const footballImporter_1 = require("../../../../../src/lib/importer/statcrew/football/footballImporter");
const _testConfiguration_1 = require("../../../../config/_testConfiguration");
const _data_helper_1 = require("../_data.helper");
const importer = new footballImporter_1.FootballImporter();
ava_1.test.before("read input file", (t) => __awaiter(this, void 0, void 0, function* () {
    const input = yield _data_helper_1.readJson();
    importer.parse(input);
}));
ava_1.test("parse all 2016 files", (t) => __awaiter(this, void 0, void 0, function* () {
    const dir2016 = path.join(_testConfiguration_1.statcrewXmlDir, "2016");
    const files = yield pify(fs.readdir)(dir2016);
    for (const fileName of files) {
        const data = yield pify(fs.readFile)(path.join(dir2016, fileName), "UTF-8");
        const parsedJson = yield _data_helper_1.readXml(data);
        const singleImporter = new footballImporter_1.FootballImporter();
        yield t.notThrows(() => singleImporter.parse(parsedJson), `Error while parsing ${fileName}`);
    }
}));
ava_1.test("parse all 2015 files", (t) => __awaiter(this, void 0, void 0, function* () {
    const dir2015 = path.join(_testConfiguration_1.statcrewXmlDir, "2015");
    const files = yield pify(fs.readdir)(dir2015);
    for (const fileName of files) {
        const data = yield pify(fs.readFile)(path.join(dir2015, fileName), "UTF-8");
        const parsedJson = yield _data_helper_1.readXml(data);
        const singleImporter = new footballImporter_1.FootballImporter();
        yield t.notThrows(() => singleImporter.parse(parsedJson), `Error while parsing ${fileName}`);
    }
}));
ava_1.test("getParsedData returns parsed data", (t) => __awaiter(this, void 0, void 0, function* () {
    const parsed = importer.getParsedData();
    t.not(parsed.game, undefined);
    t.not(parsed.homePlayers, undefined);
    t.not(parsed.plays, undefined);
    t.not(parsed.team.away, undefined);
    t.not(parsed.team.home, undefined);
    t.not(parsed.visitorPlayers, undefined);
}));
ava_1.test("top level game data (date and season) parses successfully", (t) => __awaiter(this, void 0, void 0, function* () {
    const parsedGame = importer.getParsedData().game;
    t.true(moment(parsedGame.gameDate).isValid());
    t.is(parsedGame.season, 2016);
}));
//# sourceMappingURL=statcrewImporter.test.js.map