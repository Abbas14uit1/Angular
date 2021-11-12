import { test } from "ava";
import * as _ from "lodash";

import * as Athlyte from "../../../../../../../typings/athlyte/football/game.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { Game } from "../../../../../src/lib/importer/statcrew/football/game";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let teams: Athlyte.IGameTeam;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse game team data", (t) => {
  const game = new Game();
  teams = game.parseTeam(inputData.team);
});

test("read home team", (t) => {
  t.is(teams.home.id, "UA");
  t.is(teams.home.name, "Alabama");
  t.is(teams.home.score, 52);
});

test("read visitor team", (t) => {
  t.is(teams.visitor.id, "USC");
  t.is(teams.visitor.name, "USC");
  t.is(teams.visitor.score, 6);
});

test("unexpected value for home/ visitor status throws error", (t) => {
  const team = _.cloneDeep(inputData.team);
  const game = new Game();
  team[0].$.vh = "foo" as any;
  t.throws(() => game.parseTeam(team));
});
