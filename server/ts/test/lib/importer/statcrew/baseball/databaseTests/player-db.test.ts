import { test } from "ava";
import * as _ from "lodash";
import * as mongo from "mongodb";

import { getPlayersData } from "../../../../../helpers/classFixtureLoaderBaseball";
import { getConnection } from "../../../../../helpers/connectDb";

// interfaces
import * as Athlyte from "../../../../../../../../typings/athlyte/baseball";
import { VH } from "../../../../../../src/lib/importer/AthlyteImporter";

// classes
import { Game } from "../../../../../../src/lib/importer/statcrew/baseball/game";
import { Play } from "../../../../../../src/lib/importer/statcrew/baseball/play";
import { Player } from "../../../../../../src/lib/importer/statcrew/baseball/player";
import { Team } from "../../../../../../src/lib/importer/statcrew/baseball/team";

let playerData: Athlyte.IPlayer[];

test.before("Get players data", async (t) => {
  playerData = await getPlayersData();
});

test.beforeEach("connect to DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop database", async (t) => {
  await t.context.db.dropDatabase();
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
  player.parsedData = _.cloneDeep(playerData[0]);
  player.parsedData.games = [{
    gameId: "game2",
  } as any];
  player.populateId(await player.generateId(t.context.db, "MBA"));
  await player.save(t.context.db);
  const players = await t.context.db.collection("players").find({}).toArray();
  t.is(players.length, 1);
  t.is(players[0].games.length, 2);
});
