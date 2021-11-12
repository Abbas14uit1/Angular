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
const path = require("path");
const request = require("supertest");
const config = require("../../../config/_testConfiguration");
const game_route_1 = require("../../../../src/routes/api_v1/upload/game.route");
const _testConfiguration_1 = require("../../../config/_testConfiguration");
const connectDb_1 = require("../../../helpers/connectDb");
const badXmlPath = path.join(config.fixtureDir, "xml", "ill-formed-xml.xml");
ava_1.default.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
}));
ava_1.default.afterEach.always("drop DB and disconnect", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDb_1.getConnection();
        const app = express();
        app.post("/", game_route_1.gameRoute);
        app.locals.db = db;
        return app;
    });
}
ava_1.default("posting XML is success", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const res = yield request(app)
        .post("/")
        .attach("file", _testConfiguration_1.statcrewXml2016);
    t.is(res.body.errors, undefined);
    t.not(res.body.data.ids, undefined);
    t.is(res.status, 201);
}));
ava_1.default("posting basketball XML is success", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const res = yield request(app)
        .post("/")
        .attach("file", _testConfiguration_1.statcrewBasketball);
    t.is(res.body.errors, undefined);
    t.not(res.body.data.ids, undefined);
    t.is(res.status, 201);
}));
ava_1.default("posting baseball XML is success", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const res = yield request(app)
        .post("/")
        .attach("file", _testConfiguration_1.statcrewBaseball);
    t.is(res.body.errors, undefined);
    t.not(res.body.data.ids, undefined);
    t.is(res.status, 201);
}));
ava_1.default("posting malformed xml", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const res = yield request(app)
        .post("/")
        .attach("file", badXmlPath);
    t.not(res.body.errors, undefined);
    t.is(res.status, 500);
}));
//# sourceMappingURL=game.test.js.map