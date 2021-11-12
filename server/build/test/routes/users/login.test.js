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
const bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const config_1 = require("../../../src/config/config");
const connectDb_1 = require("../../helpers/connectDb");
const login_1 = require("../../../src/routes/users/login");
const apiIndex_route_1 = require("../../../src/routes/api_v1/apiIndex.route");
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const db = yield connectDb_1.getConnection();
        app.locals.db = db;
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/", login_1.loginRouter);
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/api_v1", apiIndex_route_1.apiRouter);
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
    const undefinedRes = yield request(app)
        .post("/")
        .send({
        username: undefined,
        password: "aVeryGoodPassword",
    });
    t.is(undefinedRes.status, 400);
    t.is(undefinedRes.body.errors[0].code, "LoginError");
    t.is(undefinedRes.body.errors[0].title, login_1.loginErrorMessages.blankUsernameOrPassword);
    const blankRes = yield request(app)
        .post("/")
        .send({
        username: "",
        password: "aVeryGoodPassword",
    });
    t.is(blankRes.status, 400);
    t.is(blankRes.body.errors[0].code, "LoginError");
    t.is(blankRes.body.errors[0].title, login_1.loginErrorMessages.blankUsernameOrPassword);
}));
ava_1.test("Undefined and blank passwords are rejected", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const undefinedRes = yield request(app)
        .post("/")
        .send({
        username: "myUsername",
        password: undefined,
    });
    t.is(undefinedRes.status, 400);
    t.is(undefinedRes.body.errors[0].code, "LoginError");
    t.is(undefinedRes.body.errors[0].title, login_1.loginErrorMessages.blankUsernameOrPassword);
    const blankRes = yield request(app)
        .post("/")
        .send({
        username: "myUsername",
        password: "",
    });
    t.is(blankRes.status, 400);
    t.is(blankRes.body.errors[0].code, "LoginError");
    t.is(blankRes.body.errors[0].title, login_1.loginErrorMessages.blankUsernameOrPassword);
}));
ava_1.test("Usernames and passwords failing regex are rejected", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const usernameRes = yield request(app)
        .post("/")
        .send({
        username: 4,
        password: "aVeryGoodPassword",
    });
    t.is(usernameRes.status, 400);
    t.is(usernameRes.body.errors[0].code, "LoginError");
    const passwordRes = yield request(app)
        .post("/")
        .send({
        username: "MyUsername",
        password: 4,
    });
    t.is(passwordRes.status, 400);
    t.is(passwordRes.body.errors[0].code, "LoginError");
}));
ava_1.test("Login fails when user does not exist in DB", (t) => __awaiter(this, void 0, void 0, function* () {
    // Note: user not found and user tries to log in with wrong password are treated identically
    // and given a 403
    const app = t.context.app;
    const loginRes = yield request(app)
        .post("/")
        .send({
        username: "myUsername",
        password: "aVeryStrongPassword",
    });
    t.is(loginRes.status, 403);
    t.is(loginRes.body.errors[0].code, "LoginError");
    t.is(loginRes.body.errors[0].title, login_1.loginErrorMessages.wrongLoginDetails);
}));
ava_1.test("Login fails when wrong password is sent", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    // first add a user
    const db = app.locals.db;
    yield db.collection("users").insertOne({
        username: "myUsername",
        hashedPw: bcrypt.hashSync("aVeryStrongPassword", config_1.saltLength),
        admin: true,
        team: "none",
        superAdmin: true,
        isActive: true,
        confName: "SEC"
    });
    // try to retrieve user
    const loginRes = yield request(app)
        .post("/")
        .send({
        username: "myUsername",
        password: "notTheRightPassword",
    });
    t.is(loginRes.status, 403);
    t.is(loginRes.body.errors[0].code, "LoginError");
    t.is(loginRes.body.errors[0].title, login_1.loginErrorMessages.wrongLoginDetails);
}));
ava_1.test("Successful login returns info about admin status", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const rawPassword = "aVeryStrongPassword";
    const admin = {
        username: "adminUser",
        hashedPw: bcrypt.hashSync(rawPassword, config_1.saltLength),
        admin: true,
        isActive: true,
        superAdmin: true,
        confName: "SEC"
    };
    const standard = {
        username: "standardUser",
        hashedPw: bcrypt.hashSync(rawPassword, config_1.saltLength),
        admin: false,
        isActive: true,
        superAdmin: false,
        confName: "SEC"
    };
    // add users
    const db = app.locals.db;
    yield db.collection("users").insertMany([admin, standard]);
    // get admin user
    const adminRes = yield request(app)
        .post("/")
        .send({
        username: admin.username,
        password: rawPassword,
    });
    t.is(adminRes.status, 200);
    t.is(adminRes.body.data.admin, true);
    t.is(adminRes.body.data.username, admin.username);
    // get standard user
    const standardRes = yield request(app)
        .post("/")
        .send({
        username: standard.username,
        password: rawPassword,
    });
    t.is(standardRes.status, 200);
    t.is(standardRes.body.data.admin, false);
    t.is(standardRes.body.data.username, standard.username);
}));
ava_1.test("Logging in returns a JSON web token", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const rawPassword = "aVeryStrongPassword";
    const admin = {
        username: "adminUser",
        hashedPw: bcrypt.hashSync(rawPassword, config_1.saltLength),
        admin: true,
        isActive: true,
        superAdmin: true,
        confName: "SEC"
    };
    const db = app.locals.db;
    yield db.collection("users").insertOne(admin);
    const adminRes = yield request(app)
        .post("/")
        .send({
        username: admin.username,
        password: rawPassword,
    });
    t.is(adminRes.status, 200);
    t.not(adminRes.body.data.token, undefined);
    t.notThrows(() => jwt.verify(adminRes.body.data.token, config_1.jwtSecret));
    const decodedToken = jwt.verify(adminRes.body.data.token, config_1.jwtSecret);
    t.is(decodedToken.admin, true);
    t.is(decodedToken.username, admin.username);
}));
function loginAndGetToken(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = app.locals.db;
        yield db.collection("users").insertOne({
            username: "myUsername",
            hashedPw: bcrypt.hashSync("aVeryStrongPassword", config_1.saltLength),
            admin: true,
            team: "none",
            superAdmin: true,
            isActive: true,
            confName: "SEC"
        });
        // try to retrieve user
        const loginRes = yield request(app)
            .post("/")
            .send({
            username: "myUsername",
            password: "aVeryStrongPassword",
        });
        return loginRes.body.data.token;
    });
}
ava_1.test("Dashboard should return 200 after login", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    // first add a user
    const token = yield loginAndGetToken(app);
    const dashboard = yield request(app)
        .get("/api_v1/dashboard/MFB/team/8")
        .set("Authorization", 'JWT ' + token);
    t.is(dashboard.status, 200);
}));
//# sourceMappingURL=login.test.js.map