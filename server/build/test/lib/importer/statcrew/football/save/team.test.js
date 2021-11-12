"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const AthlyteImporter_1 = require("../../../../../../src/lib/importer/AthlyteImporter");
// classes
const game_1 = require("../../../../../../src/lib/importer/statcrew/football/game");
const play_1 = require("../../../../../../src/lib/importer/statcrew/football/play");
const player_1 = require("../../../../../../src/lib/importer/statcrew/football/player");
const team_1 = require("../../../../../../src/lib/importer/statcrew/football/team");
ava_1.test("add a game reference", (t) => {
    const team = new team_1.Team();
    team.parsedData.games = {};
    team.updateGameRef("AA");
    t.is(team.parsedData.games.gameId, "AA");
});
ava_1.test("add a player reference", (t) => {
    const team = new team_1.Team();
    team.parsedData.games.players = [];
    team.updatePlayerRef("AA");
    t.deepEqual(team.parsedData.games.players, ["AA"]);
});
ava_1.test("update game reference", (t) => {
    const team = new team_1.Team();
    const game = new game_1.Game();
    team.parsedData._id = "AA";
    team.parsedData.games = { homeAway: AthlyteImporter_1.VH.home };
    team.registerDependents([game]);
    team.updateDependents();
    t.is(game.parsedData.teamIds.home, "AA");
});
ava_1.test("update player reference", (t) => {
    const team = new team_1.Team();
    const player = new player_1.Player();
    team.parsedData._id = "AA";
    team.registerDependents([player]);
    team.updateDependents();
    t.is(player.parsedData.teamId, "AA");
});
ava_1.test("update invalid reference", (t) => {
    const team = new team_1.Team();
    const teamDependent = new team_1.Team();
    const play = new play_1.Play();
    team.registerDependents([teamDependent]);
    teamDependent.registerDependents([play]);
    t.throws(() => team.updateDependents());
    t.throws(() => teamDependent.updateDependents());
});
ava_1.test("prepareDynamicData throws error before game ref set", (t) => {
    const team = new team_1.Team();
    team.parsedData._id = "AA";
    t.throws(() => team.prepareDynamicData());
    t.throws(() => team.prepareDynamicData());
});
ava_1.test("prepareStaticData throws error before id set", (t) => {
    const team = new team_1.Team();
    t.throws(() => team.prepareStaticData());
});
ava_1.test("getAlreadyExists throws error when called before ID is checked in DB", (t) => {
    const team = new team_1.Team();
    t.throws(() => team.getAlreadyExists());
});
ava_1.test("Prepare to save/update a team", (t) => {
    const team = new team_1.Team();
    team.parsedData._id = "AA";
    team.parsedData.games.players = [];
    team.parsedData.games.gameId = "GA";
    team.updatePlayerRef("PA");
    t.is(team.prepareStaticData()._id, "AA");
    t.deepEqual(team.prepareDynamicData().players, ["PA"]);
});
//# sourceMappingURL=team.test.js.map