import { Router } from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";
import { winstonLogger } from "../../../lib/winstonLogger";

import { filterGamesByRange, filterGamesBySeason } from "../../../lib/filterByDateQuery";
import { calculatePlayerAgg } from "./calculatePlayerAggregate";

import { ICommonStats } from "../../../../../../typings/athlyte/football/common-stats.d";
import { IPerGamePlayerStats, IPlayer } from "../../../../../../typings/athlyte/football/player.d";

const allPlayersRoute: Router = Router();

/**
 * Get all players, optionally filtering by season
 */
allPlayersRoute.get("/:sportCode/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  console.log(req.query.season);
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season, 10) : undefined;
  // check whether season is invalid
  if (req.query.season && !season) {
    // NaN is considered falsy
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
    return;
  } else if (season) {
    // season is valid
    const pipeline: any[] = [
      {
      // don't return players with no games played in that season
      $match: { games: { $not: { $size: 0 } }, sportCode: req.params.sportCode },
      },
      {$project: {
        games: filterGamesBySeason(season),
        _id: 1,
        name: 1,
        tidyName: 1,
        teamName: 1,
        teamId: 1,
      }},    
    ];
    try {      
      const players = await db.collection("players").aggregate(pipeline).toArray();
      res.status(200).json({
        data: players,
      });
    } catch (err) {
      /* istanbul ignore next */
      res.status(500).json({
        errors: [{
          code: "MongoRetrievalError",
          title: "Unknown error occured during Mongo operation",
          message: err.message,
        }],
      });
    }
  } else {    
    const players = await db.collection("players").find({sportCode:{$eq: req.params.sportCode} }).toArray();
    res.status(200).json({
      data: players,
    });
  }
});

/**
 * Get info for a single player (by their Mongo ID).
 */
allPlayersRoute.get("/:playerId/playerStats", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  try {
    console.log(req.params.playerId);
    const player = await db.collection("players").findOne({ _id: req.params.playerId });
    res.status(200).json({
      data: player,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      error: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: err.message,
      }],
    });
  }
});

allPlayersRoute.get("/:playerId/aggregate", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const from: Date | undefined = req.query.from ? moment(req.query.from, "YYYY-MM-DD").toDate() : undefined;
  const to: Date | undefined = req.query.to ? moment(req.query.to, "YYYY-MM-DD").toDate() : undefined;
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season) : undefined;
  let player: any;
  if (from && to && season) {
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "Too many parameters",
        message: "Too many parameters were supplied; should supply either (from AND to) OR season",
      }],
    });
    return;
  } else if (req.params.season && !season) {
    // NaN is falsy
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
    return;
  }
  try {
    if (season) {
      const players = await db.collection("players").aggregate([
        { $match: { _id: req.params.playerId } },
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
        { $match: { _id: req.params.playerId } },
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
          message: `Aggregation is not possible since no data was found for ${req.params.playerId}`,
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

allPlayersRoute.get("/:playerId/superlatives", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const from: Date | undefined = req.query.from ? moment(req.query.from, "YYYY-MM-DD").toDate() : undefined;
  const to: Date | undefined = req.query.to ? moment(req.query.to, "YYYY-MM-DD").toDate() : undefined;
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season) : undefined;
  let player: IPlayer;
  if (from && to && season) {
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "Too many parameters",
        message: "Too many parameters were supplied; should supply either (from AND to) OR season",
      }],
    });
    return;
  } else if (req.params.season && !season) {
    // NaN is falsy
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
    return;
  }
  try {
    if (season) {
      const players = await db.collection("players").aggregate([
        { $match: { _id: req.params.playerId } },
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
        { $match: { _id: req.params.playerId } },
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
          message: `Retrieving superlatives is not possible since no data was found for ${req.params.playerId}`,
        }],
      });
      return;
    }
    const sups: any[] = [];
    for (const game of player.games) {
      if (game.superlatives === undefined) {
        continue;
      }
      sups.push({
        gameId: game.gameId,
        superlatives: await db.collection("superlatives").find({ _id: { $in: game.superlatives } }).toArray(),
      });
    }
    res.status(200).json({
      data: sups,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during player superlative retrieval",
        message: err.message,
      }],
    });
  }
});

allPlayersRoute.get("/:playerId/games", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const from: Date | undefined = req.query.from ? moment(req.query.from, "YYYY-MM-DD").toDate() : undefined;
  const to: Date | undefined = req.query.to ? moment(req.query.to, "YYYY-MM-DD").toDate() : undefined;
  const season: number | undefined = req.query.season ? Number.parseInt(req.query.season) : undefined;
  let player: IPlayer;
  if (from && to && season) {
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "Too many parameters",
        message: "Too many parameters were supplied; should supply either (from AND to) OR season",
      }],
    });
    return;
  } else if (req.params.season && !season) {
    // NaN is falsy
    res.status(406).json({
      errors: [{
        code: "DateError",
        title: "The season request was malformed",
      }],
    });
    return;
  }
  try {
    if (season) {
      const players = await db.collection("players").aggregate([
        { $match: { _id: req.params.playerId } },
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
        { $match: { _id: req.params.playerId } },
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
          message: `Retrieving superlatives is not possible since no data was found for ${req.params.playerId}`,
        }],
      });
      return;
    }
    const gameIds = player.games.map((game) => game.gameId);
    const games = await db.collection("games").find({ _id: { $in: gameIds } }).toArray();
    res.status(200).json({
      data: games,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during player superlative retrieval",
        message: err.message,
      }],
    });
  }
});

allPlayersRoute.get("/:sportCode/roasters/:teamId/:season", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const seasonNumber = Number(req.params.season);
  let playerPosition: any = req.params.sportCode === "MFB" ?
    { "$first": { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] } }
    :
    {
      "$first": "$games.pos.pos"
    };
  const pipeline: any[] = [
    {
      $match: {
        "$and": [
          { "sportCode": req.params.sportCode },
          { teamId: req.params.teamId },
          { name: { $nin: ["TEAM", "TM","Team", "Tm", "team", "tm"] } },
        ]
      }
    },
    { $unwind: "$games" },
    {
      $group: {
        _id: {
          _id: "$_id",
          name: "$name",
          season: "$games.season",
        },
        class: { $first: "$games.playerClass" },
        uniform: { $first: "$games.uniform" },
        position: playerPosition,
      },
    },
    {
      $match: {
        "_id.season": seasonNumber,
      },
    },
    {
      $project: {
        "_id": "$_id._id",
        name: "$_id.name",
        season: "$_id.season",
        class: "$class",
        uniform: "$uniform",
        position: "$position",
      },
    },
    { $sort: { name: 1 } },

  ];
  try {
    console.log(JSON.stringify(pipeline));
    const roster = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: roster,
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

allPlayersRoute.get("/seasons/:sportCode/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const seasonNumber = Number(req.params.year);
  const pipeline: any[] = [
    {
      $match: {
        $or: [
          { "teamIds.home": req.params.teamId },
          { "teamIds.visitor": req.params.teamId },
        ],
        $and: [
          { "sportCode": req.params.sportCode },
        ]
      },
    },
    {
      $group: {
        _id: { season: "$season" },
      },
    },
    {
      $sort: {
        "_id.season": -1,
      },
    },
    {
      $project: {
        season: "$_id.season",
        _id: 0,
      },
    },
  ];
  try {
    console.log(JSON.stringify(pipeline));
    const seasons = await db.collection("games").aggregate(pipeline).toArray();
    res.status(200).json({
      data: seasons,
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

allPlayersRoute.put("/", async (req, res, next) => {
  console.log("Update");
  const db: mongo.Db = req.app.locals.db;
  const existingPlayer = await db.collection("players").findOne({ _id: req.body.id });
  if (existingPlayer) {
    try {
      await db.collection("players").updateOne({ "_id": req.body.id },
        {
          $set: {
            name: req.body.name,
            "games": JSON.parse(req.body.playerGames),   
          }
        },
        { "upsert": false });
      res.status(200).json({
        data: "Player updates successfully",
      });
    }
    catch (err) {
      res.status(500).json({
        errors: [{
          code: "MongoRetrievalError",
          title: "Unknown error occured during Mongo operation",
          message: err.message,
        }],
      });
      return;
    }
  }
  else {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: "Player does not exists",
      }],
    });
    return;
  }
});

export { allPlayersRoute };
