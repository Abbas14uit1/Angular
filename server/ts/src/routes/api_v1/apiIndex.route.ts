import * as cors from "cors";
import { Request, Response, Router } from "express";

import { XMLParser } from "../../lib/XMLParser";

import { availableStats } from "./availableStats";
import { alertsRoute } from "./alerts/alerts.route";
import { analyticsRoute } from "./analytics/analytics.route";
import { dashboardRoutes } from "./dashboard/dashboard.route";
// import { gamesRoutes } from "./games/games.route";
import { playerRoutes } from "./player/player.route";
import { playersRoute } from "./players/index.route";
import { playRoutes } from "./plays/plays.route";
import { queryRoute } from "./query/index.route";
import { recordRoutes } from "./records/records.route";
import { storiesRoute } from "./stories/stories.route"
import { teamRoute } from "./teams/index.route";
import { uploadRoute } from "./upload/index";
import * as passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";

import { jwtSecret, jwtSignOpts } from "../../config/config";

import * as Athlyte from "../../../../../typings/athlyte/football";
import { gameRoutes } from "./game/game.route";

const apiRouter: Router = Router();

// Upload route is added pre-CORS because it uses its own configuration
apiRouter.use("/upload", uploadRoute);

/**
 * CORS headers for non-authenticated routes
 */
// const corsOptions = { origin: "http://localhost:8080" };
apiRouter.use(cors());

/* GET API page. */
apiRouter.get("/", (req, res, next) => {
  res.status(200)
    .send({
      data: "API index",
    });
});

const jwtOpts: StrategyOptions = {
  secretOrKey: jwtSecret!,
  algorithms: [jwtSignOpts.algorithm!],
  ignoreExpiration: false,
  jwtFromRequest: ExtractJwt.fromAuthHeader(), // refers to "Authorization" header
};

passport.use("jwt", new JwtStrategy(jwtOpts, (payload, done) => {
  if (!payload) {
    done(null, false);
  } else {
    done(null, { admin: payload.admin });
  }
}));

apiRouter.use(passport.initialize());
apiRouter.use(passport.session());
apiRouter.use(passport.authenticate("jwt", { session: false }));
apiRouter.use("/availableStats", passport.authenticate('jwt', {session: false}), availableStats);
// apiRouter.use("/games", passport.authenticate('jwt', {session: false}), gamesRoutes);
apiRouter.use("/game", passport.authenticate('jwt', {session: false}), gameRoutes);
apiRouter.use("/players", passport.authenticate('jwt', {session: false}), playersRoute);
apiRouter.use("/player", passport.authenticate('jwt', {session: false}), playerRoutes);
apiRouter.use("/plays", passport.authenticate('jwt', {session: false}), playRoutes);
apiRouter.use("/teams", passport.authenticate('jwt', {session: false}), teamRoute);
apiRouter.use("/query", passport.authenticate('jwt', {session: false}), queryRoute);
apiRouter.use("/alerts", passport.authenticate('jwt', {session: false}), alertsRoute);
apiRouter.use("/analytics", passport.authenticate('jwt', {session: false}), analyticsRoute);
apiRouter.use("/dashboard", passport.authenticate('jwt', {session: false}), dashboardRoutes);
apiRouter.use("/records", passport.authenticate('jwt', {session: false}), recordRoutes);
apiRouter.use("/stories", passport.authenticate('jwt', {session: false}), storiesRoute);

// catch 404 and forward to error handler
apiRouter.use((req, res, next) => {
  const err = new Error("Not Found") as Error & { status?: number };
  err.status = 404;
  next(err);
});

apiRouter.use((err: any, req: Request, res: Response, next: () => void) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    errors: [{
      code: "ExpressError",
      title: res.locals.message,
      message: res.locals.message,
      details: res.locals.err,
    }],
  });
});

export { apiRouter };
