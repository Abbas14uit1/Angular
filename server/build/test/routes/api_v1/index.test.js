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
const express = require("express");
const fs = require("graceful-fs");
const pify = require("pify");
const request = require("supertest");
const bodyparser = require("body-parser");
const apiIndex_route_1 = require("../../../src/routes/api_v1/apiIndex.route");
const _testConfiguration_1 = require("../../config/_testConfiguration");
const connectDb_1 = require("../../helpers/connectDb");
const login_1 = require("../../../src/routes/users/login");
ava_1.default.beforeEach("make app before you attempt a login", (t) => __awaiter(this, void 0, void 0, function* () {
    t.context.app = yield makeApp();
}));
/*test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});*/
function makeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const db = yield connectDb_1.getConnection();
        app.locals.db = db;
        app.use("/", apiIndex_route_1.apiRouter);
        app.use(bodyparser.json()); // necessary for sending JSON data
        app.use("/login", login_1.loginRouter);
        return app;
    });
}
ava_1.default("Test file exists", (t) => __awaiter(this, void 0, void 0, function* () {
    t.notThrows(() => pify(fs.stat)(_testConfiguration_1.statcrewXml2016));
}));
ava_1.default("index page", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(yield makeApp())
        .get("/");
    t.is(res.status, 200);
    t.deepEqual(res.body.data, "API index");
}));
ava_1.default("Returns CORS header", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(yield makeApp())
        .get("/");
    t.is(res.header["access-control-allow-origin"], "*");
}));
ava_1.default("All API endpoints inside api_v1 should return 401 as JSON", (t) => __awaiter(this, void 0, void 0, function* () {
    const res = yield request(yield makeApp())
        .get("/foobarbaz");
    t.is(res.status, 401);
    //All api access except index will return 401 unauthorized
    //t.is(res.type, "application/json");
}));
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
//# sourceMappingURL=index.test.js.map