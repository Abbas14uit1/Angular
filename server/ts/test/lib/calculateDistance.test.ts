import { test } from "ava";

import { calculateDistance } from "../../src/lib/calculateDistance";

import * as Athlyte from "../../../../typings/athlyte/football";

import { VH } from "../../src/lib/importer/AthlyteImporter";

test("distance calculation: their field side, distance gained", (t) => {
  const poss: VH = VH.visitor;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 20,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), 20);
});

test("distance calculation: their field side, distance lost", (t) => {
  const poss: VH = VH.visitor;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 50,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), -10);
});

test("distance calculation: our field side, distance gained", (t) => {
  const poss: VH = VH.home;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 20,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), 20);
});

test("distance calculation: our field side, distance lost", (t) => {
  const poss: VH = VH.home;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 50,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), -10);
});

test("distance calculation: changed field sides, distance gained", (t) => {
  const poss: VH = VH.visitor;
  const start: Athlyte.IFieldPosition = {
    side: VH.visitor,
    yardline: 40,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), 20);
});

test("distance calculation: changed field side, distance lost", (t) => {
  const poss: VH = VH.visitor;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 40,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.visitor,
    yardline: 50,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), -10);
});

test("distance calculation: side does not matter for plays remaining on 50", (t) => {
  const poss: VH = VH.visitor;
  const start: Athlyte.IFieldPosition = {
    side: VH.home,
    yardline: 50,
    endzone: false,
  };
  const end: Athlyte.IFieldPosition = {
    side: VH.visitor,
    yardline: 50,
    endzone: false,
  };
  t.is(calculateDistance(poss, start, end), 0);
});
