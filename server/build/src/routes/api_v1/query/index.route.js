"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adhocQuery_route_1 = require("./adhocQuery.route");
const queryPlayer_route_1 = require("./football/queryPlayer.route");
const queryTeam_route_1 = require("./football/queryTeam.route");
const queryPlayer_route_2 = require("./basketball/queryPlayer.route");
const queryTeam_route_2 = require("./basketball/queryTeam.route");
const queryPlayer_route_3 = require("./baseball/queryPlayer.route");
const queryTeam_route_3 = require("./baseball/queryTeam.route");
const querybuilder_route_1 = require("./querybuilder.route");
//VAF Code
const queryPlayer_route_4 = require("./soccer/queryPlayer.route");
const queryTeam_route_4 = require("./soccer/queryTeam.route");
const queryRoute = express_1.Router();
exports.queryRoute = queryRoute;
// the "/" route is for all players and getting a player by ID
queryRoute.use("/player", queryPlayer_route_1.queryFootBallPlayerRoute);
queryRoute.use("/team", queryTeam_route_1.queryFootBallTeamRoute);
queryRoute.use("/basketball/player", queryPlayer_route_2.queryBasketballPlayerRoute);
queryRoute.use("/basketball/team", queryTeam_route_2.queryBasketballTeamRoute);
queryRoute.use("/baseball/player", queryPlayer_route_3.queryBaseballPlayerRoute);
queryRoute.use("/baseball/team", queryTeam_route_3.queryBaseballTeamRoute);
queryRoute.use("/querybuilder", querybuilder_route_1.queryBuilderRoute);
queryRoute.use("/ahocQuery", adhocQuery_route_1.ahocQueryRoute);
//VAF Code
queryRoute.use("/soccer/player", queryPlayer_route_4.querySoccerPlayerRoute);
queryRoute.use("/soccer/team", queryTeam_route_4.querySoccerTeamRoute);
//# sourceMappingURL=index.route.js.map