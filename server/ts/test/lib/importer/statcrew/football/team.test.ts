import { test } from "ava";
import * as _ from "lodash";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/football/team";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";

import { VH } from "../../../../../src/lib/importer/AthlyteImporter";
import { Team } from "../../../../../src/lib/importer/statcrew/football/team";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let teams: AthlyteTeam.IAllTeams;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse team data", (t) => {
  const home = inputData.team[0].$.vh === "H" ? inputData.team[0] : inputData.team[1];
  const visitor = inputData.team[0].$.vh === "V" ? inputData.team[0] : inputData.team[1];
  const homeTeamClass = new Team();
  const visitingTeamClass = new Team();
  homeTeamClass.parse(home, visitor, inputData.venue[0], inputData.plays[0].qtr, new Date(2013, 9, 13),"9/13/2013");
  visitingTeamClass.parse(visitor, home, inputData.venue[0], inputData.plays[0].qtr, new Date(2013, 9, 13),"9/13/2013");
  teams = {
    away: visitingTeamClass.parsedData,
    home: homeTeamClass.parsedData,
  };
});

test("parsing creates home and away teams", (t) => {
  t.not(teams.home, undefined);
  t.not(teams.away, undefined);
});

test("read whether team is home or away", (t) => {
  t.is(teams.home.games.homeAway, VH.home);
});

test("unexpected VH value throws error", (t) => {
  const modTeam = _.cloneDeep(inputData.team[0]);
  const team = new Team();
  modTeam.$.vh = "Q" as any;
  t.throws(() => team.parse(modTeam, modTeam, inputData.venue[0], inputData.plays[0].qtr, new Date(2016, 9, 13),"9/13/2013"));
});

test("team game is given correct season", (t) => {
  // note the manually changed season in test.before("parse team data")
  t.is(teams.home.games.season, 2013);
});
