import { Router } from "express";
import * as mongo from "mongodb";
const teamNameRoute: Router = Router();

/**
 * Get a specific team by name, optionally filtering by season
 */
teamNameRoute.get("/:teamName", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const season: number | undefined = req.query.season && Number.parseInt(req.query.season);
  if (req.query.season && !season) {
    // NaN considered falsy
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
  } else {
    if (season) {
      // specified season
      const team = await db.collection("teams").aggregate([
        { $match: { tidyName: req.params.teamName } },
        {
          $project: {
            //games: filterGamesBySeason(season),
            _id: 1,
            name: 1,
            tidyName: 1,
            players: 1,
          },
        },
      ]).toArray();
      res.status(200).json({
        // team[0] because aggregation returns array (despite us only requesting the one team)
        data: team[0],
      });
    } else {
      const team = await db.collection("teams").findOne({ tidyName: req.params.teamName });
      res.status(200).json({
        data: team,
      });
    }
  }
});

/**
 * Get the team code for a given team id 
 */
teamNameRoute.get("/teamcode/:id", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    { $match: { _id: req.params.id } },
    {
      $project: {
        code: 1,
      },
    },
  ];
  try {
    const team = await db.collection("teams").aggregate(pipeline).toArray();
    res.status(200).json({
      data: team,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during player query retrieval",
        message: err.message,
      }],
    });
  }

});

export { teamNameRoute };
