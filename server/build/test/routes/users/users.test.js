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
const request = require("supertest");
const connectDb_1 = require("../../helpers/connectDb");
const login_1 = require("../../../src/routes/users/login");
const users_route_1 = require("../../../src/routes/users/users.route");
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const db = yield connectDb_1.getConnection();
        app.locals.db = db;
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/", login_1.loginRouter);
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/users", users_route_1.usersRoute);
        return app;
    });
}
ava_1.test.beforeEach("make app", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
}));
ava_1.test.afterEach("drop DB", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.context.app.locals.db.dropDatabase();
}));
ava_1.test("Insert a new user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: false,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
    }
}));
ava_1.test("Insert a default user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
        t.is(user.admin, false);
        t.is(user.superAdmin, false);
    }
}));
ava_1.test("Insert a admin user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: true,
        superAdmin: false,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
        t.is(user.admin, true);
    }
}));
ava_1.test("Insert a super admin user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: true,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
        t.is(user.superAdmin, true);
    }
}));
ava_1.test("Insert same user twice should result in an error", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: true,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    const sameUserRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: true,
        email: "foo@bar.com",
    });
    t.is(sameUserRes.status, 500);
}));
ava_1.test("Update the user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: false,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    let userToUpdate;
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
        t.is(user.superAdmin, false);
        userToUpdate = user;
    }
    const updateUserResp = yield request(app)
        .put("/users").send({
        id: userToUpdate.id,
        username: "foo1",
        password: "aVeryGoodPassword",
        admin: true,
        superAdmin: true,
        email: "foo1@bar.com",
    });
    t.is(updateUserResp.status, 200);
    const getUpdatedRes = yield request(app)
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
}));
ava_1.test("Delete the user", (t) => __awaiter(this, void 0, void 0, function* () {
    const app = t.context.app;
    const userRes = yield request(app)
        .post("/users")
        .send({
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: false,
        email: "foo@bar.com",
    });
    t.is(userRes.status, 201);
    let userToUpdate;
    const getRes = yield request(app)
        .get("/users").send();
    t.is(getRes.status, 200);
    t.is(getRes.body.data.length, 1);
    for (const user of getRes.body.data) {
        t.is(user.username, "foo");
        t.is(user.isActive, true);
        t.is(user.superAdmin, false);
        userToUpdate = user;
    }
    const updateUserResp = yield request(app)
        .put("/users/delete").send({
        id: userToUpdate.id,
        username: "foo",
        password: "aVeryGoodPassword",
        admin: false,
        superAdmin: false,
        email: "foo@bar.com",
    });
    t.is(updateUserResp.status, 200);
    const getUpdatedRes = yield request(app)
        .get("/users").send();
    t.is(getUpdatedRes.status, 200);
    t.is(getUpdatedRes.body.data.length, 0);
}));
//# sourceMappingURL=users.test.js.map