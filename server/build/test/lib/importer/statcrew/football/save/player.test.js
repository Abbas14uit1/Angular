"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const _ = require("lodash");
const classFixtureLoader_1 = require("../../../../../helpers/classFixtureLoader");
// classes
const game_1 = require("../../../../../../src/lib/importer/statcrew/football/game");
const play_1 = require("../../../../../../src/lib/importer/statcrew/football/play");
const player_1 = require("../../../../../../src/lib/importer/statcrew/football/player");
const team_1 = require("../../../../../../src/lib/importer/statcrew/football/team");
let playerData;
ava_1.test.before("Get player data", (t) => __awaiter(this, void 0, void 0, function* () {
    playerData = yield classFixtureLoader_1.getPlayersData();
}));
ava_1.test("updating dynamic refs changes the games object of a player", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.parsedData = _.cloneDeep(playerData[0]);
    processedPlayer.parsedData.games = [{ gameId: undefined, plays: [] }];
    processedPlayer.updateGameRef("BAZ");
    processedPlayer.updatePlayRef("Fizz");
    processedPlayer.updatePlayRef("Buzz");
    t.deepEqual(processedPlayer.prepareDynamicData(), {
        games: [{
                gameId: "BAZ",
                plays: ["Fizz", "Buzz"],
            }],
    });
});
ava_1.test("preparing dynamic data throws errors when necessary references don't exist", (t) => {
    const processedPlayer = new player_1.Player();
    t.throws(() => processedPlayer.prepareDynamicData());
});
ava_1.test("preparsing static data throws errors when necessary references don't exist", (t) => {
    const player = new player_1.Player();
    t.throws(() => player.prepareStaticData());
});
ava_1.test("base: getId() throws error when ID has not yet been set", (t) => {
    const processedPlayer = new player_1.Player();
    t.throws(() => processedPlayer.getId());
});
ava_1.test("updatePlayRef adds a play ID reference to the player", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.parsedData.games = [{ plays: [] }];
    processedPlayer.updatePlayRef("foo");
    t.deepEqual(processedPlayer.parsedData.games[0].plays, ["foo"]);
});
ava_1.test("updateGameRef adds a game ID to the player", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.parsedData.games = [{}];
    processedPlayer.updateGameRef("foo");
    t.is(processedPlayer.parsedData.games[0].gameId, "foo");
});
ava_1.test("updateTeamRef adds a team ID to the player", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.updateTeamRef("foo");
    t.is(processedPlayer.parsedData.teamId, "foo");
});
ava_1.test("Update dependents adds the player's ID to its registered dependents", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.parsedData._id = "FOO";
    processedPlayer.parsedData.games = [{ codeInGame: "FOO" }];
    const teamDep = new team_1.Team();
    teamDep.parsedData.games.players = [];
    const gameDep = new game_1.Game();
    const playDep = new play_1.Play();
    processedPlayer.registerDependents([teamDep, playDep, gameDep]);
    t.is(processedPlayer.dependents.length, 3);
    processedPlayer.updateDependents();
    t.not(gameDep.parsedData.playerIds.indexOf("FOO"), -1);
    t.not(teamDep.parsedData.games.players.indexOf("FOO"), -1);
    t.not(playDep.parsedData.playerIds.indexOf("FOO"), -1);
});
ava_1.test("Update dependents throws error when an invalid dependent has been registered", (t) => {
    const processedPlayer = new player_1.Player();
    processedPlayer.parsedData._id = ("FOO");
    const gameDep = new player_1.Player();
    processedPlayer.registerDependents([gameDep]);
    t.throws(() => processedPlayer.updateDependents());
});
ava_1.test("getAlreadyExists throws error when DB has not yet been checked", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    t.throws(() => player.getAlreadyExists());
}));
//# sourceMappingURL=player.test.js.map