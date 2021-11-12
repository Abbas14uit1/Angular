import { test } from "ava";
import * as mongo from "mongodb";

import { FootballImporter } from "../../../../../src/lib/importer/statcrew/football/footballImporter";
import { getConnection } from "../../../../helpers/connectDb";
import { readJson } from "../_data.helper";

// definitions
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";

let data: IStatcrewFootballJSON;

test.before("read JSON", async (t) => {
  data = await readJson();
});

test.beforeEach("connect DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.db.dropDatabase();
});

test("Removing a game from the database", async (t) => {
  const db: mongo.Db = t.context.db;
  const importer = new FootballImporter();
  importer.parse(data);
  const { gameId, playIds, playerIds, homeId, visitorId } =
    await importer.saveToMongo(db);
  t.true((await db.collection("games").find({}).toArray()).length > 0);
  t.true((await db.collection("teams").find({}).toArray()).length > 0);
  t.true((await db.collection("plays").find({}).toArray()).length > 0);
  t.true((await db.collection("players").find({}).toArray()).length > 0);
  await importer.removeGame(db);
  t.is((await db.collection("games").find({}).toArray()).length, 0);
  t.is((await db.collection("plays").find({}).toArray()).length, 0);
  t.is((await db.collection("players").find({}).limit(1).toArray())[0].games.length, 0);
  t.is((await db.collection("teams").find({}).limit(1).toArray())[0].games.length, 0);
});

test("Automatically removes games from database if it already exists", async (t) => {
  const db: mongo.Db = t.context.db;
  const importer = new FootballImporter();
  importer.parse(data);
  const firstSave = await importer.saveToMongo(db);
  const secondSave = await importer.saveToMongo(db);
  t.is((await db.collection("games").find({}).toArray()).length, 1);
});
