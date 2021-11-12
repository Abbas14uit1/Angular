import { Router } from "express";
import * as mongo from "mongodb";
import { winstonLogger } from "../../../lib/winstonLogger";
import { FootballPlayer } from "./footballPlayer";
import { BasketballPlayer } from "./basketballPlayer";
import { BaseballPlayer } from "./baseballPlayer";
import { SoccerPlayer } from "./soccerPlayer";

export const playerRoutes: Router = Router();
const footballPlayer = new FootballPlayer();
const basketballPlayer = new BasketballPlayer();
const baseballPlayer = new BaseballPlayer();
const soccerPlayer = new SoccerPlayer();

playerRoutes.get("/:sportCode/stats/career/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getStatsCareerPipeline(req.params.sportCode, req.params.playerId);
  try {
    //console.log(JSON.stringify(pipeline));
    const player = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: req.params.sportCode === "MBB" || req.params.sportCode === "WBB" ? player : player[0],
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

playerRoutes.get("/:sportCode/stats/season/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getStatsSeasonPipeline(req.params.sportCode, req.params.playerId);

  try {
    //console.log(JSON.stringify(pipeline));
    const player = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: player,
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

playerRoutes.get("/:sportCode/stats/game/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getStatsGamePipeline(req.params.sportCode, req.params.playerId);
  try {
    //console.log(JSON.stringify(pipeline));
    const player = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: player,
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


playerRoutes.get("/:sportCode/info/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        _id: req.params.playerId,
        sportCode: req.params.sportCode
      },
    },
    {
      $project: {
        _id: 1,
        tidyName: 1,
        name: 1,
        teamName: 1,
        teamTidyName: 1,
        teamId: 1,
        game: {
          $arrayElemAt: ["$games", 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        tidyName: 1,
        name: 1,
        teamName: 1,
        teamTidyName: 1,
        teamId: 1,
        uniform: "$game.uniform",
      },
    },
  ];
  try {
    const player = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: player,
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

function getStatsGamePipeline(sportCode: string, playerId: string) {

  switch (sportCode) {
    case "MFB":
      return footballPlayer.getStatsGamePipelineFootball(sportCode, playerId);
    case "MBA":
    case "WSB":
      return baseballPlayer.getStatsGamePipelineBaseball(sportCode, playerId);
    case "MBB":
    case "WBB":
      return basketballPlayer.getStatsGamePipelineBasketball(sportCode, playerId);
    case "MSO":
    case "WSO":
      return soccerPlayer.getStatsGamePipeline(sportCode, playerId);
      
    default:
      // code...
      break;
  }
}

function getStatsSeasonPipeline(sportCode: string, playerId: string) {

  switch (sportCode) {
    case "MFB":
      return footballPlayer.getStatsSeasonPipelineFootball(sportCode, playerId);
    case "MBA":
    case "WSB":
      return baseballPlayer.getStatsSeasonPipelineBaseball(sportCode, playerId);
    case "MBB":
    case "WBB":
      return basketballPlayer.getStatsSeasonPipelineBasketball(sportCode, playerId);
    case "MSO":
    case "WSO":
        return soccerPlayer.getStatsSeasonPipeline(sportCode, playerId);
    default:
      // code...
      break;
  }
}

function getStatsCareerPipeline(sportCode: string, playerId: string) {

  switch (sportCode) {
    case "MFB":
      return footballPlayer.getStatsCareerPipelineFootball(sportCode, playerId);
    case "MBA":
    case "WSB":
      return baseballPlayer.getStatsCareerPipelineBaseball(sportCode, playerId);
    case "MBB":
    case "WBB":
      return basketballPlayer.getStatsCareerPipelineBasketball(sportCode, playerId);
    case "MSO":
    case "WSO":
            return soccerPlayer.getStatsCareerPipeline(sportCode, playerId);
    default:
      // code...
      break;
  }
}
