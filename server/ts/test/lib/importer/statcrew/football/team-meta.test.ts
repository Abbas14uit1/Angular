import { test } from "ava";
import * as _ from "lodash";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/football/team";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";

import { VH } from "../../../../../src/lib/importer/AthlyteImporter";
import { parseMeta } from "../../../../../src/lib/importer/statcrew/helpers/teamParser";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let meta: AthlyteTeam.ITeamMeta;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse team data", (t) => {
  meta = parseMeta(inputData.team[1]);
});

test("meta: generates tidy name", (t) => {
  t.is(meta.tidyName, "UA");
});

test("meta: team name is string", (t) => {
  t.is(meta.name, "Alabama");
});
