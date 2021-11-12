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
const playerStats_route_1 = require("../../../../src/routes/api_v1/availableStats/playerStats.route");
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        app.use("/", playerStats_route_1.availablePlayerStats);
        return app;
    });
}
ava_1.test("get list of available stats", (t) => __awaiter(this, void 0, void 0, function* () {
    const stats = yield request(yield makeApp())
        .get("/");
    t.not(stats.body.data.length, 0);
    t.not(stats.body.data[0].key, undefined);
    t.not(stats.body.data[0].values.length, 0);
    t.not(stats.body.data[0].values[0], undefined);
}));
//# sourceMappingURL=playerStats.test.js.map