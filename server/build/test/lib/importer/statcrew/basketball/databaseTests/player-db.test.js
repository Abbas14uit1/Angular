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
const _ = require("lodash");
const classFixtureLoaderBasketball_1 = require("../../../../../helpers/classFixtureLoaderBasketball");
const connectDb_1 = require("../../../../../helpers/connectDb");
const player_1 = require("../../../../../../src/lib/importer/statcrew/basketball/player");
let playerData;
ava_1.test.before("Get players data", (t) => __awaiter(this, void 0, void 0, function* () {
    playerData = yield classFixtureLoaderBasketball_1.getPlayersData();
}));
ava_1.test.beforeEach("connect to DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop database", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.db.dropDatabase();
}));
ava_1.test("Save a single player (that doesn't exist yet) to database", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    const savedId = yield player.save(t.context.db);
    t.is(savedId, player.parsedData._id);
}));
ava_1.test("Update an existing player in database", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player.parsedData.games = [{
            gameId: "game2",
        }];
    player.populateId(yield player.generateId(t.context.db, "MBB"));
    yield player.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 2);
}));
//# sourceMappingURL=player-db.test.js.map