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
const game_1 = require("../../../../../../src/lib/importer/statcrew/baseball/game");
const connectDb_1 = require("../../../../../helpers/connectDb");
// classes
ava_1.test.beforeEach("connect DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.db.dropDatabase();
}));
/**
 * reuse is based on heuristics for whether a game is likely a duplicate
 * of an existing one; based on the team names, abbreviations, and game date
 */
ava_1.test("reuses existing game ID if one is found in DB", (t) => __awaiter(this, void 0, void 0, function* () {
    const game = new game_1.Game();
    game.parsedData._id = "foo";
    game.parsedData.teamIds.home = "home";
    game.parsedData.teamIds.visitor = "visitor";
    game.parsedData.team = {
        home: {
            id: "HOME",
            code: 4,
            name: "The home team",
            runs: 6,
            score: 6,
            hits: 1,
            errs: 0,
            lob: 0,
        },
        visitor: {
            id: "VISITOR",
            code: 2,
            name: "The visiting team",
            runs: 6,
            score: 6,
            hits: 0,
            errs: 0,
            lob: 0,
        },
    };
    game.parsedData.gameDate = new Date(1, 1, 2000);
    game.parsedData.sportCode = "MBA";
    game.parsedData.playerIds = ["player"];
    game.parsedData.playIds = ["play"];
    game.parsedData.venue = {
        geoLocation: "LOCATION",
        stadiumName: "SNAME",
        nightGame: false,
        conferenceGame: false,
        postseasonGame: false,
        attendance: 1,
        dhGame: "0",
        series: "SERIES",
        schedInn: 1,
        schedNote: "NOTE",
        gameType: ["Regular Season"],
    };
    yield game.save(t.context.db);
    const secondGame = new game_1.Game();
    secondGame.parsedData = _.cloneDeep(game.parsedData);
    secondGame.parsedData._id = "";
    const id = yield secondGame.generateId(t.context.db, "MBA");
    t.is(id, game.parsedData._id);
    t.is(secondGame.getAlreadyExists(), true);
}));
//# sourceMappingURL=game-db.test.js.map