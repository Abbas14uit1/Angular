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
const signup_1 = require("../../../src/lib/login/signup");
ava_1.test.beforeEach("connect to DB", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.db = yield connectDb_1.getConnection();
}));
ava_1.test.afterEach.always("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.db.dropDatabase();
}));
ava_1.test("Save an admin", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const user = {
        admin: true,
        active: true,
        superAdmin: false,
        username: "foo",
        password: "bar",
        confName: "SEC",
    };
    const saveResult = yield signup_1.saveUserToMongo(db, user);
    t.is(saveResult, true);
    const userDoc = yield db.collection("users").find({ username: user.username }).toArray();
    t.is(userDoc[0].admin, true);
}));
ava_1.test("Save an super admin", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const user = {
        admin: true,
        active: true,
        superAdmin: true,
        username: "foo",
        password: "bar",
        confName: "SEC",
    };
    const saveResult = yield signup_1.saveUserToMongo(db, user);
    t.is(saveResult, true);
    const userDoc = yield db.collection("users").find({ username: user.username }).toArray();
    t.is(userDoc[0].superAdmin, true);
}));
ava_1.test("Hash is saved to DB instead of password", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const user = {
        admin: true,
        active: true,
        superAdmin: false,
        username: "foo",
        password: "bar",
        confName: "SEC",
    };
    yield signup_1.saveUserToMongo(db, user);
    const userDoc = yield db.collection("users").find({ username: user.username }).toArray();
    t.is(userDoc[0].password, undefined);
    t.not(userDoc[0].hashedPw, undefined);
}));
ava_1.test("Throws error when the username is taken", (t) => __awaiter(this, void 0, void 0, function* () {
    const db = t.context.db;
    const user = {
        admin: true,
        active: true,
        superAdmin: false,
        username: "foo",
        password: "bar",
        confName: "SEC",
    };
    yield signup_1.saveUserToMongo(db, user);
    yield t.throws(signup_1.saveUserToMongo(db, user));
}));
//# sourceMappingURL=signup.test.js.map