import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";

import { playerNameRoute } from "../../../../src/routes/api_v1/players/tidyName.route";
import { getGameData, getPlayersData, getPlaysData, getTeamData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

import { Player } from "../../../../src/lib/importer/statcrew/football/player";

let players: Athlyte.IPlayer[];
const sportCode = 'MFB';

function makePlayerClasses(): Player[] {
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass.parsedData = _.cloneDeep(player);
    playerClass._setAlreadyExists(false);
    return playerClass;
  });
  return playerClasses;
}

test.before("read player data", async (t) => {
  players = await getPlayersData();
});

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
  t.context.players = makePlayerClasses();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.get("/:sportCode/:tidyName", playerNameRoute);
  app.get("/:sportCode/:tidyName/aggregate", playerNameRoute);
  app.locals.db = db;
  return app;
}

test("Get single player record from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);
  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}`);
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  // body is automatically converted to object from JSON by superagent
  const playerInfo = getRes.body.data as Athlyte.IPlayer;
  t.truthy(playerInfo);
  t.is(playerInfo.games[0].playerClass, player.parsedData.games[0].playerClass);
  t.is(playerInfo.games[0].codeInGame, player.parsedData.games[0].codeInGame);
  t.is(playerInfo.name, player.parsedData.name);
  t.is(playerInfo.teamName, player.parsedData.teamName);
  t.is(playerInfo.tidyName, player.parsedData.tidyName);
  const stats = playerInfo.games[0].stats;
  t.deepEqual(stats, player.parsedData.games[0].stats);
});

test("Get a player's stats from a certain season", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);
  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}`)
    .query({ season: 2016 });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.games.length, player.parsedData.games.length);
});

test("Get a player's stats from a certain season, malformed season", async (t) => {
  const app: express.Express = t.context.app;
  const getRes = await request(app)
    .get("/${sportCode}/MADE,UP")
    .query({ season: "foobar" });
  t.not(getRes.body.errors, undefined);
  t.is(getRes.status, 406);
});

test("Get aggregate stats from a certain season", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);
  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
    .query({ season: 2016 });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.started,
    player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
  t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
});

test("Get aggregate stats from a date range", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);

  // put in 2015 stats that should be ignored
  const player2015 = new Player();
  player2015._setAlreadyExists(true);
  player2015.parsedData = _.cloneDeep(players[0]);
  player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
  await player2015.save(db);

  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
    .query({ from: "2016-01-01", to: "2017-01-01" });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.started,
    player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
  t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
});

test("Get aggregate stats from after a date", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);

  // put in 2015 stats that should be ignored
  const player2015 = new Player();
  player2015._setAlreadyExists(true);
  player2015.parsedData = _.cloneDeep(players[0]);
  player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
  await player2015.save(db);

  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
    .query({ from: "2016-01-01" });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.started,
    player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
  t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
});

test("Get aggregate stats up to a date", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const player = playerClasses[0];
  await player.save(db);

  // put in 2015 stats that should be ignored
  const player2015 = new Player();
  player2015._setAlreadyExists(true);
  player2015.parsedData = _.cloneDeep(players[0]);
  player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
  await player2015.save(db);

  const getRes = await request(app)
    .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
    .query({ from: "2016-01-01" });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data.started,
    player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
  t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
});

test("Aggregate stats for player, no data for player", async (t) => {
  const app: express.Express = t.context.app;
  const getRes = await request(app)
    .get("/${sportCode}/MADE,UP/aggregate");
  t.not(getRes.body.errors, undefined);
  t.is(getRes.status, 404);
});

test("Aggregate stats returns 406 when too many parameters supplied", async (t) => {
  const app: express.Express = t.context.app;
  const getRes = await request(app)
    .get("/${sportCode}/HURTS,JALEN/aggregate")
    .query({ from: "2016-01-01", to: "2017-01-01", season: 2016 });
  t.is(getRes.status, 406);
});
