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
const request = require("supertest");
const index_1 = require("../../src/routes/index");
function makeApp() {
    const app = express();
    app.get("/", index_1.indexHandler);
    return app;
}
ava_1.default("Index", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(makeApp())
        .get("/");
    t.is(res.status, 200);
}));
ava_1.default("xyz should fail", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(makeApp())
        .get("/xyz");
    t.is(res.status, 404);
}));
//# sourceMappingURL=index.test.js.map