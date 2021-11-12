import { test } from "ava";

import { getConnection } from "../../../../../helpers/connectDb";

// classes
import { Play } from "../../../../../../src/lib/importer/statcrew/football/play";

test.beforeEach("connect DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop DB", async (t) => {
  t.context.db.dropDatabase();
});

test("Save a single play", async (t) => {
  const play = new Play();
  play.parsedData._id = "AA";
  play.updateGameRef("GA");
  play.updatePlayerRef("0A", "0A");
  const saveId = await play.save(t.context.db);
  t.is(saveId, "AA");
});
