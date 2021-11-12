"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const express_1 = require("express");
const availableStats_1 = require("./availableStats");
const alerts_route_1 = require("./alerts/alerts.route");
const analytics_route_1 = require("./analytics/analytics.route");
const dashboard_route_1 = require("./dashboard/dashboard.route");
// import { gamesRoutes } from "./games/games.route";
const player_route_1 = require("./player/player.route");
const index_route_1 = require("./players/index.route");
const plays_route_1 = require("./plays/plays.route");
const index_route_2 = require("./query/index.route");
const records_route_1 = require("./records/records.route");
const stories_route_1 = require("./stories/stories.route");
const index_route_3 = require("./teams/index.route");
const index_1 = require("./upload/index");
const passport = require("passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("../../config/config");
const game_route_1 = require("./game/game.route");
const apiRouter = express_1.Router();
exports.apiRouter = apiRouter;
// Upload route is added pre-CORS because it uses its own configuration
apiRouter.use("/upload", index_1.uploadRoute);
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
const jwtOpts = {
    secretOrKey: config_1.jwtSecret,
    algorithms: [config_1.jwtSignOpts.algorithm],
    ignoreExpiration: false,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeader(),
};
passport.use("jwt", new passport_jwt_1.Strategy(jwtOpts, (payload, done) => {
    if (!payload) {
        done(null, false);
    }
    else {
        done(null, { admin: payload.admin });
    }
}));
apiRouter.use(passport.initialize());
apiRouter.use(passport.session());
apiRouter.use(passport.authenticate("jwt", { session: false }));
apiRouter.use("/availableStats", passport.authenticate('jwt', { session: false }), availableStats_1.availableStats);
// apiRouter.use("/games", passport.authenticate('jwt', {session: false}), gamesRoutes);
apiRouter.use("/game", passport.authenticate('jwt', { session: false }), game_route_1.gameRoutes);
apiRouter.use("/players", passport.authenticate('jwt', { session: false }), index_route_1.playersRoute);
apiRouter.use("/player", passport.authenticate('jwt', { session: false }), player_route_1.playerRoutes);
apiRouter.use("/plays", passport.authenticate('jwt', { session: false }), plays_route_1.playRoutes);
apiRouter.use("/teams", passport.authenticate('jwt', { session: false }), index_route_3.teamRoute);
apiRouter.use("/query", passport.authenticate('jwt', { session: false }), index_route_2.queryRoute);
apiRouter.use("/alerts", passport.authenticate('jwt', { session: false }), alerts_route_1.alertsRoute);
apiRouter.use("/analytics", passport.authenticate('jwt', { session: false }), analytics_route_1.analyticsRoute);
apiRouter.use("/dashboard", passport.authenticate('jwt', { session: false }), dashboard_route_1.dashboardRoutes);
apiRouter.use("/records", passport.authenticate('jwt', { session: false }), records_route_1.recordRoutes);
apiRouter.use("/stories", passport.authenticate('jwt', { session: false }), stories_route_1.storiesRoute);
// catch 404 and forward to error handler
apiRouter.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
apiRouter.use((err, req, res, next) => {
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
//# sourceMappingURL=apiIndex.route.js.map