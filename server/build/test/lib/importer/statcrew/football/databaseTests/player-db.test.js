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
const classFixtureLoader_1 = require("../../../../../helpers/classFixtureLoader");
const connectDb_1 = require("../../../../../helpers/connectDb");
const player_1 = require("../../../../../../src/lib/importer/statcrew/football/player");
let playerData;
ava_1.test.before("Get players data", (t) => __awaiter(this, void 0, void 0, function* () {
    playerData = yield classFixtureLoader_1.getPlayersData();
}));
ava_1.test.beforeEach("connect to DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop database", (t) => __awaiter(this, void 0, void 0, function* () {
    if (t.context.state === "failed") {
        // a test just failed
    }
    else {
        yield t.context.db.dropDatabase();
    }
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
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameId = "game2";
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 2);
}));
ava_1.test("create a new player with same name in different team", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.teamCode = 9;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
    t.is(players[0].games.length, 1);
}));
ava_1.test("create a player with same name and same team", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2007-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2007";
    playerUpdate.parsedData.games[0].season = 2007;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
    t.is(players[0].games.length, 1);
}));
ava_1.test("create a player with same name and class as SR in the same team for a different season", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
    playerUpdate.parsedData.games[0].season = 2017;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 2);
}));
ava_1.test("create a player with same name and class as FR in the same team for a different season", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player.parsedData.games[0].playerClass = "FR";
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].playerClass = "FR";
    playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
    playerUpdate.parsedData.games[0].season = 2017;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 2);
}));
ava_1.test("create 3 player with the same team, same player class for a different decreasing season", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2015";
    playerUpdate.parsedData.games[0].season = 2015;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2014";
    playerUpdate2.parsedData.games[0].season = 2014;
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
    t.is(players[0].games.length, 2);
}));
ava_1.test("create 3 player with the same team, different player class for a different decreasing season", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2015";
    playerUpdate.parsedData.games[0].season = 2015;
    playerUpdate.parsedData.games[0].playerClass = "JR";
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2014";
    playerUpdate2.parsedData.games[0].season = 2014;
    playerUpdate2.parsedData.games[0].playerClass = "SO";
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 3);
}));
ava_1.test("create 3 player with the same team, same player class for a different season moving forward", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
    playerUpdate.parsedData.games[0].season = 2017;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2018-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2018";
    playerUpdate2.parsedData.games[0].season = 2018;
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
    t.is(players[0].games.length, 2);
}));
ava_1.test("create 3 player with the same team, different player class for a different season moving forward", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player.parsedData.games[0].playerClass = "FR";
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2017-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2017";
    playerUpdate.parsedData.games[0].season = 2017;
    playerUpdate.parsedData.games[0].playerClass = "SO";
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2018-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2018";
    playerUpdate2.parsedData.games[0].season = 2018;
    playerUpdate.parsedData.games[0].playerClass = "JR";
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 1);
    t.is(players[0].games.length, 3);
}));
ava_1.test("create 3 player with the same team, same player class for inbetween seasons", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2014";
    playerUpdate.parsedData.games[0].season = 2014;
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2015";
    playerUpdate2.parsedData.games[0].season = 2015;
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
}));
ava_1.test("create 3 player with the same team, different player class for inbetween season", (t) => __awaiter(this, void 0, void 0, function* () {
    const player = new player_1.Player();
    player.parsedData = _.cloneDeep(playerData[0]);
    player._setAlreadyExists(false);
    yield player.save(t.context.db);
    const playerUpdate = new player_1.Player();
    playerUpdate.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate.parsedData.games[0].gameDate = new Date("2014-09-03T05:00:00.000Z");
    playerUpdate.parsedData.games[0].actualDate = "03/09/2014";
    playerUpdate.parsedData.games[0].season = 2014;
    playerUpdate.parsedData.games[0].playerClass = "JR";
    playerUpdate.populateId(yield playerUpdate.generateId(t.context.db));
    yield playerUpdate.save(t.context.db);
    const playerUpdate2 = new player_1.Player();
    playerUpdate2.parsedData = _.cloneDeep(playerData[0]);
    playerUpdate2.parsedData.games[0].gameDate = new Date("2015-09-03T05:00:00.000Z");
    playerUpdate2.parsedData.games[0].actualDate = "03/09/2015";
    playerUpdate2.parsedData.games[0].season = 2015;
    playerUpdate2.parsedData.games[0].playerClass = "SO";
    playerUpdate2.populateId(yield playerUpdate2.generateId(t.context.db));
    yield playerUpdate2.save(t.context.db);
    const players = yield t.context.db.collection("players").find({}).toArray();
    t.is(players.length, 2);
}));
//# sourceMappingURL=player-db.test.js.map