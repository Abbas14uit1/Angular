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
const moment = require("moment");
const request = require("supertest");
const game_route_1 = require("../../../../src/routes/api_v1/game/game.route");
const game_route_2 = require("../../../../src/routes/api_v1/upload/game.route");
const classFixtureLoader_1 = require("../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../helpers/connectDb");
// classes
const game_1 = require("../../../../src/lib/importer/statcrew/football/game");
const player_1 = require("../../../../src/lib/importer/statcrew/football/player");
let game;
let plays;
let players;
let teams;
ava_1.default.before("read game data", (t) => __awaiter(this, void 0, void 0, function* () {
    game = yield classFixtureLoader_1.getGameData();
    plays = yield classFixtureLoader_1.getPlaysData();
    players = yield classFixtureLoader_1.getPlayersData();
    teams = yield classFixtureLoader_1.getTeamData();
}));
ava_1.default.beforeEach("make app and game class", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
    t.context.game = new game_1.Game();
    t.context.game.parsedData = _.cloneDeep(game);
}));
ava_1.default.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.use("/upload", game_route_2.gameRoute);
        app.get("/:sportCode/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/teams/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/teamstats/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/starterroster/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/fullroster/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/rushing/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/passing/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/receiving/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/receiving/targets/:gameId/:playerId", game_route_1.gameRoutes);
        app.get("/:sportCode/defense/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/interceptions/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/fumbles/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/hitting/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/pitching/:gameId/:teamId", game_route_1.gameRoutes);
        app.get("/:sportCode/teamIds/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/plays/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/player-name/:playerId", game_route_1.gameRoutes);
        app.get("/:sportCode/plays/scoring/:gameId", game_route_1.gameRoutes);
        app.get("/:sportCode/plays/:gameId", game_route_1.gameRoutes);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get the saved game from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const getRes = yield request(app)
        .get("/MFB/game1");
    t.true(getRes.body.data.length == 1);
    t.true(moment(getRes.body.data[0].gameDate).isSame(moment(gameClass.parsedData.gameDate)));
    t.is(getRes.status, 200);
}));
/* Need to be fixed
test("Get the saved game by team from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const teamClasses = teams.map((team) => {
    const teamClass = new Team();
    teamClass.parsedData = _.cloneDeep(team);
    teamClass._setAlreadyExists(false);
    return teamClass;
  });
  for (const teamClass of teamClasses) {
    await teamClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/teams/game1");
  t.true(getRes.body.data.length == 1);
  t.true(getRes.body.data.tidyName === "USC");
  t.is(getRes.status, 200);
});
*/
ava_1.default("Get the saved starters from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/starterroster/game1/8");
    t.true(getRes.body.data.length == 2);
    t.is(getRes.status, 200);
}));
ava_1.default("Get the saved full roster from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/fullroster/game1/8");
    t.true(getRes.body.data.length == 3);
    t.is(getRes.status, 200);
}));
ava_1.default("Get the rushing details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/rushing/game1/8");
    t.true(getRes.body.data.length == 1);
    t.true(getRes.body.data[0].attempts == 4);
    t.is(getRes.status, 200);
}));
ava_1.default("Get the passing details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/passing/game1/8");
    t.true(getRes.body.data.length == 1);
    t.true(getRes.body.data[0].attempts == 29);
    t.is(getRes.status, 200);
}));
ava_1.default("Get the receiving details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/receiving/game1/8");
    t.true(getRes.body.data.length == 1);
    t.true(getRes.body.data[0].receptions == 2);
    t.is(getRes.status, 200);
}));
//TODO: we need to add more validation
ava_1.default("Get the receiving target details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/receiving/targets/game1/8");
    //t.true(getRes.body.data.length == 1);
    //t.true(getRes.body.data[0].receptions == 2);
    t.is(getRes.status, 200);
}));
//TODO: we need to add more validation
ava_1.default("Get the defence details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/defense/game1/8");
    // t.true(getRes.body.data.length == 1);
    // t.true(getRes.body.data[0].receptions == 2);
    t.is(getRes.status, 200);
}));
//TODO: we need to add more validation
ava_1.default("Get the interceptions details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/interceptions/game1/8");
    //t.true(getRes.body.data.length == 1);
    // t.true(getRes.body.data[0].receptions == 2);
    t.is(getRes.status, 200);
}));
//TODO: we need to add more validation
ava_1.default("Get the fumbles details from Mongo", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const gameClass = t.context.game;
    const saveId = yield gameClass.save(db);
    t.is(saveId, "game1");
    const playerClasses = players.map((player) => {
        const playerClass = new player_1.Player();
        playerClass._setAlreadyExists(false);
        playerClass.parsedData = _.cloneDeep(player);
        return playerClass;
    });
    for (const playerClass of playerClasses) {
        yield playerClass.save(db);
    }
    const getRes = yield request(app)
        .get("/MFB/fumbles/game1/8");
    //t.true(getRes.body.data.length == 1);
    // t.true(getRes.body.data[0].receptions == 2);
    t.is(getRes.status, 200);
}));
//# sourceMappingURL=game.test.js.map