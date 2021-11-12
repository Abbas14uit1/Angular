import { test } from "ava";
import * as bcrypt from "bcryptjs";
import * as bodyparser from "body-parser";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as mongo from "mongodb";
import * as request from "supertest";

import { jwtSecret, saltLength } from "../../../src/config/config";
import { getConnection } from "../../helpers/connectDb";

import { IExistingUserDBEntry } from "../../../src/lib/login/loginExisting";
import { loginErrorMessages, loginRouter } from "../../../src/routes/users/login";
import { apiRouter } from "../../../src/routes/api_v1/apiIndex.route";

async function makeApp() {
  const app = express();
  const db = await getConnection();
  app.locals.db = db;
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/", loginRouter);
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/api_v1",apiRouter)
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
  const undefinedRes = await request(app)
    .post("/")
    .send({
      username: undefined,
      password: "aVeryGoodPassword",
    });
  t.is(undefinedRes.status, 400);
  t.is(undefinedRes.body.errors[0].code, "LoginError");
  t.is(undefinedRes.body.errors[0].title, loginErrorMessages.blankUsernameOrPassword);

  const blankRes = await request(app)
    .post("/")
    .send({
      username: "",
      password: "aVeryGoodPassword",
    });
  t.is(blankRes.status, 400);
  t.is(blankRes.body.errors[0].code, "LoginError");
  t.is(blankRes.body.errors[0].title, loginErrorMessages.blankUsernameOrPassword);
});

test("Undefined and blank passwords are rejected", async (t) => {
  const app: express.Express = t.context.app;
  const undefinedRes = await request(app)
    .post("/")
    .send({
      username: "myUsername",
      password: undefined,
    });
  t.is(undefinedRes.status, 400);
  t.is(undefinedRes.body.errors[0].code, "LoginError");
  t.is(undefinedRes.body.errors[0].title, loginErrorMessages.blankUsernameOrPassword);

  const blankRes = await request(app)
    .post("/")
    .send({
      username: "myUsername",
      password: "",
    });
  t.is(blankRes.status, 400);
  t.is(blankRes.body.errors[0].code, "LoginError");
  t.is(blankRes.body.errors[0].title, loginErrorMessages.blankUsernameOrPassword);
});

test("Usernames and passwords failing regex are rejected", async (t) => {
  const app: express.Express = t.context.app;
  const usernameRes = await request(app)
    .post("/")
    .send({
      username: 4,
      password: "aVeryGoodPassword",
    });
  t.is(usernameRes.status, 400);
  t.is(usernameRes.body.errors[0].code, "LoginError");
  const passwordRes = await request(app)
    .post("/")
    .send({
      username: "MyUsername",
      password: 4,
    });
  t.is(passwordRes.status, 400);
  t.is(passwordRes.body.errors[0].code, "LoginError");
});

test("Login fails when user does not exist in DB", async (t) => {
  // Note: user not found and user tries to log in with wrong password are treated identically
  // and given a 403
  const app: express.Express = t.context.app;
  const loginRes = await request(app)
    .post("/")
    .send({
      username: "myUsername",
      password: "aVeryStrongPassword",
    });
  t.is(loginRes.status, 403);
  t.is(loginRes.body.errors[0].code, "LoginError");
  t.is(loginRes.body.errors[0].title, loginErrorMessages.wrongLoginDetails);
});

test("Login fails when wrong password is sent", async (t) => {
  const app: express.Express = t.context.app;

  // first add a user
  const db: mongo.Db = app.locals.db;
  await db.collection("users").insertOne({
    username: "myUsername",
    hashedPw: bcrypt.hashSync("aVeryStrongPassword", saltLength),
    admin: true,
    team: "none",
    superAdmin: true,
    isActive: true,
    confName: "SEC"
  } as IExistingUserDBEntry);

  // try to retrieve user
  const loginRes = await request(app)
    .post("/")
    .send({
      username: "myUsername",
      password: "notTheRightPassword",
    });
  t.is(loginRes.status, 403);
  t.is(loginRes.body.errors[0].code, "LoginError");
  t.is(loginRes.body.errors[0].title, loginErrorMessages.wrongLoginDetails);
});

test("Successful login returns info about admin status", async (t) => {
  const app: express.Express = t.context.app;

  const rawPassword = "aVeryStrongPassword";
  const admin: IExistingUserDBEntry = {
    username: "adminUser",
    hashedPw: bcrypt.hashSync(rawPassword, saltLength),
    admin: true,
    isActive: true,
    superAdmin: true,
    confName: "SEC"
  };
  const standard: IExistingUserDBEntry = {
    username: "standardUser",
    hashedPw: bcrypt.hashSync(rawPassword, saltLength),
    admin: false,
    isActive: true,
    superAdmin: false,
    confName: "SEC"
  };

  // add users
  const db: mongo.Db = app.locals.db;
  await db.collection("users").insertMany([admin, standard]);

  // get admin user
  const adminRes = await request(app)
    .post("/")
    .send({
      username: admin.username,
      password: rawPassword,
    });
  t.is(adminRes.status, 200);
  t.is(adminRes.body.data.admin, true);
  t.is(adminRes.body.data.username, admin.username);

  // get standard user
  const standardRes = await request(app)
    .post("/")
    .send({
      username: standard.username,
      password: rawPassword,
    });
  t.is(standardRes.status, 200);
  t.is(standardRes.body.data.admin, false);
  t.is(standardRes.body.data.username, standard.username);
});

test("Logging in returns a JSON web token", async (t) => {
  const app: express.Express = t.context.app;

  const rawPassword = "aVeryStrongPassword";
  const admin: IExistingUserDBEntry = {
    username: "adminUser",
    hashedPw: bcrypt.hashSync(rawPassword, saltLength),
    admin: true,
    isActive: true,
    superAdmin: true,
    confName: "SEC"
  };

  const db: mongo.Db = app.locals.db;
  await db.collection("users").insertOne(admin);

  const adminRes = await request(app)
    .post("/")
    .send({
      username: admin.username,
      password: rawPassword,
    });

  t.is(adminRes.status, 200);
  t.not(adminRes.body.data.token, undefined);
  t.notThrows(() => jwt.verify(adminRes.body.data.token, jwtSecret!));
  const decodedToken = jwt.verify(adminRes.body.data.token, jwtSecret!) as {
    username: string,
    admin: boolean,
  };
  t.is(decodedToken.admin, true);
  t.is(decodedToken.username, admin.username);
});


async function loginAndGetToken(app: express.Express){
  const db: mongo.Db = app.locals.db;
  await db.collection("users").insertOne({
    username: "myUsername",
    hashedPw: bcrypt.hashSync("aVeryStrongPassword", saltLength),
    admin: true,
    team: "none",
    superAdmin: true,
    isActive: true,
    confName: "SEC"
  } as IExistingUserDBEntry);

  // try to retrieve user
  const loginRes = await request(app)
    .post("/")
    .send({
      username: "myUsername",
      password: "aVeryStrongPassword",
    });
    return loginRes.body.data.token;
}

test("Dashboard should return 200 after login", async (t) => {
  const app: express.Express = t.context.app;

  // first add a user
  const token = await loginAndGetToken(app)
  
  const dashboard = await request(app)
    .get("/api_v1/dashboard/MFB/team/8")
    .set("Authorization", 'JWT '+ token);

   t.is(dashboard.status, 200)

});