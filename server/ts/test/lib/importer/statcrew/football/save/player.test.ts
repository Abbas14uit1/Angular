import { test } from "ava";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";

import { getPlayersData } from "../../../../../helpers/classFixtureLoader";

// interfaces
import * as Athlyte from "../../../../../../../../typings/athlyte/football";
import { IPlay, ITeam } from "../../../../../../../../typings/athlyte/football";
import {
  IPerGamePlayerStats, IPlayer,
  IPlayerDynamicData, IPlayerStaticData,
} from "../../../../../../../../typings/athlyte/football/player.d";
import { VH } from "../../../../../../src/lib/importer/AthlyteImporter";

// classes
import { Game } from "../../../../../../src/lib/importer/statcrew/football/game";
import { Play } from "../../../../../../src/lib/importer/statcrew/football/play";
import { Player } from "../../../../../../src/lib/importer/statcrew/football/player";
import { Team } from "../../../../../../src/lib/importer/statcrew/football/team";

let playerData: Athlyte.IPlayer[];

test.before("Get player data", async (t) => {
  playerData = await getPlayersData();
});

test("updating dynamic refs changes the games object of a player", (t) => {
  const processedPlayer = new Player();
  processedPlayer.parsedData = _.cloneDeep(playerData[0]);
  processedPlayer.parsedData.games = [{ gameId: undefined, plays: [] } as any];
  processedPlayer.updateGameRef("BAZ");
  processedPlayer.updatePlayRef("Fizz");
  processedPlayer.updatePlayRef("Buzz");
  t.deepEqual(processedPlayer.prepareDynamicData(), {
    games: [{
      gameId: "BAZ",
      plays: ["Fizz", "Buzz"],
    }],
  } as IPlayerDynamicData);
});

test("preparing dynamic data throws errors when necessary references don't exist", (t) => {
  const processedPlayer = new Player();
  t.throws(() => processedPlayer.prepareDynamicData());
});

test("preparsing static data throws errors when necessary references don't exist", (t) => {
  const player = new Player();
  t.throws(() => player.prepareStaticData());
});

test("base: getId() throws error when ID has not yet been set", (t) => {
  const processedPlayer = new Player();
  t.throws(() => processedPlayer.getId());
});

test("updatePlayRef adds a play ID reference to the player", (t) => {
  const processedPlayer = new Player();
  processedPlayer.parsedData.games = [{ plays: [] }] as any;
  processedPlayer.updatePlayRef("foo");
  t.deepEqual((processedPlayer.parsedData as IPlayer).games[0].plays,
    ["foo"]);
});

test("updateGameRef adds a game ID to the player", (t) => {
  const processedPlayer = new Player();
  processedPlayer.parsedData.games = [{}] as any;
  processedPlayer.updateGameRef("foo");
  t.is((processedPlayer.parsedData as IPlayer).games[0].gameId, "foo");
});

test("updateTeamRef adds a team ID to the player", (t) => {
  const processedPlayer = new Player();
  processedPlayer.updateTeamRef("foo");
  t.is(processedPlayer.parsedData.teamId, "foo");
});

test("Update dependents adds the player's ID to its registered dependents", (t) => {
  const processedPlayer = new Player();
  processedPlayer.parsedData._id = "FOO";
  processedPlayer.parsedData.games = [{ codeInGame: "FOO" } as IPerGamePlayerStats];
  const teamDep = new Team();
  teamDep.parsedData.games.players = [] as any;
  const gameDep = new Game();
  const playDep = new Play();
  processedPlayer.registerDependents([teamDep, playDep, gameDep]);
  t.is(processedPlayer.dependents.length, 3);
  processedPlayer.updateDependents();
  t.not((gameDep.parsedData as Athlyte.IGame).playerIds.indexOf("FOO"), -1);
  t.not(teamDep.parsedData.games.players.indexOf("FOO"), -1);
  t.not((playDep.parsedData as Athlyte.IPlay).playerIds.indexOf("FOO"), -1);
});

test("Update dependents throws error when an invalid dependent has been registered", (t) => {
  const processedPlayer = new Player();
  processedPlayer.parsedData._id = ("FOO");
  const gameDep = new Player();
  processedPlayer.registerDependents([gameDep]);
  t.throws(() => processedPlayer.updateDependents());
});

test("getAlreadyExists throws error when DB has not yet been checked", async (t) => {
  const player = new Player();
  t.throws(() => player.getAlreadyExists());
});
