import { Router } from "express";
import * as moment from "moment";
import * as mongo from "mongodb";

import { filterGamesBySeason } from "../../../lib/filterByDateQuery";
//import { allTeamsRoute } from "./allTeams.route";
import { teamNameRoute } from "./teamName.route";

const teamRoute: Router = Router();
//teamRoute.use("/", allTeamsRoute);
teamRoute.use("/name", teamNameRoute);

export { teamRoute };
