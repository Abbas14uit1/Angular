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
const jwt = require("jsonwebtoken");
const request = require("supertest");
const config_1 = require("../../../../src/config/config");
const upload_1 = require("../../../../src/routes/api_v1/upload");
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        app.use("/", upload_1.uploadRoute);
        return app;
    });
}
ava_1.test("proper headers are set for upload requests", (t) => __awaiter(this, void 0, void 0, function* () {
    const options = yield request(yield makeApp())
        .options("/")
        .set("Origin", "http://localhost:8080");
    t.is(options.header["access-control-allow-credentials"], "true");
    t.is(options.header["access-control-allow-origin"], "http://localhost:8080");
}));
ava_1.test("cannot access games and superlatives routes without JSON Web Token", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(yield makeApp())
        .get("/");
    t.is(res.status, 401);
}));
ava_1.test("can access games and superlatives routes with JSON Web Token", (t) => __awaiter(this, void 0, void 0, function* () {
    const token = jwt.sign({ username: "myUser", admin: true }, config_1.jwtSecret, config_1.jwtSignOpts);
    const res = yield request(yield makeApp())
        .get("/")
        .set("Authorization", `JWT ${token}`);
    t.not(res.status, 401);
}));
//# sourceMappingURL=index.test.js.map