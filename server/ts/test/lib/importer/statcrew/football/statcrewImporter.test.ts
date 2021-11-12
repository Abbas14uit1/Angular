/**
 * Tests the whole Statcrew importer rather than its individual class components
 */

import { test } from "ava";
import * as fs from "fs";
import * as _ from "lodash";
import * as moment from "moment";
import * as path from "path";
import * as pify from "pify";

import * as Athlyte from "../../../../../../../typings/athlyte/football";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { FootballImporter } from "../../../../../src/lib/importer/statcrew/football/footballImporter";

import { statcrewXmlDir } from "../../../../config/_testConfiguration";
import { readJson, readXml } from "../_data.helper";

const importer = new FootballImporter();

test.before("read input file", async (t) => {
  const input = await readJson();
  importer.parse(input);
});

test("parse all 2016 files", async (t) => {
  const dir2016 = path.join(statcrewXmlDir, "2016");
  const files: string[] = await pify(fs.readdir)(dir2016);
  for (const fileName of files) {
    const data = await pify(fs.readFile)(path.join(dir2016, fileName), "UTF-8");
    const parsedJson = await readXml(data);
    const singleImporter = new FootballImporter();
    await t.notThrows(() => singleImporter.parse(parsedJson), `Error while parsing ${fileName}`);
  }
});

test("parse all 2015 files", async (t) => {
  const dir2015 = path.join(statcrewXmlDir, "2015");
  const files: string[] = await pify(fs.readdir)(dir2015);
  for (const fileName of files) {
    const data = await pify(fs.readFile)(path.join(dir2015, fileName), "UTF-8");
    const parsedJson = await readXml(data);
    const singleImporter = new FootballImporter();
    await t.notThrows(() => singleImporter.parse(parsedJson), `Error while parsing ${fileName}`);
  }
});

test("getParsedData returns parsed data", async (t) => {
  const parsed = importer.getParsedData();
  t.not(parsed.game, undefined);
  t.not(parsed.homePlayers, undefined);
  t.not(parsed.plays, undefined);
  t.not(parsed.team.away, undefined);
  t.not(parsed.team.home, undefined);
  t.not(parsed.visitorPlayers, undefined);
});

test("top level game data (date and season) parses successfully", async (t) => {
  const parsedGame = importer.getParsedData().game;
  t.true(moment(parsedGame.gameDate).isValid());
  t.is(parsedGame.season, 2016);
});
