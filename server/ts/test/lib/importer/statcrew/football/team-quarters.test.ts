import { test } from "ava";
import * as _ from "lodash";

import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { VH } from "../../../../../src/lib/importer/AthlyteImporter";
import {
  parseQuarterSummaries,
  parseQuarterSummary,
} from "../../../../../src/lib/importer/statcrew/helpers/teamParser";
import { readJson } from "../_data.helper";

import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/football/team";

let inputData: IStatcrewFootballJSON;

// UA first quarter totals for 01UA-USC
let quarter: AthlyteTeam.IQuarterTotals;
let quarters: AthlyteTeam.IQuarterTotals[] | undefined;

test.before("read full input file", async (t) => {
  inputData = await readJson();
  quarter = parseQuarterSummary(inputData.plays[0].qtr[0].qtrsummary[1], 1);
  quarters = parseQuarterSummaries(VH.home, inputData.plays[0].qtr);
});

test("Quarter data read properly for home and visiting team", (t) => {
  t.not(quarters, null);
  if (quarters == null) {
    return;
  }
  t.is(quarters.length, 4);
  t.is(quarters[0].firstdowns.fdTotal, 1);
});

test("first downs", (t) => {
  t.deepEqual(quarter.firstdowns, {
    fdTotal: 1,
    fdRush: 1,
    fdPass: 0,
    fdPenalty: 0,
  });
});

test("penalties", (t) => {
  t.deepEqual(quarter.penalties, {
    penTotal: 1,
    penYards: 15,
  });
});

test("red zone", (t) => {
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
  const parsed = parseQuarterSummary(modifiedQuarter, 1);
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

test("Stats default to all 0s when undefined in the source", (t) => {
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
  const parsed = parseQuarterSummary(modifiedQuarter, 1);
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
