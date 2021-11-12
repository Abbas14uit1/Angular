"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const calculateDistance_1 = require("../../src/lib/calculateDistance");
const AthlyteImporter_1 = require("../../src/lib/importer/AthlyteImporter");
ava_1.test("distance calculation: their field side, distance gained", (t) => {
    const poss = AthlyteImporter_1.VH.visitor;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.home,
        yardline: 20,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), 20);
});
ava_1.test("distance calculation: their field side, distance lost", (t) => {
    const poss = AthlyteImporter_1.VH.visitor;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.home,
        yardline: 50,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), -10);
});
ava_1.test("distance calculation: our field side, distance gained", (t) => {
    const poss = AthlyteImporter_1.VH.home;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 20,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), 20);
});
ava_1.test("distance calculation: our field side, distance lost", (t) => {
    const poss = AthlyteImporter_1.VH.home;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 50,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), -10);
});
ava_1.test("distance calculation: changed field sides, distance gained", (t) => {
    const poss = AthlyteImporter_1.VH.visitor;
    const start = {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 40,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), 20);
});
ava_1.test("distance calculation: changed field side, distance lost", (t) => {
    const poss = AthlyteImporter_1.VH.visitor;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 40,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 50,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), -10);
});
ava_1.test("distance calculation: side does not matter for plays remaining on 50", (t) => {
    const poss = AthlyteImporter_1.VH.visitor;
    const start = {
        side: AthlyteImporter_1.VH.home,
        yardline: 50,
        endzone: false,
    };
    const end = {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 50,
        endzone: false,
    };
    t.is(calculateDistance_1.calculateDistance(poss, start, end), 0);
});
//# sourceMappingURL=calculateDistance.test.js.map