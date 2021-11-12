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
const teamName_route_1 = require("../../../../src/routes/api_v1/teams/teamName.route");
const classFixtureLoader_1 = require("../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../helpers/connectDb");
const team_1 = require("../../../../src/lib/importer/statcrew/football/team");
let teams;
function makeTeamClasses() {
    return teams.map((team) => {
        const teamClass = new team_1.Team();
        teamClass.parsedData = _.cloneDeep(team);
        teamClass._setAlreadyExists(false);
        return teamClass;
    });
}
ava_1.default.before("read team data", (t) => __awaiter(this, void 0, void 0, function* () {
    teams = yield classFixtureLoader_1.getTeamData();
}));
ava_1.default.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
    t.context.teams = makeTeamClasses();
}));
ava_1.default.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.get("/:teamName", teamName_route_1.teamNameRoute);
        app.get("/teamcode/:id", teamName_route_1.teamNameRoute);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get team details by a given team name", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const teamClass = t.context.teams[0];
    teamClass.updateGameRef("GA");
    yield teamClass.save(db);
    const getRes = yield request(app)
        .get(`/${teamClass.parsedData.tidyName}`);
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.not(getRes.body.data, null);
    t.true(getRes.body.data.tidyName.length >= 1);
}));
ava_1.default("Get the team code for a given team id", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const teamClass = t.context.teams[0];
    teamClass.updateGameRef("GA");
    const teamId = yield teamClass.save(db);
    const getRes = yield request(app)
        .get(`/teamcode/${teamId}`);
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data[0].code, 657);
}));
//# sourceMappingURL=teamName.test.js.map