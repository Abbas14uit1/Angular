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

test("prepareForSave throws errors when references don't exist", (t) => {
  const game = new Game();
  game.parsedData._id = "FOO";
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before team IDs have been populated");
  game.updateTeamRef(VH.home, "foo");
  game.updateTeamRef(VH.visitor, "bar");
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before player IDs have been populated");
  game.updatePlayerRef("player");
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before play IDs have been populated");
  game.updatePlayRef("play");
  t.notThrows(() => game.prepareDynamicData());
});

test("add a play reference", (t) => {
  const game = new Game();
  game.updatePlayRef("AA");
  t.deepEqual(game.parsedData.playIds, ["AA"]);
});

test("add a home team reference", (t) => {
  const game = new Game();
  game.updateTeamRef(VH.home, "HA");
  t.deepEqual(game.parsedData.teamIds.home, "HA");
});

test("add an away team reference", (t) => {
  const game = new Game();
  game.updateTeamRef(VH.visitor, "VA");
  t.deepEqual(game.parsedData.teamIds.visitor, "VA");
});

test("adding an unexpected team throws an exception", (t) => {
  const game = new Game();
  t.throws(() => game.updateTeamRef("A" as any, "AA"));
});

test("add a play reference", (t) => {
  const game = new Game();
  game.updatePlayRef("AA");
  t.deepEqual(game.parsedData.playIds, ["AA"]);
});

test("add a player reference", (t) => {
  const game = new Game();
  game.updatePlayerRef("0A");
  t.deepEqual(game.parsedData.playerIds, ["0A"]);
});

test("update a team dependent", (t) => {
  const game = new Game();
  const team = new Team();
  game.parsedData._id = "AA";
  team.parsedData.games = [{}] as any;
  game.registerDependents([team]);
  game.updateDependents();
  t.deepEqual(team.parsedData.games.gameId, "AA");
});

test("update a player dependent", (t) => {
  const game = new Game();
  const player = new Player();
  player.parsedData.games = [{}] as any;
  game.parsedData._id = "AA";
  game.registerDependents([player]);
  game.updateDependents();
  t.deepEqual(player.parsedData.games[0].gameId, "AA");
});

test("update a play dependent", (t) => {
  const game = new Game();
  const play = new Play();
  game.parsedData._id = "AA";
  game.registerDependents([play]);
  game.updateDependents();
  t.deepEqual((play.parsedData as Athlyte.IPlay).gameId, "AA");
});

test("update invalid game dependent", (t) => {
  const game = new Game();
  const secondGame = new Game();
  game.parsedData._id = "AA";
  game.registerDependents([secondGame]);
  t.throws(() => game.updateDependents());
});

test("prepare game for saving", (t) => {
  const game = new Game();
  game.parsedData._id = "AA";
  game.updateTeamRef(VH.home, "HA");
  game.updateTeamRef(VH.visitor, "VA");
  game.updatePlayerRef("PA");
  game.updatePlayRef("PLA");
  t.deepEqual(game.prepareDynamicData(), {
    _id: "AA",
    teamIds: {
      home: "HA",
      visitor: "VA",
    },
    playIds: ["PLA"],
    playerIds: ["PA"],
  } as any);
});

test("Errors on prepareDynamicData before populating all ID fields", (t) => {
  const game = new Game();
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before ID field has been populated");
  game.parsedData._id = "foo";
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before team IDs have been populated");
  game.parsedData.teamIds = {
    home: "home",
    visitor: "visitor",
  };
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before player IDs have been populated");
  game.parsedData.playerIds = ["player"];
  t.throws(() => game.prepareDynamicData(), "Trying to save game data before play IDs have been populated");
  game.parsedData.playIds = ["play"];
  t.notThrows(() => game.prepareDynamicData());
});

test("getAlreadyExists throws error when ID has not been checked", (t) => {
  const game = new Game();
  t.throws(() => game.getAlreadyExists());
});

test("Drive summary has team IDs in it", (t) => {
  const game = new Game();
  game.parsedData.summary = {} as any;
  game.parsedData.summary.driveDetails = [{
    drivingTeam: VH.home,
    drivingTeamId: undefined,
    drivingTeamName: "UA",
    startPlay: {
      clock: "12:30",
      fieldPos: { endzone: false, side: VH.home, yardline: 40 },
      playType: "KO",
      quarter: 1,
    },
    endPlay: {
      clock: "12:00",
      fieldPos: { endzone: false, side: VH.visitor, yardline: 40 },
      playType: "PUNT",
      quarter: 1,
    },
    plays: 3,
    timeOfPossession: "0:30",
    yards: 20,
  }];
  const team = new Team();
  team.parsedData.games = { homeAway: VH.home } as any;
  team.parsedData._id = "team";
  team.registerDependents([game]);
  team.updateDependents();
  t.is(game.parsedData.summary.driveDetails[0].drivingTeamId, team.parsedData._id);
});
