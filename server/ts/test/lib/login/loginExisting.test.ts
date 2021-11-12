import { test } from "ava";
import * as mongo from "mongodb";

import { getConnection } from "../../helpers/connectDb";

import { IExistingUserInput, loginExistingUser } from "../../../src/lib/login/loginExisting";
import { INewUserInput, saveUserToMongo } from "../../../src/lib/login/signup";

test.beforeEach("connect to DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.db.dropDatabase();
});

const newUserData: INewUserInput = {
  admin: true,
  password: "bar",
  username: "foo",
  confName:"SEC",
  active: true,
  superAdmin: false,
};

const existingUserData: IExistingUserInput = {
  username: newUserData.username,
  password: newUserData.password,
};

test("Login as existing admin", async (t) => {
  const db: mongo.Db = t.context.db;
  const saveResult = await saveUserToMongo(db, newUserData);
  t.is(saveResult, true);
  const loginInfo = await loginExistingUser(db, existingUserData);
  t.true(loginInfo.admin);
  t.is(loginInfo.username, newUserData.username);
});


test("Login as existing super admin", async (t) => {
  const db: mongo.Db = t.context.db;
  newUserData.superAdmin = true;
  newUserData.active = true;
  const saveResult = await saveUserToMongo(db, newUserData);
  const loginInfo = await loginExistingUser(db, existingUserData);
  t.true(loginInfo.superAdmin);
  t.is(loginInfo.username, newUserData.username);
});

test("Attempt Login as inactive user", async (t) => {
  const db: mongo.Db = t.context.db;
  newUserData.active = false;
  const saveResult = await saveUserToMongo(db, newUserData);
  const loginInfo = await loginExistingUser(db, existingUserData);
  t.false(loginInfo.isActive)
  
});

test("Login fails for user who doesn't exist", async (t) => {
  const db: mongo.Db = t.context.db;
  await t.throws(loginExistingUser(db, existingUserData));
});
