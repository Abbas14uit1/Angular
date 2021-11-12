"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import { allTeamsRoute } from "./allTeams.route";
const teamName_route_1 = require("./teamName.route");
const teamRoute = express_1.Router();
exports.teamRoute = teamRoute;
//teamRoute.use("/", allTeamsRoute);
teamRoute.use("/name", teamName_route_1.teamNameRoute);
//# sourceMappingURL=index.route.js.map