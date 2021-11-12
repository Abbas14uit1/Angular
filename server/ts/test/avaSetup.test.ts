import { test } from "ava";

test("2 + 2 == 4", (t) => {
  t.is(2 + 2, 4);
});

test("2 + 2 != 5", (t) => {
  t.not(2 + 2, 5);
});
