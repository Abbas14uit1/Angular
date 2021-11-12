import * as cors from "cors";
import { Request, Response, Router } from "express";
import * as passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";

import { jwtSecret, jwtSignOpts } from "../../../../src/config/config";

import { gameRoute } from "./game.route";
import { gameJsonRoute } from "./gamejson.route";


const uploadRoute: Router = Router();
const corsOptions: cors.CorsOptions = {
  // fixes [#80](https://gitlab.com/Athlyte/football-portal/issues/80)
  origin: true, // reflect
  credentials: true,
};

const jwtOpts: StrategyOptions = {
  secretOrKey: jwtSecret!,
  algorithms: [jwtSignOpts.algorithm!],
  ignoreExpiration: true,
  jwtFromRequest: ExtractJwt.fromAuthHeader(), // refers to "Authorization" header
};

passport.use("jwt", new JwtStrategy(jwtOpts, (payload, done) => {
  if (!payload || !payload.admin) {
    done(null, false);
  } else {
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
  } catch (err) {
    return res.status(500).send(err);
  }
});

uploadRoute.use("/games", gameRoute);
uploadRoute.use("/gamesjson", gameJsonRoute);

export { uploadRoute };
