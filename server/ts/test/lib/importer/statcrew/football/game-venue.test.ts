import { test } from "ava";
import * as _ from "lodash";

import * as AthlyteGame from "../../../../../../../typings/athlyte/football/game.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { Game } from "../../../../../src/lib/importer/statcrew/football/game";

import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
let venue: AthlyteGame.IGameVenue;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test.before("parse game venue data", (t) => {
  const game = new Game();
  venue = game.parseVenue(inputData.venue[0]);
});

test("game played location", (t) => {
  t.is(venue.geoLocation, "Arlington, Texas");
});

test("game played stadium name", (t) => {
  t.is(venue.stadiumName, "AT&T Stadium");
});

test("neutral location", (t) => {
  t.is(venue.neutralLocation, true);
});

test("nighttime game", (t) => {
  t.is(venue.nightGame, true);
});

test("temperature", (t) => {
  t.is(venue.temperatureF, 72);
});

test("wind", (t) => {
  t.is(venue.wind, undefined);
});

test("wind (non-null)", (t) => {
  const copy = _.cloneDeep(inputData.venue[0]);
  const game = new Game();
  copy.$.wind = "10 mph NE";
  const parsedMod = game.parseVenue(copy);
  t.is(parsedMod.wind, "10 mph NE");
});

test("weather", (t) => {
  t.is(venue.weather, "indoors");
});

test("postseason game", (t) => {
  t.is(venue.postseasonGame, false);
});

test("conference game", (t) => {
  t.is(venue.conferenceGame, false);
});
