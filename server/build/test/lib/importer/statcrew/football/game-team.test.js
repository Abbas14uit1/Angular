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
const _data_helper_1 = require("../_data.helper");
let inputData;
let teams;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse game team data", (t) => {
    const game = new game_1.Game();
    teams = game.parseTeam(inputData.team);
});
ava_1.test("read home team", (t) => {
    t.is(teams.home.id, "UA");
    t.is(teams.home.name, "Alabama");
    t.is(teams.home.score, 52);
});
ava_1.test("read visitor team", (t) => {
    t.is(teams.visitor.id, "USC");
    t.is(teams.visitor.name, "USC");
    t.is(teams.visitor.score, 6);
});
ava_1.test("unexpected value for home/ visitor status throws error", (t) => {
    const team = _.cloneDeep(inputData.team);
    const game = new game_1.Game();
    team[0].$.vh = "foo";
    t.throws(() => game.parseTeam(team));
});
//# sourceMappingURL=game-team.test.js.map