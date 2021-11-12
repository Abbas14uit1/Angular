import { Router } from "express";

import { allPlayersRoute } from "./allPlayers.route";
import { playerNameRoute } from "./tidyName.route";

const playersRoute: Router = Router();

// the "/" route is for all players and getting a player by ID
playersRoute.use("/", allPlayersRoute);

// the "/name" route is for getting a player by their tidyName
playersRoute.use("/name/", playerNameRoute);

export { playersRoute };
