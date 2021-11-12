"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playerStats_route_1 = require("./playerStats.route");
const availableStats = express_1.Router();
exports.availableStats = availableStats;
availableStats.use("/players", playerStats_route_1.availablePlayerStats);
//# sourceMappingURL=index.js.map