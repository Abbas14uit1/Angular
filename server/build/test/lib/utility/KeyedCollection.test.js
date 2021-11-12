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
const KeyedCollection_1 = require("../../../src/lib/utility/KeyedCollection");
ava_1.default("Test key collection add", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    t.is(mapCollection.Count(), 1);
}));
ava_1.default("Test key collection contains key", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    t.is(mapCollection.ContainsKey("a"), true);
}));
ava_1.default("Test key collection remove", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    t.is(mapCollection.Remove("a"), 1);
}));
ava_1.default("Test key collection item", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    t.is(mapCollection.Item("a"), 1);
}));
ava_1.default("Test key collection for all keys", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    mapCollection.Add("b", 2);
    const len = mapCollection.Keys().length;
    t.is(len, 2);
}));
ava_1.default("Test key collection for all values", (t) => __awaiter(this, void 0, void 0, function* () {
    const mapCollection = new KeyedCollection_1.KeyedCollection();
    mapCollection.Add("a", 1);
    mapCollection.Add("b", 2);
    const len = yield mapCollection.Values().length;
    t.is(len, 2);
}));
//# sourceMappingURL=KeyedCollection.test.js.map