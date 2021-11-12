import { Router } from "express";
import * as mongo from "mongodb";

const playRoutes: Router = Router();

/**
 * Get all plays (limiting to 1000),
 * with the ?gameId=foo query limiting plays to a certain game.
 */
playRoutes.get("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const plays = await db.collection("plays").find({}).limit(1000).toArray();
  res.status(200).json({
    data: plays,
  });
});

/**
 * Get a play by unique Mongo play ID
 * Good for client API use, since lists of play IDs are frequently returned within other responses
 */
playRoutes.get("/:playId", async (req, res, next) => {
  try {
    const db: mongo.Db = req.app.locals.db;
    const play = await db.collection("plays").findOne({ _id: req.params.playId });
    res.status(200).json({
      data: play,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Error occured while fetching data from Mongo",
        message: err.message,
      }],
    });
  }
});

export { playRoutes };
