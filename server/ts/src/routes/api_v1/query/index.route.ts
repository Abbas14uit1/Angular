import { Router } from "express";
import { ahocQueryRoute } from "./adhocQuery.route";
import { queryFootBallPlayerRoute } from "./football/queryPlayer.route";
import { queryFootBallTeamRoute } from "./football/queryTeam.route";
import { queryBasketballPlayerRoute } from "./basketball/queryPlayer.route";
import { queryBasketballTeamRoute } from "./basketball/queryTeam.route";
import { queryBaseballPlayerRoute } from "./baseball/queryPlayer.route";
import { queryBaseballTeamRoute } from "./baseball/queryTeam.route";
import { queryBuilderRoute } from "./querybuilder.route";
//VAF Code
import { querySoccerPlayerRoute } from "./soccer/queryPlayer.route";
import { querySoccerTeamRoute } from "./soccer/queryTeam.route";

const queryRoute: Router = Router();
// the "/" route is for all players and getting a player by ID
queryRoute.use("/player", queryFootBallPlayerRoute);
queryRoute.use("/team", queryFootBallTeamRoute);
queryRoute.use("/basketball/player", queryBasketballPlayerRoute);
queryRoute.use("/basketball/team", queryBasketballTeamRoute);
queryRoute.use("/baseball/player", queryBaseballPlayerRoute);
queryRoute.use("/baseball/team", queryBaseballTeamRoute);
queryRoute.use("/querybuilder",queryBuilderRoute);
queryRoute.use("/ahocQuery", ahocQueryRoute);

//VAF Code
queryRoute.use("/soccer/player", querySoccerPlayerRoute);
queryRoute.use("/soccer/team", querySoccerTeamRoute);


export { queryRoute };
