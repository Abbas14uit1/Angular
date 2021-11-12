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
const queryTeam_route_1 = require("../../../../../src/routes/api_v1/query//baseball/queryTeam.route");
const connectDb_1 = require("../../../../helpers/connectDb");
const classFixtureLoader_1 = require("../../../../helpers/classFixtureLoader");
const queryBuilder_1 = require("../../../../../src/lib/importer/statcrew/queryBuilder");
let teamGames;
ava_1.default.before("read game data", (t) => __awaiter(this, void 0, void 0, function* () {
    teamGames = yield classFixtureLoader_1.getTeamGamesData();
}));
ava_1.default.beforeEach("make app and game class", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
}));
ava_1.default.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", queryTeam_route_1.queryBaseballTeamRoute);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get teamGames for the each game by category", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const teamGamesClass = teamGames.map((teamGame) => {
        const teamGameClass = new queryBuilder_1.QueryBuilder();
        teamGameClass.parsedData = _.cloneDeep(teamGame);
        return teamGameClass;
    });
    for (const teamGameClass of teamGamesClass) {
        yield teamGameClass.saveTeamGame(db);
    }
    const getRes = yield request(app)
        .get("/game/hitting/hitting/0/gt/8/0/MBA/All/NA/NA/NA/NA/All/All/Total/8?statistics=ab&projections=");
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.true(getRes.body.data.length == 5);
}));
//# sourceMappingURL=queryTeam.test.js.map