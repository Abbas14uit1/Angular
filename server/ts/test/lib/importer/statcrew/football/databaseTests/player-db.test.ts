import { test } from "ava";
import * as _ from "lodash";
import * as mongo from "mongodb";

import { getPlayersData } from "../../../../../helpers/classFixtureLoader";
import { getConnection } from "../../../../../helpers/connectDb";

// interfaces
import * as Athlyte from "../../../../../../../../typings/athlyte/football";
import { VH } from "../../../../../../src/lib/importer/AthlyteImporter";

// classes
import { Game } from "../../../../../../src/lib/importer/statcrew/football/game";
import { Play } from "../../../../../../src/lib/importer/statcrew/football/play";
import { Player } from "../../../../../../src/lib/importer/statcrew/football/player";
import { Team } from "../../../../../../src/lib/importer/statcrew/football/team";

let playerData: Athlyte.IPlayer[];

test.before("Get players data", async (t) => {
  playerData = await getPlayersData();
});

test.beforeEach("connect to DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop database", async (t) => {
  if (t.context.state === "failed") {
    // a test just failed
  } else {
    await t.context.db.dropDatabase();
  }
});

test("Save a single player (that doesn't exist yet) to database", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  const savedId = await player.save(t.context.db);
  t.is(savedId, player.parsedData._id);
});

test("Update an existing player in database", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameId = "game2";
  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 2);
});


test("create a new player with same name in different team", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.teamCode = 9;
  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);
  t.is(players[0].games.length, 1);
});


test("create a player with same name and same team", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2007-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2007";
  playerUpdate.parsedData.games[0].season = 2007;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);
  t.is(players[0].games.length, 1);
});


test("create a player with same name and class as SR in the same team for a different season", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
  playerUpdate.parsedData.games[0].season = 2017;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 2);
});


test("create a player with same name and class as FR in the same team for a different season", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player.parsedData.games[0].playerClass = "FR";
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].playerClass = "FR";
  playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
  playerUpdate.parsedData.games[0].season = 2017;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 2);
});

test("create 3 player with the same team, same player class for a different decreasing season", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2015";
  playerUpdate.parsedData.games[0].season = 2015;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2014";
  playerUpdate2.parsedData.games[0].season = 2014;

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);
  t.is(players[0].games.length, 2);

});

test("create 3 player with the same team, different player class for a different decreasing season", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2015";
  playerUpdate.parsedData.games[0].season = 2015;
  playerUpdate.parsedData.games[0].playerClass = "JR";

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2014";
  playerUpdate2.parsedData.games[0].season = 2014;
  playerUpdate2.parsedData.games[0].playerClass = "SO";

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 3);

});



test("create 3 player with the same team, same player class for a different season moving forward", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
  playerUpdate.parsedData.games[0].season = 2017;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2018-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2018";
  playerUpdate2.parsedData.games[0].season = 2018;

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);
  t.is(players[0].games.length, 2);

});

test("create 3 player with the same team, different player class for a different season moving forward", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player.parsedData.games[0].playerClass = "FR";
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
  playerUpdate.parsedData.games[0].season = 2017;
  playerUpdate.parsedData.games[0].playerClass = "SO";

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2018-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2018";
  playerUpdate2.parsedData.games[0].season = 2018;
  playerUpdate.parsedData.games[0].playerClass = "JR";

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 3);

});


test("create 3 player with the same team, same player class for inbetween seasons", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2014";
  playerUpdate.parsedData.games[0].season = 2014;

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2015";
  playerUpdate2.parsedData.games[0].season = 2015;

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);


});

test("create 3 player with the same team, different player class for inbetween season", async (t) => {
  const player = new Player();
  player.parsedData = _.cloneDeep(playerData[0]);
  player._setAlreadyExists(false);
  await player.save(t.context.db);
  const playerUpdate = new Player();
  playerUpdate.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
  playerUpdate.parsedData.games[0].actualDate = "03/09/2014";
  playerUpdate.parsedData.games[0].season = 2014;
  playerUpdate.parsedData.games[0].playerClass = "JR";

  playerUpdate.populateId(await playerUpdate.generateId(t.context.db));
  await playerUpdate.save(t.context.db);

  const playerUpdate2 = new Player();
  playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
  playerUpdate2.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
  playerUpdate2.parsedData.games[0].actualDate = "03/09/2015";
  playerUpdate2.parsedData.games[0].season = 2015;
  playerUpdate2.parsedData.games[0].playerClass = "SO";

  playerUpdate2.populateId(await playerUpdate2.generateId(t.context.db));
  await playerUpdate2.save(t.context.db);

  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 2);


});