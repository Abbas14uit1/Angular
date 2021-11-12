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
const teamParser_1 = require("../../../../../src/lib/importer/statcrew/helpers/teamParser");
const _data_helper_1 = require("../_data.helper");
let inputData;
// UA first quarter totals for 01UA-USC
let quarter;
let quarters;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    quarter = teamParser_1.parseQuarterSummary(inputData.plays[0].qtr[0].qtrsummary[1], 1);
    quarters = teamParser_1.parseQuarterSummaries(AthlyteImporter_1.VH.home, inputData.plays[0].qtr);
}));
ava_1.test("Quarter data read properly for home and visiting team", (t) => {
    t.not(quarters, null);
    if (quarters == null) {
        return;
    }
    t.is(quarters.length, 4);
    t.is(quarters[0].firstdowns.fdTotal, 1);
});
ava_1.test("first downs", (t) => {
    t.deepEqual(quarter.firstdowns, {
        fdTotal: 1,
        fdRush: 1,
        fdPass: 0,
        fdPenalty: 0,
    });
});
ava_1.test("penalties", (t) => {
    t.deepEqual(quarter.penalties, {
        penTotal: 1,
        penYards: 15,
    });
});
ava_1.test("red zone", (t) => {
    const modifiedQuarter = _.cloneDeep(inputData.plays[0].qtr[0].qtrsummary[1]);
    modifiedQuarter.redzone = [
        {
            $: {
                att: 1,
                scores: 1,
                points: 3,
                tdrush: 0,
                tdpass: 0,
                fgmade: 1,
                endfga: 0,
                enddowns: 0,
                endint: 0,
                endfumb: 0,
                endhalf: 0,
                endgame: 0,
            },
        },
    ];
    const parsed = teamParser_1.parseQuarterSummary(modifiedQuarter, 1);
    t.deepEqual(parsed.redzone, {
        redAtt: 1,
        redScores: 1,
        redPoints: 3,
        redTdRush: 0,
        redTdPass: 0,
        redFgMade: 1,
        redEndFga: 0,
        redEndDown: 0,
        redEndInt: 0,
        redEndFumb: 0,
        redEndHalf: 0,
        redEndGame: 0,
    });
});
ava_1.test("Stats default to all 0s when undefined in the source", (t) => {
    const modifiedQuarter = _.cloneDeep(inputData.plays[0].qtr[0].qtrsummary[1]);
    modifiedQuarter.conversions = undefined;
    modifiedQuarter.fg = undefined;
    modifiedQuarter.firstdowns = undefined;
    modifiedQuarter.fumbles = undefined;
    modifiedQuarter.ir = undefined;
    modifiedQuarter.ko = undefined;
    modifiedQuarter.kr = undefined;
    modifiedQuarter.misc = undefined;
    modifiedQuarter.pass = undefined;
    modifiedQuarter.pat = undefined;
    modifiedQuarter.penalties = undefined;
    modifiedQuarter.pr = undefined;
    modifiedQuarter.punt = undefined;
    modifiedQuarter.rcv = undefined;
    modifiedQuarter.redzone = undefined;
    modifiedQuarter.rush = undefined;
    modifiedQuarter.scoring = undefined;
    const parsed = teamParser_1.parseQuarterSummary(modifiedQuarter, 1);
    t.deepEqual(parsed.conversions, {
        convThird: 0,
        convThirdAtt: 0,
        convFourth: 0,
        convFourthAtt: 0,
    });
    t.deepEqual(parsed.fieldgoal, {
        fgMade: 0,
        fgAtt: 0,
        fgLong: 0,
        fgBlocked: 0,
    });
    t.deepEqual(parsed.firstdowns, {
        fdTotal: 0,
        fdRush: 0,
        fdPass: 0,
        fdPenalty: 0,
    });
    t.deepEqual(parsed.fumbles, {
        fumbTotal: 0,
        fumbLost: 0,
    });
    t.deepEqual(parsed.intReturn, {
        irNo: 0,
        irYards: 0,
        irTd: 0,
        irLong: 0,
    });
    t.deepEqual(parsed.kickoff, {
        koNum: 0,
        koYards: 0,
        koOb: 0,
        koTb: 0,
    });
    t.deepEqual(parsed.kickReceiving, {
        krNo: 0,
        krYards: 0,
        krTd: 0,
        krLong: 0,
    });
    t.deepEqual(parsed.misc, {
        yards: 0,
        top: "",
        ona: 0,
        onm: 0,
        ptsto: 0,
    });
    t.deepEqual(parsed.pass, {
        passComp: 0,
        passAtt: 0,
        passInt: 0,
        passYards: 0,
        passTd: 0,
        passLong: 0,
        passSacks: 0,
        passSackYards: 0,
    });
    t.deepEqual(parsed.pointAfter, {
        kickatt: 0,
        kickmade: 0,
        passatt: 0,
        passmade: 0,
        rushatt: 0,
        rushmade: 0,
    });
    t.deepEqual(parsed.penalties, {
        penTotal: 0,
        penYards: 0,
    });
    t.deepEqual(parsed.puntReturn, {
        prNo: 0,
        prYards: 0,
        prTd: 0,
        prLong: 0,
    });
    t.deepEqual(parsed.punt, {
        puntNum: 0,
        puntYards: 0,
        puntLong: 0,
        puntBlocked: 0,
        puntTb: 0,
        puntFc: 0,
        puntPlus50: 0,
        puntInside20: 0,
    });
    t.deepEqual(parsed.pointAfter, {
        kickatt: 0,
        kickmade: 0,
        passatt: 0,
        passmade: 0,
        rushatt: 0,
        rushmade: 0,
    });
    t.deepEqual(parsed.receiving, {
        rcvNum: 0,
        rcvYards: 0,
        rcvTd: 0,
        rcvLong: 0,
    });
    t.deepEqual(parsed.redzone, {
        redAtt: 0,
        redScores: 0,
        redPoints: 0,
        redTdRush: 0,
        redTdPass: 0,
        redFgMade: 0,
        redEndFga: 0,
        redEndDown: 0,
        redEndInt: 0,
        redEndFumb: 0,
        redEndHalf: 0,
        redEndGame: 0,
    });
    t.deepEqual(parsed.rushing, {
        rushAtt: 0,
        rushYards: 0,
        rushGain: 0,
        rushLoss: 0,
        rushTd: 0,
        rushLong: 0,
    });
    t.deepEqual(parsed.scoring, {
        fg: 0,
        td: 0,
        patKick: 0,
    });
});
//# sourceMappingURL=team-quarters.test.js.map