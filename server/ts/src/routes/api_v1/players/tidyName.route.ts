import { Router } from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";

import { filterGamesByRange, filterGamesBySeason } from "../../../lib/filterByDateQuery";
import { calculatePlayerAgg } from "./calculatePlayerAggregate";

import { ICommonStats } from "../../../../../../typings/athlyte/football/common-stats.d";
import { IPerGamePlayerStats } from "../../../../../../typings/athlyte/football/player.d";

const playerNameRoute: Router = Router();

/**
 * Get a player by name, optionally a player's stats to a certain season
 */
playerNameRoute.get("/:sportCode/:tidyName", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season) : undefined;
  if (req.query.season && isNaN(season!)) {
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
  } else if (req.query.season && season) {
    // season was specified, so limit to a particular season (among all players)
    // Note: tidyName is expected to ALWAYS BE UNIQUE
    const players = await db.collection("players").aggregate([
      { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
      {
        $project: {
          games: filterGamesBySeason(season),
          _id: 1,
          name: 1,
          tidyName: 1,
          teamName: 1,
          teamId: 1,
        },
      },
    ]).toArray();
    res.status(200).json({
      data: players[0],
    });
  } else {
    const players = await db.collection("players").findOne({ tidyName: req.params.tidyName, sportCode: req.params.sportCode });
    res.status(200).json({
      data: players,
    });
  }
});

/**
 * Get aggregate stats for a player (by name),
 * optionally restricting stats to within a range of dates
 * using `from` and `to` queries.
 * Dates should be in ISO8601 ormat (YYYY-MM-DD).
 * If `to` is blank, defaults to current date.
 * If `from` is blank, defaults to earliest record.
 * If both are blank, returns lifetime stats.
 * Alternatively, can specify a season to get stats from that season.
 * Ex: /HURTS,JALEN/aggregate?from=2016-01-01&to=2016-05-31
 * Ex: /HURTS,JALEN/aggregate?season=2016
 */
playerNameRoute.get("/:sportCode/:tidyName/aggregate", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const from: Date | undefined = req.query.from ? moment(req.query.from, "YYYY-MM-DD").toDate() : undefined;
  const to: Date | undefined = req.query.to ? moment(req.query.to, "YYYY-MM-DD").toDate() : undefined;
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season) : undefined;
  let player: any;
  // get relevant data
  try {
    if (from && to && season) {
      res.status(406).json({
        errors: [{
          code: "DateError",
          title: "Too many parameters",
          message: "Too many parameters were supplied; should supply either (from AND to) OR season",
        }],
      });
      return;
    } else if (season !== undefined) {
      const players = await db.collection("players").aggregate([
        { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
        {
          $project: {
            games: filterGamesBySeason(season),
            _id: 1,
            name: 1,
            tidyName: 1,
            teamName: 1,
            teamId: 1,
          },
        },
      ]).toArray();
      player = players[0];
    } else {
      // if season not specified, use from and to (if they're undefined, filterGamesByDate goes from 1000AD to 3000AD)
      const players = await db.collection("players").aggregate([
        { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
        {
          $project: {
            games: filterGamesByRange(from, to),
            _id: 1,
            name: 1,
            tidyName: 1,
            teamName: 1,
            teamId: 1,
          },
        },
      ]).toArray();
      player = players[0];
    }
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Error occured while fetching data from Mongo",
        message: err.message,
      }],
    });
    /* istanbul ignore next */
    return;
  }

  try {
    if (!player) {
      res.status(404).json({
        errors: [{
          code: "NoDataError",
          title: "Data for the requested player was not found",
          message: `Aggregation is not possible since no data was found for ${req.params.tidyName}`,
        }],
      });
      return;
    }
    const playerAggregate = calculatePlayerAgg(player);
    res.status(200).json({
      data: playerAggregate,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during player data aggregation",
        message: err.message,
      }],
    });
  }
});

export { playerNameRoute };
