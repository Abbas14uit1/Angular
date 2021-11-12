"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const connectDb_1 = require("../../helpers/connectDb");
const loginExisting_1 = require("../../../src/lib/login/loginExisting");
const signup_1 = require("../../../src/lib/login/signup");
ava_1.test.beforeEach("connect to DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.db.dropDatabase();
}));
const newUserData = {
    admin: true,
    password: "bar",
    username: "foo",
    confName: "SEC",
    active: true,
    superAdmin: false,
};
const existingUserData = {
    username: newUserData.username,
    password: newUserData.password,
};
ava_1.test("Login as existing admin", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const saveResult = yield signup_1.saveUserToMongo(db, newUserData);
    t.is(saveResult, true);
    const loginInfo = yield loginExisting_1.loginExistingUser(db, existingUserData);
    t.true(loginInfo.admin);
    t.is(loginInfo.username, newUserData.username);
}));
ava_1.test("Login as existing super admin", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    newUserData.superAdmin = true;
    newUserData.active = true;
    const saveResult = yield signup_1.saveUserToMongo(db, newUserData);
    const loginInfo = yield loginExisting_1.loginExistingUser(db, existingUserData);
    t.true(loginInfo.superAdmin);
    t.is(loginInfo.username, newUserData.username);
}));
ava_1.test("Attempt Login as inactive user", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    newUserData.active = false;
    const saveResult = yield signup_1.saveUserToMongo(db, newUserData);
    const loginInfo = yield loginExisting_1.loginExistingUser(db, existingUserData);
    t.false(loginInfo.isActive);
}));
ava_1.test("Login fails for user who doesn't exist", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    yield t.throws(loginExisting_1.loginExistingUser(db, existingUserData));
}));
//# sourceMappingURL=loginExisting.test.js.map