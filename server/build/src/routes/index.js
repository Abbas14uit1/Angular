"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiIndex_route_1 = require("./api_v1/apiIndex.route");
const users_1 = require("./users");
const index = express_1.Router();
exports.index = index;
exports.indexHandler = (req, res, next) => {
    res.status(200).send("Athlyte Football API");
};
/* GET home page. */
index.get("/", exports.indexHandler);
index.use("/api_v1", apiIndex_route_1.apiRouter);
index.use("/users", users_1.userRouter);
//# sourceMappingURL=index.js.map