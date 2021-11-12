import { test } from "ava";
import * as _ from "lodash";
import { getConnection } from "../../../../../helpers/connectDb";
import { getPlaysData } from "../../../../../helpers/classFixtureLoaderBaseball";
import * as Athlyte from "../../../../../../../../typings/athlyte/baseball";
// classes
import { Play } from "../../../../../../src/lib/importer/statcrew/baseball/play";

test.beforeEach("connect DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop DB", async (t) => {
  t.context.db.dropDatabase();
});

test("Save a single play", async (t) => {
  const playData: Athlyte.IPlay[] = await getPlaysData();
  const play = new Play();
  play.parsedData = _.cloneDeep(playData[0]);
  play.parsedData._id = "AA";  
  const saveId = await play.save(t.context.db);
  t.is(saveId, "AA");
});
