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
const player_route_1 = require("../../../../src/routes/api_v1/player/player.route");
const classFixtureLoaderBasketball_1 = require("../../../helpers/classFixtureLoaderBasketball");
const connectDb_1 = require("../../../helpers/connectDb");
const player_1 = require("../../../../src/lib/importer/statcrew/basketball/player");
let players;
const sportCode = "MBB";
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
    players = yield classFixtureLoaderBasketball_1.getPlayersData();
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
        app.get("/:sportCode/stats/career/:playerId", player_route_1.playerRoutes);
        app.get("/:sportCode/stats/season/:playerId", player_route_1.playerRoutes);
        app.get("/:sportCode/stats/game/:playerId", player_route_1.playerRoutes);
        app.get("/:sportCode/info/:playerId", player_route_1.playerRoutes);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get player career stat from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/stats/career/player1");
    t.is(getRes.status, 200);
    t.is(getRes.body.errors, undefined);
    // const player = getRes.body.data 
    for (const player of getRes.body.data) {
        t.true(player.tidyName === "HAYDEL,SYDNEY");
        t.true(player.name && player.name === "Haydel, Sydney");
        t.true(player.teamName && player.teamName === "Hawai`i");
        t.true(player.shooting != undefined);
        t.true(player.rebound != undefined);
        t.true(player.assist != undefined);
        t.true(player.turnover != undefined);
        t.true(player.steal != undefined);
        t.true(player.block != undefined);
    }
}));
ava_1.default("Get player stat by season from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/stats/season/player1");
    t.is(getRes.status, 200);
    t.is(getRes.body.errors, undefined);
    for (const player of getRes.body.data) {
        t.true(player.tidyName === "HAYDEL,SYDNEY");
        t.true(player.name && player.name === "Haydel, Sydney");
        t.true(player.teamName === "Hawai`i");
        t.true(player.shooting != undefined);
        t.true(player.rebound != undefined);
        t.true(player.assist != undefined);
        t.true(player.turnover != undefined);
        t.true(player.steal != undefined);
        t.true(player.block != undefined);
    }
}));
ava_1.default("Get player stat by game from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/stats/game/player1");
    t.is(getRes.status, 200);
    t.is(getRes.body.errors, undefined);
    for (const player of getRes.body.data) {
        t.true(player.tidyName === "HAYDEL,SYDNEY");
        t.true(player.teamName && player.teamName === "Hawai`i");
        t.true(player.shooting != undefined);
        t.true(player.rebound != undefined);
        t.true(player.assist != undefined);
        t.true(player.turnover != undefined);
        t.true(player.steal != undefined);
        t.true(player.block != undefined);
    }
}));
ava_1.default("Get teamcode by team id from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/info/player1");
    t.is(getRes.status, 200);
    t.is(getRes.body.errors, undefined);
    for (const player of getRes.body.data) {
        t.true(player.tidyName === "HAYDEL,SYDNEY");
        t.true(player.teamName && player.teamName === "Hawai`i");
        t.true(player.name && player.name === "Haydel, Sydney");
    }
}));
//# sourceMappingURL=playerBasketball.test.js.map