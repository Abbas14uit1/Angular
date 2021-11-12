import test from "ava";
import * as express from "express";
import * as request from "supertest";

import { indexHandler } from "../../src/routes/index";

function makeApp() {
  const app = express();
  app.get("/", indexHandler);
  return app;
}

test("Index", async (t) => {
  const res = await request(makeApp())
    .get("/");
  t.is(res.status, 200);
});

test("xyz should fail", async (t) => {
  const res = await request(makeApp())
	.get("/xyz");
	t.is(res.status, 404);
});