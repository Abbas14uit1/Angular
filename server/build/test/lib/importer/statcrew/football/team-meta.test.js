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
const teamParser_1 = require("../../../../../src/lib/importer/statcrew/helpers/teamParser");
const _data_helper_1 = require("../_data.helper");
let inputData;
let meta;
ava_1.test.before("read full input file", (t) => __awaiter(this, void 0, void 0, function* () {
    inputData = yield _data_helper_1.readJson();
    t.not(inputData, undefined);
}));
ava_1.test.before("parse team data", (t) => {
    meta = teamParser_1.parseMeta(inputData.team[1]);
});
ava_1.test("meta: generates tidy name", (t) => {
    t.is(meta.tidyName, "UA");
});
ava_1.test("meta: team name is string", (t) => {
    t.is(meta.name, "Alabama");
});
//# sourceMappingURL=team-meta.test.js.map