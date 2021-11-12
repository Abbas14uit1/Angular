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
const connectDb_1 = require("../../../../../helpers/connectDb");
// classes
const play_1 = require("../../../../../../src/lib/importer/statcrew/football/play");
ava_1.test.beforeEach("connect DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db.dropDatabase();
}));
ava_1.test("Save a single play", (t) => __awaiter(this, void 0, void 0, function* () {
    const play = new play_1.Play();
    play.parsedData._id = "AA";
    play.updateGameRef("GA");
    play.updatePlayerRef("0A", "0A");
    const saveId = yield play.save(t.context.db);
    t.is(saveId, "AA");
}));
//# sourceMappingURL=play-db.test.js.map