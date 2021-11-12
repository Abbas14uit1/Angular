"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const express_1 = require("express");
const passport = require("passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("../../../../src/config/config");
const game_route_1 = require("./game.route");
const gamejson_route_1 = require("./gamejson.route");
const uploadRoute = express_1.Router();
exports.uploadRoute = uploadRoute;
const corsOptions = {
    // fixes [#80](https://gitlab.com/Athlyte/football-portal/issues/80)
    origin: true,
    credentials: true,
};
const jwtOpts = {
    secretOrKey: config_1.jwtSecret,
    algorithms: [config_1.jwtSignOpts.algorithm],
    ignoreExpiration: true,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeader(),
};
passport.use("jwt", new passport_jwt_1.Strategy(jwtOpts, (payload, done) => {
    if (!payload || !payload.admin) {
        done(null, false);
    }
    else {
        done(null, { admin: payload.admin });
    }
}));
uploadRoute.use(passport.initialize());
uploadRoute.use(cors(corsOptions));
/**
 * Add CORS and check user privileges
 * Note: this simply ensures that a token is valid; it DOES NOT check database for the existance of a user
 * with that token ID. This should have already been done by the login route!
 */
uploadRoute.use(passport.authenticate("jwt", { session: false }));
/**
 * GET route to test whether JSON web token is valid.
 * Execution only reaches this point for valid tokens.
 */
uploadRoute.get("/", (req, res, next) => {
    try {
        return res.sendStatus(200);
    }
    catch (err) {
        return res.status(500).send(err);
    }
});
uploadRoute.use("/games", game_route_1.gameRoute);
uploadRoute.use("/gamesjson", gamejson_route_1.gameJsonRoute);
//# sourceMappingURL=index.js.map