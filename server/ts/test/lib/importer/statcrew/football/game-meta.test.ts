import { test } from "ava";
import * as _ from "lodash";
import * as moment from "moment";

import * as AthlyteGame from "../../../../../../../typings/athlyte/football/game.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { Game } from "../../../../../src/lib/importer/statcrew/football/game";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let meta: AthlyteGame.IGameMeta;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse game metadata", (t) => {
  const gameClass = new Game();
  meta = gameClass.parseMeta(inputData.venue[0]);
  t.not(meta, undefined);
});

test("converts start time to moment", (t) => {
  t.true(moment("7:14 pm", "hh:mm A").isSame(moment(meta.startTime, "hh:mm A")));
});

test("saves officials to array", (t) => {
  const officials = meta.officials;
  t.true(_.isArray(officials));
  t.true(officials.length > 0);
  t.truthy(_.find(officials, { pos: "ref", name: "Reggie Smith" }));
});

test("parses rules correctly", (t) => {
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
