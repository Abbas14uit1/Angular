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
const jsonfile = require("jsonfile");
const path = require("path");
const pify = require("pify");
const gamePath = path.join(__dirname, "..", "fixtures", "json", "parsed", "gameBasketball.json");
const playersPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "playersBasketball.json");
const playsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "playsBasketball.json");
const teamsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "teamsBasketball.json");
function getGameData() {
    return __awaiter(this, void 0, void 0, function* () {
        const game = yield pify(jsonfile.readFile)(gamePath);
        game.gameDate = new Date(game.gameDate);
        return game;
    });
}
exports.getGameData = getGameData;
function getPlayersData() {
    return __awaiter(this, void 0, void 0, function* () {
        const players = yield pify(jsonfile.readFile)(playersPath);
        players.forEach((player) => {
            const games = player.games;
            games.forEach((game) => game.gameDate = new Date(game.gameDate));
        });
        return players;
    });
}
exports.getPlayersData = getPlayersData;
function getPlaysData() {
    return __awaiter(this, void 0, void 0, function* () {
        const plays = yield pify(jsonfile.readFile)(playsPath);
        return plays;
    });
}
exports.getPlaysData = getPlaysData;
/**
 * Returns array with only one team
 */
function getTeamData() {
    return __awaiter(this, void 0, void 0, function* () {
        const teams = yield pify(jsonfile.readFile)(teamsPath);
        teams.forEach((team) => {
            const games = team.games;
            //games.forEach((game) => {
            games.gameDate = new Date(games.gameDate);
            //});
        });
        return teams;
    });
}
exports.getTeamData = getTeamData;
//# sourceMappingURL=classFixtureLoaderBasketball.js.map