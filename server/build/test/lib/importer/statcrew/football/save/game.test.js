"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const AthlyteImporter_1 = require("../../../../../../src/lib/importer/AthlyteImporter");
// classes
const game_1 = require("../../../../../../src/lib/importer/statcrew/football/game");
const play_1 = require("../../../../../../src/lib/importer/statcrew/football/play");
const player_1 = require("../../../../../../src/lib/importer/statcrew/football/player");
const team_1 = require("../../../../../../src/lib/importer/statcrew/football/team");
ava_1.test("prepareForSave throws errors when references don't exist", (t) => {
    const game = new game_1.Game();
    game.parsedData._id = "FOO";
    t.throws(() => game.prepareDynamicData(), "Trying to save game data before team IDs have been populated");
    game.updateTeamRef(AthlyteImporter_1.VH.home, "foo");
    game.updateTeamRef(AthlyteImporter_1.VH.visitor, "bar");
    t.throws(() => game.prepareDynamicData(), "Trying to save game data before player IDs have been populated");
    game.updatePlayerRef("player");
    t.throws(() => game.prepareDynamicData(), "Trying to save game data before play IDs have been populated");
    game.updatePlayRef("play");
    t.notThrows(() => game.prepareDynamicData());
});
ava_1.test("add a play reference", (t) => {
    const game = new game_1.Game();
    game.updatePlayRef("AA");
    t.deepEqual(game.parsedData.playIds, ["AA"]);
});
ava_1.test("add a home team reference", (t) => {
    const game = new game_1.Game();
    game.updateTeamRef(AthlyteImporter_1.VH.home, "HA");
    t.deepEqual(game.parsedData.teamIds.home, "HA");
});
ava_1.test("add an away team reference", (t) => {
    const game = new game_1.Game();
    game.updateTeamRef(AthlyteImporter_1.VH.visitor, "VA");
    t.deepEqual(game.parsedData.teamIds.visitor, "VA");
});
ava_1.test("adding an unexpected team throws an exception", (t) => {
    const game = new game_1.Game();
    t.throws(() => game.updateTeamRef("A", "AA"));
});
ava_1.test("add a play reference", (t) => {
    const game = new game_1.Game();
    game.updatePlayRef("AA");
    t.deepEqual(game.parsedData.playIds, ["AA"]);
});
ava_1.test("add a player reference", (t) => {
    const game = new game_1.Game();
    game.updatePlayerRef("0A");
    t.deepEqual(game.parsedData.playerIds, ["0A"]);
});
ava_1.test("update a team dependent", (t) => {
    const game = new game_1.Game();
    const team = new team_1.Team();
    game.parsedData._id = "AA";
    team.parsedData.games = [{}];
    game.registerDependents([team]);
    game.updateDependents();
    t.deepEqual(team.parsedData.games.gameId, "AA");
});
ava_1.test("update a player dependent", (t) => {
    const game = new game_1.Game();
    const player = new player_1.Player();
    player.parsedData.games = [{}];
    game.parsedData._id = "AA";
    game.registerDependents([player]);
    game.updateDependents();
    t.deepEqual(player.parsedData.games[0].gameId, "AA");
});
ava_1.test("update a play dependent", (t) => {
    const game = new game_1.Game();
    const play = new play_1.Play();
    game.parsedData._id = "AA";
    game.registerDependents([play]);
    game.updateDependents();
    t.deepEqual(play.parsedData.gameId, "AA");
});
ava_1.test("update invalid game dependent", (t) => {
    const game = new game_1.Game();
    const secondGame = new game_1.Game();
    game.parsedData._id = "AA";
    game.registerDependents([secondGame]);
    t.throws(() => game.updateDependents());
});
ava_1.test("prepare game for saving", (t) => {
    const game = new game_1.Game();
    game.parsedData._id = "AA";
    game.updateTeamRef(AthlyteImporter_1.VH.home, "HA");
    game.updateTeamRef(AthlyteImporter_1.VH.visitor, "VA");
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
    });
});
ava_1.test("Errors on prepareDynamicData before populating all ID fields", (t) => {
    const game = new game_1.Game();
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
ava_1.test("getAlreadyExists throws error when ID has not been checked", (t) => {
    const game = new game_1.Game();
    t.throws(() => game.getAlreadyExists());
});
ava_1.test("Drive summary has team IDs in it", (t) => {
    const game = new game_1.Game();
    game.parsedData.summary = {};
    game.parsedData.summary.driveDetails = [{
            drivingTeam: AthlyteImporter_1.VH.home,
            drivingTeamId: undefined,
            drivingTeamName: "UA",
            startPlay: {
                clock: "12:30",
                fieldPos: { endzone: false, side: AthlyteImporter_1.VH.home, yardline: 40 },
                playType: "KO",
                quarter: 1,
            },
            endPlay: {
                clock: "12:00",
                fieldPos: { endzone: false, side: AthlyteImporter_1.VH.visitor, yardline: 40 },
                playType: "PUNT",
                quarter: 1,
            },
            plays: 3,
            timeOfPossession: "0:30",
            yards: 20,
        }];
    const team = new team_1.Team();
    team.parsedData.games = { homeAway: AthlyteImporter_1.VH.home };
    team.parsedData._id = "team";
    team.registerDependents([game]);
    team.updateDependents();
    t.is(game.parsedData.summary.driveDetails[0].drivingTeamId, team.parsedData._id);
});
//# sourceMappingURL=game.test.js.map