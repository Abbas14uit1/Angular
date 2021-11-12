import { test } from "ava";
import * as _ from "lodash";

// definitions
import * as Athlyte from "../../../../../../../../typings/athlyte/football";
import { VH } from "../../../../../../src/lib/importer/AthlyteImporter";

// classes
import { Game } from "../../../../../../src/lib/importer/statcrew/football/game";
import { Play } from "../../../../../../src/lib/importer/statcrew/football/play";
import { Player } from "../../../../../../src/lib/importer/statcrew/football/player";
import { Team } from "../../../../../../src/lib/importer/statcrew/football/team";

test("add a game reference", (t) => {
  const team = new Team();
  team.parsedData.games = {} as any;
  team.updateGameRef("AA");
  t.is(team.parsedData.games.gameId, "AA");
});

test("add a player reference", (t) => {
  const team = new Team();
  team.parsedData.games.players = [] as any;
  team.updatePlayerRef("AA");
  t.deepEqual(team.parsedData.games.players, ["AA"]);
});

test("update game reference", (t) => {
  const team = new Team();
  const game = new Game();
  team.parsedData._id = "AA";
  team.parsedData.games = { homeAway: VH.home } as any;
  team.registerDependents([game]);
  team.updateDependents();
  t.is(game.parsedData.teamIds.home, "AA");
});

test("update player reference", (t) => {
  const team = new Team();
  const player = new Player();
  team.parsedData._id = "AA";
  team.registerDependents([player]);
  team.updateDependents();
  t.is(player.parsedData.teamId, "AA");
});

test("update invalid reference", (t) => {
  const team = new Team();
  const teamDependent = new Team();
  const play = new Play();
  team.registerDependents([teamDependent]);
  teamDependent.registerDependents([play]);
  t.throws(() => team.updateDependents());
  t.throws(() => teamDependent.updateDependents());
});

test("prepareDynamicData throws error before game ref set", (t) => {
  const team = new Team();
  team.parsedData._id = "AA";
  t.throws(() => team.prepareDynamicData());
  t.throws(() => team.prepareDynamicData());
});

test("prepareStaticData throws error before id set", (t) => {
  const team = new Team();
  t.throws(() => team.prepareStaticData());
});

test("getAlreadyExists throws error when called before ID is checked in DB", (t) => {
  const team = new Team();
  t.throws(() => team.getAlreadyExists());
});

test("Prepare to save/update a team", (t) => {
  const team = new Team();
  team.parsedData._id = "AA";
  team.parsedData.games.players = [] as any;
  team.parsedData.games.gameId = "GA";
  team.updatePlayerRef("PA");
  t.is(team.prepareStaticData()._id, "AA");
  t.deepEqual(team.prepareDynamicData().players, ["PA"]);
});
