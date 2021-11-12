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
const bodyparser = require("body-parser");
const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const config_1 = require("../../../src/config/config");
const connectDb_1 = require("../../helpers/connectDb");
const signup_1 = require("../../../src/routes/users/signup");
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const db = yield connectDb_1.getConnection();
        app.locals.db = db;
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/", signup_1.signupRouter);
        return app;
    });
}
ava_1.test.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
}));
ava_1.test.afterEach("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
ava_1.test("Undefined and blank usernames are rejected", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const postRes = yield request(app)
        .post("/")
        .send({
        username: undefined,
        password: "aVeryGoodPassword",
        admin: false,
    });
    t.is(postRes.status, 400);
    const blankUsernameRes = yield request(app)
        .post("/")
        .send({
        username: "",
        password: "aVeryGoodPassword",
        admin: false,
    });
    t.is(blankUsernameRes.status, 400);
}));
ava_1.test("Undefined and blank passwords are rejected", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const postRes = yield request(app)
        .post("/")
        .send({
        username: "MyUsername",
        password: undefined,
        admin: false,
    });
    t.is(postRes.status, 400);
}));
ava_1.test("Usernames and passwords failing regex are rejected", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const usernameRes = yield request(app)
        .post("/")
        .send({
        username: 4,
        password: "aVeryGoodPassword",
        admin: false,
    });
    t.is(usernameRes.status, 400);
    const passwordRes = yield request(app)
        .post("/")
        .send({
        username: "MyUsername",
        password: 4,
        admin: false,
    });
    t.is(passwordRes.status, 400);
}));
ava_1.test("Adding an admin fails when JSON web token does not specify admin", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const postRes = yield request(app)
        .post("/")
        .send({
        username: "MyUsername",
        password: "aVeryGoodPassword",
        admin: true,
    });
    t.is(postRes.status, 401);
}));
ava_1.test("Adds an admin to the database via upload route", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const postRes = yield request(app)
        .post("/")
        .set("Authorization", "JWT " + jwt.sign({ username: "existingUser", admin: true }, config_1.jwtSecret, config_1.jwtSignOpts))
        .send({
        username: "MyUsername",
        password: "aVeryGoodPassword",
        admin: true,
    });
    t.is(postRes.status, 201);
}));
ava_1.test("Malformed username is rejected", (t) => {
    t.false(signup_1.usernameTest("789&&&*(&DF"));
});
ava_1.test("Malformed password is rejected", (t) => {
    t.false(signup_1.passwordTest(`a multi
  line password`));
});
ava_1.test("Successful signups return a JSON web token", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const user = {
        username: "MyUsername",
        password: "aVeryGoodPassword",
        admin: true,
    };
    const postRes = yield request(app)
        .post("/")
        .set("Authorization", "JWT " + jwt.sign({ username: "existingUser", admin: true }, config_1.jwtSecret, config_1.jwtSignOpts))
        .send(user);
    t.not(postRes.body.data.token, undefined);
    const token = jwt.verify(postRes.body.data.token, config_1.jwtSecret);
    t.is(token.admin, user.admin);
    t.is(token.username, user.username);
}));
//# sourceMappingURL=signup.test.js.map