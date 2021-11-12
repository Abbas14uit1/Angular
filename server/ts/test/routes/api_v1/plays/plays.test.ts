import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as pify from "pify";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";

import { playRoutes } from "../../../../src/routes/api_v1/plays/plays.route";
import { getPlaysData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

import { Play } from "../../../../src/lib/importer/statcrew/football/play";

let plays: Athlyte.IPlay[];

function makePlayClasses(): Play[] {
  const playClasses = plays.map((play) => {
    const playClass = new Play();
    playClass.parsedData = _.cloneDeep(play);
    return playClass;
  });
  return playClasses;
}

test.before("read play data", async (t) => {
  plays = await getPlaysData();
});

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
  t.context.plays = makePlayClasses();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.get("/", playRoutes);
  app.get("/:playId", playRoutes);
  app.locals.db = db;
  return app;
}

test("Get plays on empty DB returns empty array", async (t) => {
  const app: express.Express = t.context.app;
  const getRes = await request(app)
    .get("/");
  t.deepEqual(getRes.body.data, []);
});

test("Get all plays from mongo when no ID specified", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playClasses: Play[] = t.context.plays;
  await db.collection("plays").insertMany(playClasses.map((play) => play.prepareForBatchSave()));
  const getRes = await request(app)
    .get("/");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.true(getRes.body.data.length > 1);
  const play = getRes.body.data[0] as Athlyte.IPlay;
  t.not(play, undefined);
  t.is(typeof play.down, typeof 0);
});

test("Get a play information by playId", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playClasses: Play[] = t.context.plays;
  const play = playClasses[0];
  const playId = await play.save(db);
  const getRes = await request(app)
    .get(`/${playId}`);
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.playInGame, play.parsedData.playInGame);
});
