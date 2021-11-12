import test from "ava";
import * as express from "express";
import * as fs from "graceful-fs";
import * as pify from "pify";
import * as request from "supertest";
import * as bcrypt from "bcryptjs";
import * as bodyparser from "body-parser";
import * as jwt from "jsonwebtoken";
import * as mongo from "mongodb";

import { apiRouter } from "../../../src/routes/api_v1/apiIndex.route";
import { statcrewXml2016 } from "../../config/_testConfiguration";


import { jwtSecret, saltLength } from "../../../src/config/config";
import { getConnection } from "../../helpers/connectDb";

import { IExistingUserDBEntry } from "../../../src/lib/login/loginExisting";
import { loginErrorMessages, loginRouter } from "../../../src/routes/users/login";


test.beforeEach("make app before you attempt a login", async (t) => {
  t.context.app = await makeApp();  
});

/*test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});*/

async function makeApp() {
  const app = express();
  const db = await getConnection();
  app.locals.db = db;
  app.use("/", apiRouter);
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/login", loginRouter);
  return app;
}

test("Test file exists", async (t) => {
  t.notThrows(() => pify(fs.stat)(statcrewXml2016));
});

test("index page", async (t) => {
  const res = await request(await makeApp())
    .get("/");
  t.is(res.status, 200);
  t.deepEqual(res.body.data, "API index");
});

test("Returns CORS header", async (t) => {
  const res = await request(await makeApp())
    .get("/");
  t.is(res.header["access-control-allow-origin"], "*");
});

test("All API endpoints inside api_v1 should return 401 as JSON", async (t) => {
  const res = await request(await makeApp())
    .get("/foobarbaz");
  t.is(res.status, 401);
  //All api access except index will return 401 unauthorized
  //t.is(res.type, "application/json");
});

//TODO: We need to check for all the routes access before and after login

/*test("After successful login missing API endpoints returns 404 as JSON", async (t) => {
  const app: express.Express = t.context.app;

  const rawPassword = "aVeryStrongPassword";
  const admin: IExistingUserDBEntry = {
    username: "adminUser",
    hashedPw: bcrypt.hashSync(rawPassword, saltLength),
    admin: true,
  };
  const standard: IExistingUserDBEntry = {
    username: "standardUser",
    hashedPw: bcrypt.hashSync(rawPassword, saltLength),
    admin: false,
  };

  // add usersRes
  const db: mongo.Db = app.locals.db;
  await db.collection("users").insertMany([admin, standard]);

  // get admin user
  const adminRes = await request(app)
    .post("/login")
    .send({
      username: admin.username,
      password: rawPassword,
    });
  t.is(adminRes.status, 200);
  t.is(adminRes.body.data.admin, true);
  t.is(adminRes.body.data.username, admin.username);

  const missingRes = await request(app)
    .get("/foobarbaz");
  t.is(missingRes.status, 404);

  // get standard user
  const standardRes = await request(app)
    .post("/login")
    .send({
      username: standard.username,
      password: rawPassword,
    });
  t.is(standardRes.status, 200);
  t.is(standardRes.body.data.admin, false);
  t.is(standardRes.body.data.username, standard.username);

  const res = await request(await makeApp())
    .get("/foobarbaz")    
    .set("Authorization", 'JWT '+standardRes.body.data.token);
  t.is(res.status, 404);
});*/