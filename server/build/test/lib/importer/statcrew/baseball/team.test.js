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
const AthlyteImporter_1 = require("../../../../../src/lib/importer/AthlyteImporter");
const team_1 = require("../../../../../src/lib/importer/statcrew/baseball/team");
const TeamParser = require("../../../../../src/lib/importer/statcrew/baseball/helpers/teamParser");
const _data_helperBaseball_1 = require("../_data.helperBaseball");
let inputData;
let teams;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helperBaseball_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse team data", (t) => {
    const home = inputData.team[0].$.vh === "H" ? inputData.team[0] : inputData.team[1];
    const visitor = inputData.team[0].$.vh === "V" ? inputData.team[0] : inputData.team[1];
    const homeTeamClass = new team_1.Team();
    const visitingTeamClass = new team_1.Team();
    homeTeamClass.parse(home, visitor, new Date(2013, 9, 13), "9/13/2013", "MBA", inputData.venue[0]);
    visitingTeamClass.parse(visitor, home, new Date(2013, 9, 13), "9/13/2013", "MBA", inputData.venue[0]);
    teams = {
        away: visitingTeamClass.parsedData,
        home: homeTeamClass.parsedData,
    };
});
ava_1.test("parsing creates home and away teams", (t) => {
    t.not(teams.home, undefined);
    t.not(teams.away, undefined);
});
ava_1.test("read whether team is home or away", (t) => {
    t.is(teams.home.games.homeAway, AthlyteImporter_1.VH.home);
});
ava_1.test("unexpected VH value throws error", (t) => {
    const modTeam = _.cloneDeep(inputData.team[0]);
    const team = new team_1.Team();
    modTeam.$.vh = "Q";
    t.throws(() => team.parse(modTeam, modTeam, new Date(2016, 9, 13), "9/13/2013", "MBA", inputData.venue[0]));
});
ava_1.test("team game is given correct season", (t) => {
    // note the manually changed season in test.before("parse team data")
    t.is(teams.home.games.season, 2013);
});
ava_1.test("meta parser should throw exception", (t) => {
    const codeLessTeam = _.cloneDeep(inputData.team[0]);
    codeLessTeam.$.code = 0;
    t.throws(() => TeamParser.parseMeta(codeLessTeam));
});
//# sourceMappingURL=team.test.js.map