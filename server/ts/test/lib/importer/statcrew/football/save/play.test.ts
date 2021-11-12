import { test } from "ava";
import * as _ from "lodash";

// definitions
import * as Athlyte from "../../../../../../../../typings/athlyte/football";
import { IGame } from "../../../../../../../../typings/athlyte/football/game.d";
import { IPlay } from "../../../../../../../../typings/athlyte/football/play.d";
import { IPlayer } from "../../../../../../../../typings/athlyte/football/player.d";
import { ITeam } from "../../../../../../../../typings/athlyte/football/team.d";
import { VH } from "../../../../../../src/lib/importer/AthlyteImporter";

// classes
import { Game } from "../../../../../../src/lib/importer/statcrew/football/game";
import { Play } from "../../../../../../src/lib/importer/statcrew/football/play";
import { Player } from "../../../../../../src/lib/importer/statcrew/football/player";
import { Team } from "../../../../../../src/lib/importer/statcrew/football/team";

test("register a dependent (tests base class)", (t) => {
  const play = new Play();
  const game = new Game();
  play.registerDependents([game]);
  t.deepEqual([game], play.dependents);
});

test("set MongoSaver id (tests base )", (t) => {
  const play = new Play();
  play.parsedData._id = "aa";
  t.deepEqual("aa", play.getId());
});

test("add a player reference", (t) => {
  const play = new Play();
  play.updatePlayerRef("0A", "0A");
  t.deepEqual(["0A"], play.parsedData.playerIds);
});

test("add a game reference", (t) => {
  const play = new Play();
  play.updateGameRef("AA");
  t.deepEqual("AA", play.parsedData.gameId);
});

test("update a game dependent", (t) => {
  const play = new Play();
  const game = new Game();
  play.parsedData._id = "AA";
  play.registerDependents([game]);
  play.updateDependents();
  t.deepEqual(["AA"], game.parsedData.playIds);
});

test("update a player dependent", (t) => {
  const play = new Play();
  const player = new Player();
  player.parsedData.games = [{ plays: [] }] as any;
  play.parsedData._id = "AA";
  play.registerDependents([player]);
  play.updateDependents();
  t.deepEqual(["AA"], player.parsedData.games[0].plays);
});

test("update a dependent that shouldn't be a dependent of play", (t) => {
  const play = new Play();
  const playDependent = new Play();
  const team = new Team();
  play.registerDependents([playDependent]);
  playDependent.registerDependents([team]);
  t.throws(() => play.updateDependents());
  t.throws(() => playDependent.updateDependents());
});

test("preparing data for save before setting IDs throws an error", (t) => {
  const play = new Play();
  t.throws(() => play.prepareDynamicData());
});

test("prepare play for saving", (t) => {
  const play = new Play();
  play.parsedData._id = "AA";
  play.updateGameRef("GA");
  play.updatePlayerRef("0A", "0A");
  t.deepEqual(play.prepareDynamicData(), {
    _id: "AA",
    gameId: "GA",
    playerIds: ["0A"],
  } as IPlay);
});
