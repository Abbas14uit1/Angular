"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allPlayers_route_1 = require("./allPlayers.route");
const tidyName_route_1 = require("./tidyName.route");
const playersRoute = express_1.Router();
exports.playersRoute = playersRoute;
// the "/" route is for all players and getting a player by ID
playersRoute.use("/", allPlayers_route_1.allPlayersRoute);
// the "/name" route is for getting a player by their tidyName
playersRoute.use("/name/", tidyName_route_1.playerNameRoute);
//# sourceMappingURL=index.route.js.map