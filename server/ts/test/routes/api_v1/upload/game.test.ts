import test from "ava";
import * as express from "express";
import * as path from "path";
import * as request from "supertest";
import * as config from "../../../config/_testConfiguration";

import * as Athlyte from "../../../../../../typings/athlyte/football";

import { gameRoute } from "../../../../src/routes/api_v1/upload/game.route";
import { statcrewBaseball, statcrewBasketball, statcrewXml2016 } from "../../../config/_testConfiguration";
import { getConnection } from "../../../helpers/connectDb";

const badXmlPath = path.join(config.fixtureDir, "xml", "ill-formed-xml.xml");

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
});

test.afterEach.always("drop DB and disconnect", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.post("/", gameRoute);
  app.locals.db = db;
  return app;
}

test("posting XML is success", async (t) => {
  const app: express.Express = t.context.app;
  const res = await request(app)
    .post("/")
    .attach("file", statcrewXml2016);
  t.is(res.body.errors, undefined);
  t.not(res.body.data.ids, undefined);
  t.is(res.status, 201);
});

test("posting basketball XML is success", async (t) => {
  const app: express.Express = t.context.app;
  const res = await request(app)
    .post("/")
    .attach("file", statcrewBasketball);
  t.is(res.body.errors, undefined);
  t.not(res.body.data.ids, undefined);
  t.is(res.status, 201);
});

test("posting baseball XML is success", async (t) => {
  const app: express.Express = t.context.app;
  const res = await request(app)
    .post("/")
    .attach("file", statcrewBaseball);
  t.is(res.body.errors, undefined);
  t.not(res.body.data.ids, undefined);
  t.is(res.status, 201);
});

test("posting malformed xml", async (t) => {
  const app: express.Express = t.context.app;
  const res = await request(app)
    .post("/")
    .attach("file", badXmlPath);
  t.not(res.body.errors, undefined);
  t.is(res.status, 500);
});
