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
const teamParser_1 = require("../../../../../src/lib/importer/statcrew/helpers/teamParser");
const _data_helper_1 = require("../_data.helper");
let inputData;
// UA totals for 01UA-USC
let totals;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    totals = teamParser_1.parseTotals(inputData.team[0]);
}));
ava_1.test("first downs", (t) => {
    t.deepEqual(totals.firstdowns, {
        fdTotal: 11,
        fdRush: 5,
        fdPass: 4,
        fdPenalty: 2,
    });
});
ava_1.test("penalties", (t) => {
    t.deepEqual(totals.penalties, {
        penTotal: 6,
        penYards: 46,
    });
});
ava_1.test("fg, pat, scoring, defense, kick receiving default to all 0s when undefined in the source doc", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].fg = undefined;
    modifiedTotals.totals[0].pat = undefined;
    modifiedTotals.totals[0].kr = undefined;
    modifiedTotals.totals[0].scoring = [{
            $: {
                fg: undefined,
                td: undefined,
                patkick: undefined,
            },
        }];
    modifiedTotals.totals[0].defense[0].$ = {
        tackua: 0,
        tacka: 0,
    };
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.fieldgoal, {
        fgMade: 0,
        fgAtt: 0,
        fgLong: 0,
        fgBlocked: 0,
    });
    t.deepEqual(parsed.pointAfter, {
        kickatt: 0,
        kickmade: 0,
        passatt: 0,
        passmade: 0,
        rushatt: 0,
        rushmade: 0,
    });
    t.deepEqual(parsed.scoring, {
        td: 0,
        fg: 0,
        patKick: 0,
    });
    t.deepEqual(parsed.defense, {
        dTackUa: 0,
        dTackA: 0,
        dTackTot: 0,
        dTflua: 0,
        dTfla: 0,
        dTflyds: 0,
        dSacks: 0,
        dSackA: 0,
        dSackUa: 0,
        dSackYards: 0,
        dBrup: 0,
        dFf: 0,
        dFr: 0,
        dFryds: 0,
        dInt: 0,
        dIntYards: 0,
        dQbh: 0,
        dblkd: 0,
    });
});
ava_1.test("scoring defaults to all 0s when scores is entirely undefined (i.e. not even entered on xml)", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].scoring = undefined;
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.scoring, {
        td: 0,
        fg: 0,
        patKick: 0,
    });
});
ava_1.test("validating team total tack", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].defense[0].$ = {
        tackua: 1,
        tacka: 2,
        tflua: 6,
        tfla: 7,
    };
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.defense, {
        dTackUa: 1,
        dTackA: 2,
        dTackTot: 3,
        dTflua: 6,
        dTfla: 7,
        dTflyds: 0,
        dSackUa: 0,
        dSackA: 0,
        dSacks: 0,
        dSackYards: 0,
        dBrup: 0,
        dFf: 0,
        dFr: 0,
        dFryds: 0,
        dInt: 0,
        dIntYards: 0,
        dQbh: 0,
        dblkd: 0,
    });
});
ava_1.test("validating team total sacks", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].defense[0].$ = {
        tackua: 1,
        tacka: 2,
        sackua: 4,
        sacka: 5,
    };
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.defense, {
        dTackUa: 1,
        dTackA: 2,
        dTackTot: 3,
        dTflua: 0,
        dTfla: 0,
        dTflyds: 0,
        dSackUa: 4,
        dSackA: 5,
        dSacks: 9,
        dSackYards: 0,
        dBrup: 0,
        dFf: 0,
        dFr: 0,
        dFryds: 0,
        dInt: 0,
        dIntYards: 0,
        dQbh: 0,
        dblkd: 0,
    });
});
ava_1.test("validating team total tack should not be overwritten", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].defense[0].$ = {
        tackua: 1,
        tacka: 2,
        tot_tack: 4,
        tflua: 0,
    };
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.defense, {
        dTackUa: 1,
        dTackA: 2,
        dTackTot: 4,
        dTflua: 0,
        dTfla: 0,
        dTflyds: 0,
        dSackUa: 0,
        dSackA: 0,
        dSacks: 0,
        dSackYards: 0,
        dBrup: 0,
        dFf: 0,
        dFr: 0,
        dFryds: 0,
        dInt: 0,
        dIntYards: 0,
        dQbh: 0,
        dblkd: 0,
    });
});
ava_1.test("validating team total sacks sould not be overwritten", (t) => {
    const modifiedTotals = _.cloneDeep(inputData.team[0]);
    modifiedTotals.totals[0].defense[0].$ = {
        tackua: 1,
        tacka: 2,
        sackua: 4,
        sacka: 5,
        sacks: 10
    };
    const parsed = teamParser_1.parseTotals(modifiedTotals);
    t.deepEqual(parsed.defense, {
        dTackUa: 1,
        dTackA: 2,
        dTackTot: 3,
        dTflua: 0,
        dTfla: 0,
        dTflyds: 0,
        dSackUa: 4,
        dSackA: 5,
        dSacks: 10,
        dSackYards: 0,
        dBrup: 0,
        dFf: 0,
        dFr: 0,
        dFryds: 0,
        dInt: 0,
        dIntYards: 0,
        dQbh: 0,
        dblkd: 0,
    });
});
//# sourceMappingURL=team-totals.test.js.map