import { Router } from "express";
import * as mongo from "mongodb";
import { winstonLogger } from "../../../lib/winstonLogger";

const dashboardRoutes: Router = Router();

dashboardRoutes.get("/opos", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  try {
    const players = await db.collection("players").aggregate([
      { $unwind: "$games" },
      {
        $group: {
          _id: "$games.pos.opos",
        },
      },
    ]).toArray();
    res.status(200).json({
      data: players,
    });
  } catch (err) {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Error occured while fetching data from Mongo",
        message: err.message,
      }],
    });
    return;
  }
});

dashboardRoutes.get("/dpos", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  try {
    const players = await db.collection("players").aggregate([
      { $unwind: "$games" },
      {
        $group: {
          _id: "$games.pos.dpos",
        },
      },
    ]).toArray();
    res.status(200).json({
      data: players,
    });
  } catch (err) {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Error occured while fetching data from Mongo",
        message: err.message,
      }],
    });
    return;
  }
});

dashboardRoutes.get("/:sportCode/seasons/:teamId", async (req, res, next) => {
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

// api_v1/dashboard/team/:teamCode
// Get a teamId and tidyName from a teamCode
dashboardRoutes.get("/:sportCode/team/:teamCode", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any[] = [
    {
      $match: { 
        $and:[
          {code: Number(req.params.teamCode) },          
        ],
      },
    }, 
    {   
      $project: {
        _id: "$_id",
        tidyName: "$tidyName",
        name: "$name",
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

dashboardRoutes.get("/:sportCode/season/:year/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const seasonNumber = Number(req.params.year);
  const pipeline: any[] = [
    {
      $match: {
        $and: [
          { season: seasonNumber },
          {
            $or: [
              { "teamIds.home": req.params.teamId },
              { "teamIds.visitor": req.params.teamId },
            ],
            $and: [
            { "sportCode": req.params.sportCode },
            ],
          },
        ],
      },
    },
    {
      $project: {
        date: "$gameDate",
        actualDate: "$actualDate",
        opponentTidyName: {
          $cond: {
            if: {
              $eq: ["$teamIds.home", req.params.teamId],
            }, then: "$team.visitor.id", else: "$team.home.id",
          },
        },
        opponentCode: {
          $cond: {
            if: {
              $eq: ["$teamIds.home", req.params.teamId],
            }, then: "$team.visitor.code", else: "$team.home.code",
          },
        },
        teamScore: {
          $cond: {
            if: {
              $eq: ["$teamIds.home", req.params.teamId],
            }, then: "$team.home.score", else: "$team.visitor.score",
          },
        },
        opponentScore: {
          $cond: {
            if: {
              $eq: ["$teamIds.home", req.params.teamId],
            }, then: "$team.visitor.score", else: "$team.home.score",
          },
        },
        isHome: {
          $cond: {
            if: {
              $eq: ["$teamIds.home", req.params.teamId],
            }, then: true, else: false,
          },
        },
      },
    },
  ];
  try {
    const season = await db.collection("games").aggregate(pipeline).toArray();
    res.status(200).json({
      data: season,
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

dashboardRoutes.get("/:sportCode/roster/:year/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const seasonNumber = Number(req.params.year);
  const playerTeamId = req.params.teamId;
  let position = req.params.sportCode == "MFB" 
                ? { $first: { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] } } 
                : (req.params.sportCode == "MBB" || req.params.sportCode == "WBB")  ? { $first: "$games.pos.pos" } : { $first: "$games.pos" };
  const pipeline: any[] = [
    {$match: {
     "$and": [
     { "sportCode": req.params.sportCode },
     { teamId: playerTeamId },
     { name:  { $nin: ["TEAM", "TM","Team", "Tm", "team", "tm"] }},
      ]
    }},
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
        position: position,
      },
    },
    {
      $match: {       
        "_id.season": seasonNumber,      
      },
    },
    {
      $project: {
        _id: "$_id._id",
        name:  "$_id.name",        
        class: "$class",
        uniform: "$uniform",
        position: "$position",
      },
    },
    { $sort: { name: 1 } },

  ];
  try {
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

export { dashboardRoutes };
