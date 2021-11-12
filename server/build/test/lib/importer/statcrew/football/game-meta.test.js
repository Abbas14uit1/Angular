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
const moment = require("moment");
const game_1 = require("../../../../../src/lib/importer/statcrew/football/game");
const _data_helper_1 = require("../_data.helper");
let inputData;
let meta;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse game metadata", (t) => {
    const gameClass = new game_1.Game();
    meta = gameClass.parseMeta(inputData.venue[0]);
    t.not(meta, undefined);
});
ava_1.test("converts start time to moment", (t) => {
    t.true(moment("7:14 pm", "hh:mm A").isSame(moment(meta.startTime, "hh:mm A")));
});
ava_1.test("saves officials to array", (t) => {
    const officials = meta.officials;
    t.true(_.isArray(officials));
    t.true(officials.length > 0);
    t.truthy(_.find(officials, { pos: "ref", name: "Reggie Smith" }));
});
ava_1.test("parses rules correctly", (t) => {
    const rules = meta.rules;
    t.not(rules, undefined);
    t.is(rules.quarters, 4);
    t.is(rules.minutes, 15);
    t.is(rules.downs, 4);
    t.is(rules.yards, 10);
    t.is(rules.kickoffSpot, 35);
    t.is(rules.touchbackSpot, 20);
    t.is(rules.kickoffTouchbackSpot, 25);
});
//# sourceMappingURL=game-meta.test.js.map