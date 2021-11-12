import { test } from "ava";
import * as express from "express";
import * as request from "supertest";

import { availablePlayerStats } from "../../../../src/routes/api_v1/availableStats/playerStats.route";

async function makeApp() {
  const app = express();
  app.use("/", availablePlayerStats);
  return app;
}

test("get list of available stats", async (t) => {
  const stats = await request(await makeApp())
    .get("/");
  t.not(stats.body.data.length, 0);
  t.not(stats.body.data[0].key, undefined);
  t.not(stats.body.data[0].values.length, 0);
  t.not(stats.body.data[0].values[0], undefined);
});
