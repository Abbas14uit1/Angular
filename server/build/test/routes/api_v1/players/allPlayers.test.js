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
const mongo = require("mongodb");
const request = require("supertest");
const Superlative = require("../../../../src/enums/superlatives");
const allPlayers_route_1 = require("../../../../src/routes/api_v1/players/allPlayers.route");
const classFixtureLoader_1 = require("../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../helpers/connectDb");
const game_1 = require("../../../../src/lib/importer/statcrew/football/game");
const player_1 = require("../../../../src/lib/importer/statcrew/football/player");
let players;
const sportCode = "MFB";
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
        app.get("/:sportCode/", allPlayers_route_1.allPlayersRoute);
        app.get("/:playerId/aggregate", allPlayers_route_1.allPlayersRoute);
        app.get("/:playerId/superlatives", allPlayers_route_1.allPlayersRoute);
        app.get("/:playerId/games", allPlayers_route_1.allPlayersRoute);
        app.get("/:playerId/playerStats", allPlayers_route_1.allPlayersRoute);
        app.get("/:sportCode/roasters/:teamId/:season", allPlayers_route_1.allPlayersRoute);
        app.get("/seasons/:sportCode/:teamId", allPlayers_route_1.allPlayersRoute);
        app.put("/", allPlayers_route_1.allPlayersRoute);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get all players from mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/");
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.true(getRes.body.data.length > 1);
    for (const player of getRes.body.data) {
        t.not(player.tidyName, undefined);
        t.true(player.teamName === "UA" || player.teamName === "USC");
    }
}));
ava_1.default("Get data for all players from a certain season", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    for (const player of playerClasses) {
        yield player.save(db);
    }
    const getRes = yield request(app)
        .get("/" + sportCode + "/")
        .query({ season: 2016 });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.true(getRes.body.data.length > 1);
}));
ava_1.default("Get data for all players from a certain team", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    yield playerClasses[0].save(db);
    const getRes = yield request(app)
        .get("/" + sportCode + "/")
        .query({ teamId: playerClasses[0].parsedData.teamId });
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data[0].teamId, playerClasses[0].parsedData.teamId);
}));
ava_1.default("Get aggregate data for a player", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const playerFirstGame = new player_1.Player();
    playerFirstGame._setAlreadyExists(false);
    playerFirstGame.parsedData = _.cloneDeep(players[0]);
    playerFirstGame.parsedData.games[0].stats.receiving = {
        rcvLong: 10,
        rcvNum: 1,
        rcvTd: 1,
        rcvYards: 10,
    };
    const playerSecondGame = new player_1.Player();
    playerSecondGame._setAlreadyExists(true);
    playerSecondGame.parsedData = _.cloneDeep(players[0]);
    playerSecondGame.parsedData.games[0].stats.receiving = {
        // made up data
        rcvLong: 10,
        rcvNum: 1,
        rcvTd: 1,
        rcvYards: 10,
    };
    const savedId = yield playerFirstGame.save(db);
    t.is(savedId, "player0");
    yield playerSecondGame.save(db);
    const playerAggregate = yield request(app)
        .get(`/${savedId}/aggregate`);
    t.is(playerAggregate.body.errors, undefined);
    t.is(playerAggregate.body.data.gamesPlayed, 2);
    t.is(playerAggregate.body.data.started, 2);
    t.deepEqual(playerAggregate.body.data.stats.receiving, {
        rcvLong: 10,
        rcvNum: 2,
        rcvTd: 2,
        rcvYards: 20,
    });
}));
ava_1.default("Malformed date on request returns a 406", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const getRes = yield request(app)
        .get("/" + sportCode + "/")
        .query({ season: "foobar" });
    t.is(getRes.status, 406);
}));
ava_1.default("Player aggregate within date range", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playerClasses = t.context.players;
    const playerFirstGame = new player_1.Player();
    playerFirstGame._setAlreadyExists(false);
    playerFirstGame.parsedData = _.cloneDeep(players[0]);
    playerFirstGame.parsedData.games[0].stats.receiving = {
        rcvLong: 10,
        rcvNum: 1,
        rcvTd: 1,
        rcvYards: 10,
    };
    const playerSecondGame = new player_1.Player();
    playerSecondGame._setAlreadyExists(true);
    playerSecondGame.parsedData = _.cloneDeep(players[0]);
    playerSecondGame.parsedData.games[0].gameDate = new Date(2010, 1, 1); // date outside aggregate range
    playerSecondGame.parsedData.games[0].stats.receiving = {
        // made up data
        rcvLong: 10,
        rcvNum: 1,
        rcvTd: 1,
        rcvYards: 10,
    };
    const savedId = yield playerFirstGame.save(db);
    t.is(savedId, "player0");
    yield playerSecondGame.save(db);
    const playerAggregate = yield request(app)
        .get(`/${savedId}/aggregate`)
        .query({ from: "2012-01-01", to: "2017-01-01" });
    t.is(playerAggregate.body.errrors, undefined);
    t.is(playerAggregate.body.data.gamesPlayed, 1);
}));
ava_1.default("Player aggregate for a season", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const player = t.context.players[0];
    const savedId = yield player.save(db);
    const playerAggregate = yield request(app)
        .get(`/${savedId}/aggregate`)
        .query({ season: 2016 });
    t.is(playerAggregate.body.data.gamesPlayed, 1);
}));
ava_1.default("Too many query parameters throws an error on aggregation", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const playerAggregate = yield request(app)
        .get("/foobar/aggregate")
        .query({ from: "2012-01-01", to: "2017-01-01", season: 2016 });
    t.is(playerAggregate.status, 406);
    t.is(playerAggregate.body.errors[0].code, "DateError");
}));
ava_1.default("Aggregate over player's lifetime", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const player = t.context.players[0];
    const savedId = yield player.save(db);
    const playerAggregate = yield request(app)
        .get(`/${savedId}/aggregate`);
    t.is(playerAggregate.body.data.gamesPlayed, 1);
}));
ava_1.default("Aggregate returns a 404 when the player doesn't exist", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const playerAggregate = yield request(app)
        .get(`/${new mongo.ObjectID().toHexString()}/aggregate`);
    t.is(playerAggregate.status, 404);
}));
ava_1.default("Retrieve players superlatives they have earned over their career", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const player = t.context.players[0];
    const id = new mongo.ObjectID().toHexString();
    const superlative = {
        _id: id,
        type: Superlative.Type.leader,
        value: 0,
        aggInfo: {
            aggType: Superlative.AggType.sum,
            aggTime: Superlative.AggTime.career,
            aggScope: Superlative.Scope.player,
            stat: "rushing.rushYards",
        },
        scope: Superlative.Scope.all,
        highest: true,
        results: ["rush"],
        holderInfo: {
            teamId: "team",
        },
    };
    yield db.collection("superlatives").insertOne(superlative);
    const superlatives = yield db.collection("superlatives").find({ _id: { $in: [id] } }).toArray();
    player.parsedData.games[0].superlatives = [id];
    const savedId = yield player.save(db);
    const playerSuperlatives = yield request(app)
        .get(`/${savedId}/superlatives`);
    t.is(playerSuperlatives.body.errors, undefined);
    t.is(playerSuperlatives.status, 200);
    t.deepEqual(playerSuperlatives.body.data, [{
            gameId: "game1",
            superlatives,
        }]);
}));
ava_1.default("Retrieve the information about the games a player participated in", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const player = t.context.players[0];
    const game = new game_1.Game();
    game.parsedData = _.cloneDeep(yield classFixtureLoader_1.getGameData());
    const saveGameId = yield game.save(db);
    player.parsedData.games[0].gameId = saveGameId;
    const savePlayerId = yield player.save(db);
    const playerGames = yield request(app)
        .get(`/${savePlayerId}/games`);
    playerGames.body.data[0].gameDate = new Date(playerGames.body.data[0].gameDate);
    t.is(playerGames.body.errors, undefined);
    t.is(playerGames.status, 200);
    t.deepEqual(playerGames.body.data, [game.parsedData]);
}));
//# sourceMappingURL=allPlayers.test.js.map