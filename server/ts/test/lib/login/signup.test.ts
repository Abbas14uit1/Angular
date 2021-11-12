import { test } from "ava";
import * as mongo from "mongodb";

import { getConnection } from "../../helpers/connectDb";

import { IExistingUserDBEntry } from "../../../src/lib/login/loginExisting";
import { INewUserInput, saveUserToMongo } from "../../../src/lib/login/signup";

test.beforeEach("connect to DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.db.dropDatabase();
});

test("Save an admin", async (t) => {
  const db: mongo.Db = t.context.db;
  const user: INewUserInput = {
    admin: true,
    active: true,
    superAdmin: false,
    username: "foo",
    password: "bar",
    confName:"SEC",
  };
  const saveResult = await saveUserToMongo(db, user);
  t.is(saveResult, true);
  const userDoc = await db.collection("users").find({ username: user.username }).toArray();
  t.is(userDoc[0].admin, true);
});


test("Save an super admin", async (t) => {
  const db: mongo.Db = t.context.db;
  const user: INewUserInput = {
    admin: true,
    active: true,
    superAdmin: true,
    username: "foo",
    password: "bar",
    confName:"SEC",
  };
  const saveResult = await saveUserToMongo(db, user);
  t.is(saveResult, true);
  const userDoc = await db.collection("users").find({ username: user.username }).toArray();
  t.is(userDoc[0].superAdmin, true);
});


test("Hash is saved to DB instead of password", async (t) => {
  const db: mongo.Db = t.context.db;
  const user: INewUserInput = {
    admin: true,
    active: true,
    superAdmin: false,
    username: "foo",
    password: "bar",
    confName:"SEC",
  };
  await saveUserToMongo(db, user);
  const userDoc: IExistingUserDBEntry[] = await db.collection("users").find({ username: user.username }).toArray();
  t.is((userDoc[0] as any).password, undefined);
  t.not(userDoc[0].hashedPw, undefined);
});

test("Throws error when the username is taken", async (t) => {
  const db: mongo.Db = t.context.db;
  const user: INewUserInput = {
    admin: true,
    active: true,
    superAdmin: false,
    username: "foo",
    password: "bar",
    confName:"SEC",
  };
  await saveUserToMongo(db, user);
  await t.throws(saveUserToMongo(db, user));
});
