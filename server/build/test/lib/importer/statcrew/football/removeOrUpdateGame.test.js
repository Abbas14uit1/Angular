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
const footballImporter_1 = require("../../../../../src/lib/importer/statcrew/football/footballImporter");
const connectDb_1 = require("../../../../helpers/connectDb");
const _data_helper_1 = require("../_data.helper");
let data;
ava_1.test.before("read JSON", (t) => __awaiter(this, void 0, void 0, function* () {
    data = yield _data_helper_1.readJson();
}));
ava_1.test.beforeEach("connect DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.db.dropDatabase();
}));
ava_1.test("Removing a game from the database", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const importer = new footballImporter_1.FootballImporter();
    importer.parse(data);
    const { gameId, playIds, playerIds, homeId, visitorId } = yield importer.saveToMongo(db);
    t.true((yield db.collection("games").find({}).toArray()).length > 0);
    t.true((yield db.collection("teams").find({}).toArray()).length > 0);
    t.true((yield db.collection("plays").find({}).toArray()).length > 0);
    t.true((yield db.collection("players").find({}).toArray()).length > 0);
    yield importer.removeGame(db);
    t.is((yield db.collection("games").find({}).toArray()).length, 0);
    t.is((yield db.collection("plays").find({}).toArray()).length, 0);
    t.is((yield db.collection("players").find({}).limit(1).toArray())[0].games.length, 0);
    t.is((yield db.collection("teams").find({}).limit(1).toArray())[0].games.length, 0);
}));
ava_1.test("Automatically removes games from database if it already exists", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const importer = new footballImporter_1.FootballImporter();
    importer.parse(data);
    const firstSave = yield importer.saveToMongo(db);
    const secondSave = yield importer.saveToMongo(db);
    t.is((yield db.collection("games").find({}).toArray()).length, 1);
}));
//# sourceMappingURL=removeOrUpdateGame.test.js.map