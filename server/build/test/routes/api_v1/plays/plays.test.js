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
const plays_route_1 = require("../../../../src/routes/api_v1/plays/plays.route");
const classFixtureLoader_1 = require("../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../helpers/connectDb");
const play_1 = require("../../../../src/lib/importer/statcrew/football/play");
let plays;
function makePlayClasses() {
    const playClasses = plays.map((play) => {
        const playClass = new play_1.Play();
        playClass.parsedData = _.cloneDeep(play);
        return playClass;
    });
    return playClasses;
}
ava_1.default.before("read play data", (t) => __awaiter(this, void 0, void 0, function* () {
    plays = yield classFixtureLoader_1.getPlaysData();
}));
ava_1.default.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
    t.context.plays = makePlayClasses();
}));
ava_1.default.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.get("/", plays_route_1.playRoutes);
        app.get("/:playId", plays_route_1.playRoutes);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("Get plays on empty DB returns empty array", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const getRes = yield request(app)
        .get("/");
    t.deepEqual(getRes.body.data, []);
}));
ava_1.default("Get all plays from mongo when no ID specified", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playClasses = t.context.plays;
    yield db.collection("plays").insertMany(playClasses.map((play) => play.prepareForBatchSave()));
    const getRes = yield request(app)
        .get("/");
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.true(getRes.body.data.length > 1);
    const play = getRes.body.data[0];
    t.not(play, undefined);
    t.is(typeof play.down, typeof 0);
}));
ava_1.default("Get a play information by playId", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const db = app.locals.db;
    const playClasses = t.context.plays;
    const play = playClasses[0];
    const playId = yield play.save(db);
    const getRes = yield request(app)
        .get(`/${playId}`);
    t.is(getRes.body.errors, undefined);
    t.is(getRes.status, 200);
    t.is(getRes.body.data.playInGame, play.parsedData.playInGame);
}));
//# sourceMappingURL=plays.test.js.map