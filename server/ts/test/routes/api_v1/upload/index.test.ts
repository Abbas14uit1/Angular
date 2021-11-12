import { test } from "ava";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as request from "supertest";

import { jwtSecret, jwtSignOpts } from "../../../../src/config/config";

import { uploadRoute } from "../../../../src/routes/api_v1/upload";

async function makeApp() {
  const app = express();
  app.use("/", uploadRoute);
  return app;
}

test("proper headers are set for upload requests", async (t) => {
  const options = await request(await makeApp())
    .options("/")
    .set("Origin", "http://localhost:8080");
  t.is(options.header["access-control-allow-credentials"], "true");
  t.is(options.header["access-control-allow-origin"], "http://localhost:8080");
});

test("cannot access games and superlatives routes without JSON Web Token", async (t) => {
  const res = await request(await makeApp())
    .get("/");
  t.is(res.status, 401);
});

test("can access games and superlatives routes with JSON Web Token", async (t) => {
  const token = jwt.sign({ username: "myUser", admin: true }, jwtSecret!, jwtSignOpts);
  const res = await request(await makeApp())
    .get("/")
    .set("Authorization", `JWT ${token}`);
  t.not(res.status, 401);
});
