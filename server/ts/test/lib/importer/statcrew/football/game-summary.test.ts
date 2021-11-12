import { test } from "ava";
import * as _ from "lodash";

import * as AthlyteGame from "../../../../../../../typings/athlyte/football/game.d";
import * as AthlytePlay from "../../../../../../../typings/athlyte/football/play.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { VH } from "../../../../../src/lib/importer/AthlyteImporter";

import { parseSummary } from "../../../../../src/lib/importer/statcrew/football/game";
import { parsePlays, Play } from "../../../../../src/lib/importer/statcrew/football/play";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let summary: AthlyteGame.IGameSummary;
let plays: Play[];

test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse game summary data", (t) => {
  plays = parsePlays(inputData.plays[0]);
  summary = parseSummary(plays.map((play) => play.parsedData), inputData.drives[0].drive);
});

test("summary of all scores from a game", (t) => {
  t.true(_.isArray(summary.scores));
  t.is(summary.scores.length, 10);
});

test("scoring summary is a number reference", (t) => {
  const single = summary.scores[0];
  t.true(Number.isInteger(single));
  t.true(single >= 0);
});

test("summary of all drives from a game", (t) => {
  t.true(_.isArray(summary.drives));
  t.is(summary.drives.length, 33);
});

test("drive summary is a range between two integers", (t) => {
  const singleDrive = summary.drives[0];
  singleDrive.forEach((play) => {
    t.true(Number.isInteger(play));
  });
  t.true(singleDrive[0] <= singleDrive[1]);
});

test("drive summary reflects correct ranges of plays", (t) => {
  const cointossDrive = summary.drives[0];
  t.is(cointossDrive[0], 0);
  t.is(cointossDrive[1], 2);
  const firstRealDrive = summary.drives[1];
  t.is(firstRealDrive[0], 3);
  t.is(firstRealDrive[1], 8);
});

test("summary of all FGAs from a game", (t) => {
  t.true(_.isArray(summary.fgas));
  t.is(summary.fgas.length, 3);
});

test("FGA summary is a number reference", (t) => {
  const single = summary.fgas[0];
  t.true(Number.isInteger(single));
  t.true(single >= 0);
});

test("summary of all long plays from a game", (t) => {
  t.true(_.isArray(summary.longplay));
  t.is(summary.fgas.length, 3);
});

test("Longplay summary is a number reference", (t) => {
  const single = summary.longplay[0];
  t.true(Number.isInteger(single));
  t.true(single >= 0);
});

test("Drive summary exists", (t) => {
  t.true(_.isArray(summary.driveDetails));
  t.not(summary.driveDetails, undefined);

  if (summary.driveDetails !== undefined) {
    t.not(summary.driveDetails[0], undefined);
  } else {
    //Force a failure as we dont expect this to be undefined for the given test input
    t.is(true, false );
  }

});
