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
const game_1 = require("../../../../../src/lib/importer/statcrew/football/game");
const _data_helper_1 = require("../_data.helper");
let inputData;
let venue;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse game venue data", (t) => {
    const game = new game_1.Game();
    venue = game.parseVenue(inputData.venue[0]);
});
ava_1.test("game played location", (t) => {
    t.is(venue.geoLocation, "Arlington, Texas");
});
ava_1.test("game played stadium name", (t) => {
    t.is(venue.stadiumName, "AT&T Stadium");
});
ava_1.test("neutral location", (t) => {
    t.is(venue.neutralLocation, true);
});
ava_1.test("nighttime game", (t) => {
    t.is(venue.nightGame, true);
});
ava_1.test("temperature", (t) => {
    t.is(venue.temperatureF, 72);
});
ava_1.test("wind", (t) => {
    t.is(venue.wind, undefined);
});
ava_1.test("wind (non-null)", (t) => {
    const copy = _.cloneDeep(inputData.venue[0]);
    const game = new game_1.Game();
    copy.$.wind = "10 mph NE";
    const parsedMod = game.parseVenue(copy);
    t.is(parsedMod.wind, "10 mph NE");
});
ava_1.test("weather", (t) => {
    t.is(venue.weather, "indoors");
});
ava_1.test("postseason game", (t) => {
    t.is(venue.postseasonGame, false);
});
ava_1.test("conference game", (t) => {
    t.is(venue.conferenceGame, false);
});
//# sourceMappingURL=game-venue.test.js.map