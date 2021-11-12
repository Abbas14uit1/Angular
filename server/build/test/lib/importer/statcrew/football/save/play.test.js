"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
// classes
const game_1 = require("../../../../../../src/lib/importer/statcrew/football/game");
const play_1 = require("../../../../../../src/lib/importer/statcrew/football/play");
const player_1 = require("../../../../../../src/lib/importer/statcrew/football/player");
const team_1 = require("../../../../../../src/lib/importer/statcrew/football/team");
ava_1.test("register a dependent (tests base class)", (t) => {
    const play = new play_1.Play();
    const game = new game_1.Game();
    play.registerDependents([game]);
    t.deepEqual([game], play.dependents);
});
ava_1.test("set MongoSaver id (tests base )", (t) => {
    const play = new play_1.Play();
    play.parsedData._id = "aa";
    t.deepEqual("aa", play.getId());
});
ava_1.test("add a player reference", (t) => {
    const play = new play_1.Play();
    play.updatePlayerRef("0A", "0A");
    t.deepEqual(["0A"], play.parsedData.playerIds);
});
ava_1.test("add a game reference", (t) => {
    const play = new play_1.Play();
    play.updateGameRef("AA");
    t.deepEqual("AA", play.parsedData.gameId);
});
ava_1.test("update a game dependent", (t) => {
    const play = new play_1.Play();
    const game = new game_1.Game();
    play.parsedData._id = "AA";
    play.registerDependents([game]);
    play.updateDependents();
    t.deepEqual(["AA"], game.parsedData.playIds);
});
ava_1.test("update a player dependent", (t) => {
    const play = new play_1.Play();
    const player = new player_1.Player();
    player.parsedData.games = [{ plays: [] }];
    play.parsedData._id = "AA";
    play.registerDependents([player]);
    play.updateDependents();
    t.deepEqual(["AA"], player.parsedData.games[0].plays);
});
ava_1.test("update a dependent that shouldn't be a dependent of play", (t) => {
    const play = new play_1.Play();
    const playDependent = new play_1.Play();
    const team = new team_1.Team();
    play.registerDependents([playDependent]);
    playDependent.registerDependents([team]);
    t.throws(() => play.updateDependents());
    t.throws(() => playDependent.updateDependents());
});
ava_1.test("preparing data for save before setting IDs throws an error", (t) => {
    const play = new play_1.Play();
    t.throws(() => play.prepareDynamicData());
});
ava_1.test("prepare play for saving", (t) => {
    const play = new play_1.Play();
    play.parsedData._id = "AA";
    play.updateGameRef("GA");
    play.updatePlayerRef("0A", "0A");
    t.deepEqual(play.prepareDynamicData(), {
        _id: "AA",
        gameId: "GA",
        playerIds: ["0A"],
    });
});
//# sourceMappingURL=play.test.js.map