import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";
import * as Superlative from "../../../../src/enums/superlatives";
import { VH } from "../../../../src/lib/importer/AthlyteImporter";

import { allPlayersRoute } from "../../../../src/routes/api_v1/players/allPlayers.route";
import { getGameData, getPlayersData, getPlaysData, getTeamData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

import { Game } from "../../../../src/lib/importer/statcrew/football/game";
import { Player } from "../../../../src/lib/importer/statcrew/football/player";

let players: Athlyte.IPlayer[];
const sportCode = "MFB";

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
  app.get("/:sportCode/", allPlayersRoute);
  app.get("/:playerId/aggregate", allPlayersRoute);
  app.get("/:playerId/superlatives", allPlayersRoute);
  app.get("/:playerId/games", allPlayersRoute);
  app.get("/:playerId/playerStats", allPlayersRoute);
  app.get("/:sportCode/roasters/:teamId/:season", allPlayersRoute);
  app.get("/seasons/:sportCode/:teamId", allPlayersRoute);
  app.put("/", allPlayersRoute);
  app.locals.db = db;
  return app;
}

test("Get all players from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.true(getRes.body.data.length > 1);
  for (const player of getRes.body.data as Athlyte.IPlayer[]) {
    t.not(player.tidyName, undefined);
    t.true(player.teamName === "UA" || player.teamName === "USC");
  }
});

test("Get data for all players from a certain season", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/")
    .query({ season: 2016 });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.true(getRes.body.data.length > 1);
});

test("Get data for all players from a certain team", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  await playerClasses[0].save(db);
  const getRes = await request(app)
    .get("/"+sportCode+"/")
    .query({ teamId: playerClasses[0].parsedData.teamId });
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data[0].teamId, playerClasses[0].parsedData.teamId);
});

test("Get aggregate data for a player", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const playerFirstGame = new Player();
  playerFirstGame._setAlreadyExists(false);
  playerFirstGame.parsedData = _.cloneDeep(players[0]);
  playerFirstGame.parsedData.games[0].stats.receiving = {
    rcvLong: 10,
    rcvNum: 1,
    rcvTd: 1,
    rcvYards: 10,
  };
  const playerSecondGame = new Player();
  playerSecondGame._setAlreadyExists(true);
  playerSecondGame.parsedData = _.cloneDeep(players[0]);
  playerSecondGame.parsedData.games[0].stats.receiving = {
    // made up data
    rcvLong: 10,
    rcvNum: 1,
    rcvTd: 1,
    rcvYards: 10,
  };
  const savedId = await playerFirstGame.save(db);
  t.is(savedId, "player0");
  await playerSecondGame.save(db);
  const playerAggregate = await request(app)
    .get(`/${savedId}/aggregate`);
  t.is(playerAggregate.body.errors, undefined);
  t.is(playerAggregate.body.data.gamesPlayed, 2);
  t.is(playerAggregate.body.data.started, 2);
  t.deepEqual(playerAggregate.body.data.stats.receiving, {
    rcvLong: 10,
    rcvNum: 2,
    rcvTd: 2,
    rcvYards: 20,
  });
});

test("Malformed date on request returns a 406", async (t) => {
  const app: express.Express = t.context.app;
  const getRes = await request(app)
    .get("/"+sportCode+"/")
    .query({ season: "foobar" });
  t.is(getRes.status, 406);
});

test("Player aggregate within date range", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  const playerFirstGame = new Player();
  playerFirstGame._setAlreadyExists(false);
  playerFirstGame.parsedData = _.cloneDeep(players[0]);
  playerFirstGame.parsedData.games[0].stats.receiving = {
    rcvLong: 10,
    rcvNum: 1,
    rcvTd: 1,
    rcvYards: 10,
  };
  const playerSecondGame = new Player();
  playerSecondGame._setAlreadyExists(true);
  playerSecondGame.parsedData = _.cloneDeep(players[0]);
  playerSecondGame.parsedData.games[0].gameDate = new Date(2010, 1, 1); // date outside aggregate range
  playerSecondGame.parsedData.games[0].stats.receiving = {
    // made up data
    rcvLong: 10,
    rcvNum: 1,
    rcvTd: 1,
    rcvYards: 10,
  };
  const savedId = await playerFirstGame.save(db);
  t.is(savedId, "player0");
  await playerSecondGame.save(db);
  const playerAggregate = await request(app)
    .get(`/${savedId}/aggregate`)
    .query({ from: "2012-01-01", to: "2017-01-01" });
  t.is(playerAggregate.body.errrors, undefined);
  t.is(playerAggregate.body.data.gamesPlayed, 1);
});

test("Player aggregate for a season", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const player: Player = t.context.players[0];
  const savedId = await player.save(db);
  const playerAggregate = await request(app)
    .get(`/${savedId}/aggregate`)
    .query({ season: 2016 });
  t.is(playerAggregate.body.data.gamesPlayed, 1);
});

test("Too many query parameters throws an error on aggregation", async (t) => {
  const app: express.Express = t.context.app;
  const playerAggregate = await request(app)
    .get("/foobar/aggregate")
    .query({ from: "2012-01-01", to: "2017-01-01", season: 2016 });
  t.is(playerAggregate.status, 406);
  t.is(playerAggregate.body.errors[0].code, "DateError");
});

test("Aggregate over player's lifetime", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const player: Player = t.context.players[0];
  const savedId = await player.save(db);
  const playerAggregate = await request(app)
    .get(`/${savedId}/aggregate`);
  t.is(playerAggregate.body.data.gamesPlayed, 1);
});

test("Aggregate returns a 404 when the player doesn't exist", async (t) => {
  const app: express.Express = t.context.app;
  const playerAggregate = await request(app)
    .get(`/${new mongo.ObjectID().toHexString()}/aggregate`);
  t.is(playerAggregate.status, 404);
});

test("Retrieve players superlatives they have earned over their career", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const player: Player = t.context.players[0];
  const id = new mongo.ObjectID().toHexString();
  const superlative: Athlyte.ISuperlative = {
    _id: id,
    type: Superlative.Type.leader,
    value: 0,
    aggInfo: {
      aggType: Superlative.AggType.sum,
      aggTime: Superlative.AggTime.career,
      aggScope: Superlative.Scope.player,
      stat: "rushing.rushYards",
    },
    scope: Superlative.Scope.all,
    highest: true,
    results: ["rush"],
    holderInfo: {
      teamId: "team",
    },
  } as Athlyte.ISuperlative;
  await db.collection("superlatives").insertOne(superlative);
  const superlatives = await db.collection("superlatives").find({ _id: { $in: [id] } }).toArray();
  player.parsedData.games[0].superlatives = [id];
  const savedId = await player.save(db);
  const playerSuperlatives = await request(app)
    .get(`/${savedId}/superlatives`);
  t.is(playerSuperlatives.body.errors, undefined);
  t.is(playerSuperlatives.status, 200);
  t.deepEqual(playerSuperlatives.body.data, [{
    gameId: "game1",
    superlatives,
  }]);
});

test("Retrieve the information about the games a player participated in", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const player: Player = t.context.players[0];
  const game = new Game();
  game.parsedData = _.cloneDeep(await getGameData());
  const saveGameId = await game.save(db);
  player.parsedData.games[0].gameId = saveGameId;
  const savePlayerId = await player.save(db);
  const playerGames = await request(app)
    .get(`/${savePlayerId}/games`);
  playerGames.body.data[0].gameDate = new Date(playerGames.body.data[0].gameDate);
  t.is(playerGames.body.errors, undefined);
  t.is(playerGames.status, 200);
  t.deepEqual(playerGames.body.data, [game.parsedData]);
});


