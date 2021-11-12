import { test } from "ava";
import * as _ from "lodash";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/basketball";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/basketball/team";
import { IStatcrewBasketballJSON } from "../../../../../../../typings/statcrew/basketball";

import { VH } from "../../../../../src/lib/importer/AthlyteImporter";
import { Team } from "../../../../../src/lib/importer/statcrew/basketball/team";
import * as TeamParser from "../../../../../src/lib/importer/statcrew/basketball/helpers/teamParser";

import { readJson } from "../_data.helperBasketball";

let inputData: IStatcrewBasketballJSON;
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
  homeTeamClass.parse(home, visitor, new Date(2013, 9, 13),"9/13/2013","MBB", inputData.venue[0]);
  visitingTeamClass.parse(visitor, home, new Date(2013, 9, 13),"9/13/2013","MBB", inputData.venue[0]);
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
  t.throws(() => team.parse(modTeam, modTeam, new Date(2016, 9, 13),"9/13/2013","MBB", inputData.venue[0]));
});

test("team game is given correct season", (t) => {
  // note the manually changed season in test.before("parse team data")
  t.is(teams.home.games.season, 2013);
});


test("meta parser should throw exception", (t) => {
  const codeLessTeam = _.cloneDeep(inputData.team[0]);
  codeLessTeam.$.code = 0;
  t.throws(() => TeamParser.parseMeta(codeLessTeam));
});