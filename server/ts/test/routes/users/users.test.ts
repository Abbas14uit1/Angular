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
import { usersRoute } from "../../../src/routes/users/users.route";

async function makeApp() {
  const app = express();
  const db = await getConnection();
  app.locals.db = db;
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/", loginRouter);
  app.use(bodyparser.json()); // necessary for sending JSON data
  app.use("/users", usersRoute);
  return app;
}

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
});

test.afterEach("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

test("Insert a new user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: false,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
  }

});

test("Insert a default user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
    t.is(user.admin, false);
    t.is(user.superAdmin, false);
  }

});

test("Insert a admin user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: true,
      superAdmin: false,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
    t.is(user.admin, true);
  }

});

test("Insert a super admin user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: true,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
    t.is(user.superAdmin, true);
  }

});


test("Insert same user twice should result in an error", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: true,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  const sameUserRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: true,
      email: "foo@bar.com",
    });
  t.is(sameUserRes.status, 500);

});



test("Update the user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: false,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  let userToUpdate: any;
  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
    t.is(user.superAdmin, false);
    userToUpdate = user;
  }

  const updateUserResp = await request(app)
    .put("/users").send({
      id: userToUpdate.id,
      username: "foo1",
      password: "aVeryGoodPassword",
      admin: true,
      superAdmin: true,
      email: "foo1@bar.com",
    });
  t.is(updateUserResp.status, 200);

  const getUpdatedRes = await request(app)
    .get("/users").send();
  t.is(getUpdatedRes.status, 200);
  t.is(getUpdatedRes.body.data.length, 1);
  for (const user of getUpdatedRes.body.data) {
    t.is(user.username, "foo1");
    t.is(user.isActive, true);
    t.is(user.superAdmin, true);
    t.is(user.admin, true);
    t.is(user.email, "foo1@bar.com");
  }

});


test("Delete the user", async (t) => {
  const app: express.Express = t.context.app;
  const userRes = await request(app)
    .post("/users")
    .send({
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: false,
      email: "foo@bar.com",
    });
  t.is(userRes.status, 201);

  let userToUpdate: any;
  const getRes = await request(app)
    .get("/users").send();
  t.is(getRes.status, 200);
  t.is(getRes.body.data.length, 1);
  for (const user of getRes.body.data) {
    t.is(user.username, "foo");
    t.is(user.isActive, true);
    t.is(user.superAdmin, false);
    userToUpdate = user;
  }

  const updateUserResp = await request(app)
    .put("/users/delete").send({
      id: userToUpdate.id,
      username: "foo",
      password: "aVeryGoodPassword",
      admin: false,
      superAdmin: false,
      email: "foo@bar.com",
    });
  t.is(updateUserResp.status, 200);

  const getUpdatedRes = await request(app)
    .get("/users").send();
  t.is(getUpdatedRes.status, 200);
  t.is(getUpdatedRes.body.data.length, 0);


});
