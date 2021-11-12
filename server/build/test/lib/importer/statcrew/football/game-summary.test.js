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
const ava_1 = require("ava");
const _ = require("lodash");
const game_1 = require("../../../../../src/lib/importer/statcrew/football/game");
const play_1 = require("../../../../../src/lib/importer/statcrew/football/play");
const _data_helper_1 = require("../_data.helper");
let inputData;
let summary;
let plays;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse game summary data", (t) => {
    plays = play_1.parsePlays(inputData.plays[0]);
    summary = game_1.parseSummary(plays.map((play) => play.parsedData), inputData.drives[0].drive);
});
ava_1.test("summary of all scores from a game", (t) => {
    t.true(_.isArray(summary.scores));
    t.is(summary.scores.length, 10);
});
ava_1.test("scoring summary is a number reference", (t) => {
    const single = summary.scores[0];
    t.true(Number.isInteger(single));
    t.true(single >= 0);
});
ava_1.test("summary of all drives from a game", (t) => {
    t.true(_.isArray(summary.drives));
    t.is(summary.drives.length, 33);
});
ava_1.test("drive summary is a range between two integers", (t) => {
    const singleDrive = summary.drives[0];
    singleDrive.forEach((play) => {
        t.true(Number.isInteger(play));
    });
    t.true(singleDrive[0] <= singleDrive[1]);
});
ava_1.test("drive summary reflects correct ranges of plays", (t) => {
    const cointossDrive = summary.drives[0];
    t.is(cointossDrive[0], 0);
    t.is(cointossDrive[1], 2);
    const firstRealDrive = summary.drives[1];
    t.is(firstRealDrive[0], 3);
    t.is(firstRealDrive[1], 8);
});
ava_1.test("summary of all FGAs from a game", (t) => {
    t.true(_.isArray(summary.fgas));
    t.is(summary.fgas.length, 3);
});
ava_1.test("FGA summary is a number reference", (t) => {
    const single = summary.fgas[0];
    t.true(Number.isInteger(single));
    t.true(single >= 0);
});
ava_1.test("summary of all long plays from a game", (t) => {
    t.true(_.isArray(summary.longplay));
    t.is(summary.fgas.length, 3);
});
ava_1.test("Longplay summary is a number reference", (t) => {
    const single = summary.longplay[0];
    t.true(Number.isInteger(single));
    t.true(single >= 0);
});
ava_1.test("Drive summary exists", (t) => {
    t.true(_.isArray(summary.driveDetails));
    t.not(summary.driveDetails, undefined);
    if (summary.driveDetails !== undefined) {
        t.not(summary.driveDetails[0], undefined);
    }
    else {
        //Force a failure as we dont expect this to be undefined for the given test input
        t.is(true, false);
    }
});
//# sourceMappingURL=game-summary.test.js.map