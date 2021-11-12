import { Router } from "express";

import { availablePlayerStats } from "./playerStats.route";

const availableStats: Router = Router();

availableStats.use("/players", availablePlayerStats);

export { availableStats };
