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
const express = require("express");
const _ = require("lodash");
const request = require("supertest");
const tidyName_route_1 = require("../../../../src/routes/api_v1/players/tidyName.route");
const classFixtureLoader_1 = require("../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../helpers/connectDb");
const player_1 = require("../../../../src/lib/importer/statcrew/football/player");
let players;
const sportCode = 'MFB';
function makePlayerClasses() {
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass.parsedData = _.cloneDeep(player);
        playerClass._setAlreadyExists(false);
        return playerClass;
    });
    return playerClasses;
}
ava_1.default.before("read player data", (t) => __awaiter(this, void 0, void 0, function* () {
    players = yield classFixtureLoader_1.getPlayersData();
}));
ava_1.default.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
    t.context.players = makePlayerClasses();
}));
ava_1.default.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.get("/:sportCode/:tidyName", tidyName_route_1.playerNameRoute);
        app.get("/:sportCode/:tidyName/aggregate", tidyName_route_1.playerNameRoute);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get single player record from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}`);
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    // body is automatically converted to object from JSON by superagent
    const playerInfo = getRes.body.data;
    t.truthy(playerInfo);
    t.is(playerInfo.games[0].playerClass, player.parsedData.games[0].playerClass);
    t.is(playerInfo.games[0].codeInGame, player.parsedData.games[0].codeInGame);
    t.is(playerInfo.name, player.parsedData.name);
    t.is(playerInfo.teamName, player.parsedData.teamName);
    t.is(playerInfo.tidyName, player.parsedData.tidyName);
    const stats = playerInfo.games[0].stats;
    t.deepEqual(stats, player.parsedData.games[0].stats);
}));
ava_1.default("Get a player's stats from a certain season", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}`)
        .query({ season: 2016 });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.games.length, player.parsedData.games.length);
}));
ava_1.default("Get a player's stats from a certain season, malformed season", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const getRes = yield request(app)
        .get("/${sportCode}/MADE,UP")
        .query({ season: "foobar" });
    t.not(getRes.body.errors, undefined);
    t.is(getRes.status, 406);
}));
ava_1.default("Get aggregate stats from a certain season", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
        .query({ season: 2016 });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.started, player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
    t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
}));
ava_1.default("Get aggregate stats from a date range", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    // put in 2015 stats that should be ignored
    const player2015 = new player_1.Player();
    player2015._setAlreadyExists(true);
    player2015.parsedData = _.cloneDeep(players[0]);
    player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
    yield player2015.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
        .query({ from: "2016-01-01", to: "2017-01-01" });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.started, player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
    t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
}));
ava_1.default("Get aggregate stats from after a date", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    // put in 2015 stats that should be ignored
    const player2015 = new player_1.Player();
    player2015._setAlreadyExists(true);
    player2015.parsedData = _.cloneDeep(players[0]);
    player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
    yield player2015.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
        .query({ from: "2016-01-01" });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.started, player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
    t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
}));
ava_1.default("Get aggregate stats up to a date", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const player = playerClasses[0];
    yield player.save(db);
    // put in 2015 stats that should be ignored
    const player2015 = new player_1.Player();
    player2015._setAlreadyExists(true);
    player2015.parsedData = _.cloneDeep(players[0]);
    player2015.parsedData.games[0].gameDate = new Date(2015, 0, 0);
    yield player2015.save(db);
    const getRes = yield request(app)
        .get(`/${sportCode}/${player.parsedData.tidyName}/aggregate`)
        .query({ from: "2016-01-01" });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.started, player.parsedData.games.reduce((acc, gameStats) => acc += gameStats.started ? 1 : 0, 0));
    t.is(getRes.body.data.gamesPlayed, player.parsedData.games.length);
}));
ava_1.default("Aggregate stats for player, no data for player", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const getRes = yield request(app)
        .get("/${sportCode}/MADE,UP/aggregate");
    t.not(getRes.body.errors, undefined);
    t.is(getRes.status, 404);
}));
ava_1.default("Aggregate stats returns 406 when too many parameters supplied", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const getRes = yield request(app)
        .get("/${sportCode}/HURTS,JALEN/aggregate")
        .query({ from: "2016-01-01", to: "2017-01-01", season: 2016 });
    t.is(getRes.status, 406);
}));
//# sourceMappingURL=tidyName.test.js.map