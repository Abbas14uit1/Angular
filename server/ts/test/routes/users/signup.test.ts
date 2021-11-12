import { test } from "ava";
import * as bodyparser from "body-parser";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as process from "process";
import * as request from "supertest";

import { jwtSecret, jwtSignOpts } from "../../../src/config/config";
import { getConnection } from "../../helpers/connectDb";

import { passwordTest, signupRouter, usernameTest } from "../../../src/routes/users/signup";

async function makeApp() {
  const app = express();
  const db = await getConnection();
  app.locals.db = db;
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/", signupRouter);
  return app;
}

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
});

test.afterEach("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

test("Undefined and blank usernames are rejected", async (t) => {
  const app: express.Express = t.context.app;
  const postRes = await request(app)
    .post("/")
    .send({
      username: undefined,
      password: "aVeryGoodPassword",
      admin: false,
    });
  t.is(postRes.status, 400);
  const blankUsernameRes = await request(app)
    .post("/")
    .send({
      username: "",
      password: "aVeryGoodPassword",
      admin: false,
    });
  t.is(blankUsernameRes.status, 400);
});

test("Undefined and blank passwords are rejected", async (t) => {
  const app: express.Express = t.context.app;
  const postRes = await request(app)
    .post("/")
    .send({
      username: "MyUsername",
      password: undefined,
      admin: false,
    });
  t.is(postRes.status, 400);
});

test("Usernames and passwords failing regex are rejected", async (t) => {
  const app: express.Express = t.context.app;
  const usernameRes = await request(app)
    .post("/")
    .send({
      username: 4,
      password: "aVeryGoodPassword",
      admin: false,
    });
  t.is(usernameRes.status, 400);
  const passwordRes = await request(app)
    .post("/")
    .send({
      username: "MyUsername",
      password: 4,
      admin: false,
    });
  t.is(passwordRes.status, 400);
});

test("Adding an admin fails when JSON web token does not specify admin", async (t) => {
  const app: express.Express = t.context.app;
  const postRes = await request(app)
    .post("/")
    .send({
      username: "MyUsername",
      password: "aVeryGoodPassword",
      admin: true,
    });
  t.is(postRes.status, 401);
});

test("Adds an admin to the database via upload route", async (t) => {
  const app: express.Express = t.context.app;
  const postRes = await request(app)
    .post("/")
    .set("Authorization", "JWT " + jwt.sign(
      { username: "existingUser", admin: true },
      jwtSecret!,
      jwtSignOpts,
    ))
    .send({
      username: "MyUsername",
      password: "aVeryGoodPassword",
      admin: true,
    });
  t.is(postRes.status, 201);
});

test("Malformed username is rejected", (t) => {
  t.false(usernameTest("789&&&*(&DF"));
});

test("Malformed password is rejected", (t) => {
  t.false(passwordTest(`a multi
  line password`));
});

test("Successful signups return a JSON web token", async (t) => {
  const app: express.Express = t.context.app;
  const user = {
    username: "MyUsername",
    password: "aVeryGoodPassword",
    admin: true,
  };
  const postRes = await request(app)
    .post("/")
    .set("Authorization", "JWT " + jwt.sign(
      { username: "existingUser", admin: true },
      jwtSecret!,
      jwtSignOpts,
    ))
    .send(user);
  t.not(postRes.body.data.token, undefined);
  const token = jwt.verify(postRes.body.data.token, jwtSecret!) as { username: string, admin: boolean };
  t.is(token.admin, user.admin);
  t.is(token.username, user.username);
});
