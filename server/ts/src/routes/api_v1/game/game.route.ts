import { Router } from "express";
import * as mongo from "mongodb";
import { winstonLogger } from "../../../lib/winstonLogger"

const gameRoutes: Router = Router();

// /api_v1/game/:gameId
// Get the game summary data
gameRoutes.get("/:sportCode/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        _id: req.params.gameId,
        sportCode: req.params.sportCode,
      },
    },
    {
      $project: {
        gameDate: "$gameDate",
        venue: "$venue",
        meta: "$meta",
      },
    },
  ];
  try {
    const gameInfo = await db.collection("games").aggregate(pipeline).toArray();
    res.status(200).json({
      data: gameInfo,
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

// /api_vi/game/teams/:gameId
// Get the game data for a team for a game
gameRoutes.get("/:sportCode/teams/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "gameId": req.params.gameId,
        "sportCode": req.params.sportCode,
      },
    },
    {
      $project: {
        tidyName: "$tidyName",
        code: "$code",
        name: "$name",
        linescore: "$linescore",
        startTime: "$startTime",
        attendance: "$attendance",
        geoLocation: "$geoLocation",
        gameDate: "$gameDate",
        actualDate: "$actualDate",
        homeAway: "$homeAway",
        season: "$season"
      },
    },
  ];
  try {
    const gameTeams = await db.collection("teamGames").aggregate(pipeline).toArray();
    res.status(200).json({
      data: gameTeams,
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

// /api_vi/game/teamstats/:gameId
// Get the overall stats for a team in a game
gameRoutes.get("/:sportCode/teamstats/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getTeamStatPipeline(req.params.gameId, req.params.sportCode)
  try {
    const gameTeams = await db.collection("teamGames").aggregate(pipeline).toArray();
    res.status(200).json({
      data: gameTeams,
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

// /api_vi/game/starterroster/:gameId/:teamId
// Get the starter roster data for a team for a game
gameRoutes.get("/:sportCode/starterroster/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getStarterRoster(req.params.gameId, req.params.sportCode, req.params.teamId)
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

// /api_vi/game/fullroster/:gameId/:teamId
// Get the roster data for a team for a game
gameRoutes.get("/:sportCode/fullroster/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  // let position = req.params.sportCode == "MFB"
  //   ? { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] }
  //   : (req.params.sportCode == "MBB" || req.params.sportCode == "WBB") ? "$games.pos.pos" : "$games.pos";
  let position = req.params.sportCode == "MFB"
  ? { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] }
  : (req.params.sportCode == "MBB" || req.params.sportCode == "WBB") ? { $cond: [{ $ne: ["$games.pos.pos", null] }, "$games.pos.pos", "$games.pos"] } :
  (req.params.sportCode == "MSO" || req.params.sportCode == "WSO")?"$games.pos" :"$games.pos.pos" ;
  
  console.log(position);
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
      },
    },
    {
      $project: {
        name: "$name",
        class: "$games.playerClass",
        plays: "$games.plays",
        stats: "$games.stats",
        uniform: "$games.uniform",
        position: position,
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

// /api_vi/game/rushing/:gameId/:teamId
// Get the rushing player data for a team for a game
gameRoutes.get("/:sportCode/rushing/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.rushing": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        attempts: "$games.stats.rushing.rushAtt",
        yards: "$games.stats.rushing.rushYards",
        touchdowns: "$games.stats.rushing.rushTd",
        long: "$games.stats.rushing.rushLong",
      },
    },
    {
      $sort: {
        "yards": -1,
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/passing/:gameId/:teamId
// Get the passing player data for a team for a game
gameRoutes.get("/:sportCode/passing/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.pass": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        completed: "$games.stats.pass.passComp",
        attempts: "$games.stats.pass.passAtt",
        yards: "$games.stats.pass.passYards",
        touchdowns: "$games.stats.pass.passTd",
        interceptions: "$games.stats.pass.passInt",
      },
    },
    {
      $sort: {
        "yards": -1,
      },
    },
  ];
  try {
    const pass = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: pass,
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

// /api_vi/game/receiving/:gameId/:teamId
// Get the receiving player data for a team for a game
gameRoutes.get("/:sportCode/receiving/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.receiving": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        receptions: "$games.stats.receiving.rcvNum",
        yards: "$games.stats.receiving.rcvYards",
        touchdowns: "$games.stats.receiving.rcvTd",
        long: "$games.stats.receiving.rcvLong",
      },
    },
    {
      $sort: {
        "yards": -1,
      },
    },
  ];
  try {
    const rcv = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rcv,
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

// /api_vi/game/receiving/targets/:gameId/:playerId
// Get the number of targets for a player for a game
gameRoutes.get("/:sportCode/receiving/targets/:gameId/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "gameId": req.params.gameId,
        "results.pass.receiverId": req.params.playerId,
        "sportCode": req.params.sportCode,
      },
    },
    {
      $count: "targets",
    },
  ];
  try {
    const targets = await db.collection("plays").aggregate(pipeline).toArray();
    res.status(200).json({
      data: targets,
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

// /api_vi/game/defense/:gameId/:teamId
// Get the defense player data for a team for a game
gameRoutes.get("/:sportCode/defense/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.defense": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        tackles: "$games.stats.defense.dTackUa",
        assists: "$games.stats.defense.dTackA",
        total: "$games.stats.defense.dTackTot",
        sacks: { $add: ["$games.stats.defense.dSackUa", { $multiply: [0.5, "$games.stats.defense.dSackA"] }] },
        sackYards: "$games.stats.defense.dSackYards",
        interceptions: "$games.stats.defense.dInt",
        intYards: "$games.stats.defense.dIntYards",
        tfl: { $add: ["$games.stats.defense.dTflua", { $multiply: [0.5, "$games.stats.defense.dTfla"] }] },
        tflYards: "$games.stats.defense.dTflyds",
        dFr: "$games.stats.defense.dFr",
        dFryds: "$games.stats.defense.dFryds",
        dQbh: "$games.stats.defense.dQbh",
        dblkd: "$games.stats.defense.dblkd",
      },
    },
    {
      $sort: {
        "total": -1,
      },
    },
  ];
  try {
    const def = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: def,
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

// /api_vi/game/interceptions/:gameId/:teamId
// Get the interceptions player data for a team for a game
gameRoutes.get("/:sportCode/interceptions/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        $and: [
          { "games.gameId": req.params.gameId },
          {
            "$or": [
              { "games.stats.intReturn": { $ne: null } },
              { "games.stats.fumbles": { $ne: null } },
            ]
          },
          { "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } },
        ]
      },
    },
    {
      $project: {
        name: "$name",
        num: { $ifNull: ["$games.stats.intReturn.irNo", 0] },
        yards: { $ifNull: ["$games.stats.intReturn.irYards", 0] },
        long: { $ifNull: ["$games.stats.intReturn.irLong", 0] },
        touchdowns: { $ifNull: ["$games.stats.intReturn.irTd", 0] },
        fbTotal: { $ifNull: ["$games.stats.fumbles.fumbTotal", 0] },
        fbLost: { $ifNull: ["$games.stats.fumbles.fumbLost", 0] },
        average: { $divide: ["$games.stats.intReturn.irYards", "$games.stats.intReturn.irNo"] },
      },
    },
  ];
  try {
    const interceptions = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: interceptions,
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

// /api_vi/game/interceptions/:gameId/:teamId
// Get the interceptions player data for a team for a game
gameRoutes.get("/:sportCode/fumbles/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.fumbles": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        total: "$games.stats.fumbles.fumbTotal",
        lost: "$games.stats.fumbles.fumbLost",
      },
    },
  ];
  try {
    const fumbles = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: fumbles,
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

// /api_vi/game/hitting/:gameId/:teamId
// Get the hitting player data for a team for a baseball game
gameRoutes.get("/:sportCode/hitting/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.hitting.ab": { $ne: 0 },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        bats: "$games.bats",
        atbat: "$games.stats.hitting.ab",
        runs: "$games.stats.hitting.r",
        hits: "$games.stats.hitting.h",
        rbi: "$games.stats.hitting.rbi",
        so: "$games.stats.hitting.so",
        ground: "$games.stats.hitting.ground",
        fly: "$games.stats.hitting.fly",
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/pitching/:gameId/:teamId
// Get the pitching player data for a team for a baseball game
gameRoutes.get("/:sportCode/pitching/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.pitching.appear": { $ne: 0 },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        ip: "$games.stats.pitching.ip",
        h: "$games.stats.pitching.h",
        er: "$games.stats.pitching.er",
        bb: "$games.stats.pitching.bb",
        so: "$games.stats.pitching.so",
        r: "$games.stats.pitching.r",
        ab: "$games.stats.pitching.ab",
        pitches: "$games.stats.pitching.pitches",
        ground: "$games.stats.pitching.ground",
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/fielding/:gameId/:teamId
// Get the fielding player data for a team for a baseball game
gameRoutes.get("/:sportCode/fielding/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.fielding.appear": { $ne: 0 },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        a: "$games.stats.fielding.a",
        e: "$games.stats.fielding.e",
        sba: "$games.stats.fielding.sba",
        csb: "$games.stats.fielding.csb",
        pb: "$games.stats.fielding.pb",
        ci: "$games.stats.fielding.ci",
        indp: "$games.stats.fielding.indp",
        intp: "$games.stats.fielding.intp",
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/fielding/:gameId/:teamId
// Get the baserunning player data for a team for a baseball game
gameRoutes.get("/:sportCode/baserunning/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.fieldSituation.sba": { $ne: 0 },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
    {
      $project: {
        name: "$name",
        sb: "$games.stats.hitSituation.sb",
        sba: "$games.stats.fieldSituation.sba",
        cs: "$games.stats.hitSituation.cs",
        po: "$games.stats.fieldSituation.po",
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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


// /api_vi/game/shooting/:gameId/:teamId
// Get the shooting player data for a team for a basketball game
gameRoutes.get("/:sportCode/shooting/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "games.stats": { $exists: true },
      },
    },
    {
      $project: {
        name: "$name",
        fgm: "$games.stats.fgm",
        fga: "$games.stats.fga",
        fgpct: "$games.stats.fgpct",
        fg3pct: "$games.stats.fg3pct",
        fgm3: "$games.stats.fgm3",
        fga3: "$games.stats.fga3",
        ftm: "$games.stats.ftm",
        fta: "$games.stats.fta",
        ftpct: "$games.stats.ftpct",
        tp: "$games.stats.tp",
        min: "$games.stats.min",
        started: "$games.started",
      },
    },
    { $sort: { min: -1 } },
  ];
  try {
    winstonLogger.log("info", JSON.stringify(pipeline));
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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


// /api_vi/game/rebound/:gameId/:teamId
// Get the rebound player data for a team for a basketball game
gameRoutes.get("/:sportCode/rebound/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "games.stats": { $exists: true },
      },
    },
    {
      $project: {
        name: "$name",
        oreb: "$games.stats.oreb",
        dreb: "$games.stats.dreb",
        treb: "$games.stats.treb",
      },
    },
    { $sort: { treb: -1 } },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/other/:gameId/:teamId
// Get the other player data for a team for a basketball game
gameRoutes.get("/:sportCode/other/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "games.stats": { $exists: true },
      },
    },
    {
      $project: {
        name: "$name",
        oreb: "$games.stats.oreb",
        dreb: "$games.stats.dreb",
        treb: "$games.stats.treb",
        ast: "$games.stats.ast",
        to: "$games.stats.to",
        stl: "$games.stats.stl",
        blk: "$games.stats.blk",
        tp: "$games.stats.tp",
        min: "$games.stats.min",
        pf: "$games.stats.pf",
        tf: "$games.stats.tf",
        deadball: "$games.stats.deadball",
        ftpct: "$games.stats.ftpct",
        started: "$games.started",
        tot: { $sum: ["$games.stats.pf", "$games.stats.tf"] }
      },
    },
    { $sort: { min: -1 } },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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


// /api_vi/game/special/:gameId/:teamId
// Get the special player data for a team for a basketball game
gameRoutes.get("/:sportCode/special/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "games.stats": { $exists: true },
      },
    },
    {
      $project: {
        name: "$name",
        oreb: "$games.stats.oreb",
        dreb: "$games.stats.dreb",
        treb: "$games.stats.treb",
        ptsTO: "$games.stats.ptsto",
        ptsCH2: "$games.stats.ptsch2",
        ptsPaint: "$games.stats.ptsPaint",
        ptsFastb: "$games.stats.ptsFastb",
        ptsBench: "$games.stats.ptsBench",
        ties: "$games.stats.Ties",
        leads: "$games.stats.leads",
        possCount: "$games.stats.possCount",
        possTime: "$games.stats.possTime",
        scoreCount: "$games.stats.scoreCount",
        scoreTime: "$games.stats.scoreTime",
        leadTime: "$games.stats.leadTime",
        tiedTime: "$games.stats.tiedTime",
        largeLead: "$games.stats.largeLead",
        largeLeadT: "$games.stats.largeLeadT",
      },
    },
  ];
  try {
    const rush = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: rush,
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

// /api_vi/game/teamIds/:gameId
// Get the teamIds of the teams that played in a game
gameRoutes.get("/:sportCode/teamIds/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        _id: req.params.gameId,
        "sportCode": req.params.sportCode,
      }
    },
    {
      $project: {
        homeTeamId: "$teamIds.home",
        awayTeamId: "$teamIds.visitor",
        _id: 0,
      },
    },
  ];
  try {
    const ids = await db.collection("games").aggregate(pipeline).toArray();
    res.status(200).json({
      data: ids,
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

// /api_vi/game/plays/:gameId
// Get all plays in a game
gameRoutes.get("/:sportCode/plays/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    { $match: { "gameId": req.params.gameId, "sportCode": req.params.sportCode, "results.playersInvolved": { $ne: [] } } },
  ];
  try {
    const plays = await db.collection("plays").aggregate(pipeline).toArray();
    res.status(200).json({
      data: plays,
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

// /api_vi/game/playerName/:playerId
// Small route to get player name from player id
gameRoutes.get("/:sportCode/player-name/:playerId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    { $match: { _id: req.params.playerId, "sportCode": req.params.sportCode, } },
    {
      $project: {
        name: 1,
        _id: 0,
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

gameRoutes.get("/:sportCode/plays/scoring/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = getTeamScoringPlayPipeline(req.params.gameId, req.params.sportCode);
  try {
    const plays = await db.collection("plays").aggregate(pipeline).toArray();
    res.status(200).json({
      data: plays,
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

gameRoutes.get("/:sportCode/plays/:gameId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    { $match: { gameId: req.params.gameId, "sportCode": req.params.sportCode, playerNames: { $ne: "TEAM" } } },
    {
      $project: {
        quarter: 1,
        drive: 1,
        description: 1,
        playInDrive: 1,
        playInGame: 1,
        down: 1,
        yardsToGo: 1,
      },
    },
  ];
  try {
    const plays = await db.collection("plays").aggregate(pipeline).toArray();
    res.status(200).json({
      data: plays,
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

// /api_vi/game/specialstats/:gameId/:teamId
// Get the specialstats player data for a team for a game
gameRoutes.get("/:sportCode/specialstats/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats": { "$exists": true },
      },
    },
    {
      $project: {
        name: "$name",
        kickoff: "$games.stats.kickoff",
        fieldgoal: "$games.stats.fieldgoal",
        punt: "$games.stats.punt",
        puntReturn: "$games.stats.puntReturn",
        intReturn: "$games.stats.intReturn",
        kickReceiving: "$games.stats.kickReceiving",
        pointAfter: "$games.stats.pointAfter",
      },
    },
  ];
  try {
    console.log(JSON.stringify(pipeline));
    const def = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: def,
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

function getTeamStatPipeline(gameId: string, sportCode: string): any {
  switch (sportCode) {
    case "MFB":
      return getTeamStatPipelineFootball(gameId, sportCode);
    case "MBA":
    case "WSB":
      return getTeamStatPipelineBaseball(gameId, sportCode);
    case "MBB":
    case "WBB":
      return getTeamStatPipelineBasketball(gameId, sportCode);
//Vaf Code
    case "MSO":
    case "WSO":
      return getTeamStatPipelineSoccer(gameId,sportCode);
    default:
      // code...
      break;
  }
}

function getTeamStatPipelineFootball(gameId: string, sportCode: string) {
  const pipeline: any = [
    {
      $match: {
        "gameId": gameId,
        "sportCode": sportCode,
      },
    },
    {
      $project: {
        tidyName: "$name",
        code: "$code",
        homeAway: "$homeAway",
        avgPunt: { $cond: { if: { $eq: ["$totals.punt.puntNum", 0] }, then: "$totals.punt.puntYards", else: { $divide: ["$totals.punt.puntYards", "$totals.punt.puntNum"] } } },
        avgKickOff: { $cond: { if: { $eq: ["$totals.kickoff.koNum", 0] }, then: "$totals.kickoff.koYards", else: { $divide: ["$totals.kickoff.koYards", "$totals.kickoff.koNum"] } } },
        stats: "$totals",
        qtrTotals: "$qtrTotals",
      },
    },
  ];
  return pipeline;
}

function getTeamStatPipelineBaseball(gameId: string, sportCode: string) {
  const pipeline: any = [
    {
      $match: {
        "gameId": gameId,
        "sportCode": sportCode,
      },
    },
    {
      $project: {
        tidyName: "$name",
        code: "$code",
        homeAway: "$homeAway",
        hittingAB: "$totals.hitting.ab",
        hittingR: "$totals.hitting.r",
        hittingH: "$totals.hitting.h",
        hittingRBI: "$totals.hitting.rbi",
        hittingBB: "$totals.hitting.bb",
        hittingSO: "$totals.hitting.so",
        ground: "$totals.hitting.ground",
        pitchingIP: "$totals.pitching.ip",
        pitchingH: "$totals.pitching.h",
        pitchingER: "$totals.pitching.er",
        pitchingBB: "$totals.pitching.bb",
        pitchingSO: "$totals.pitching.so",
        fieldingPO: "$totals.fielding.po",
        fieldingA: "$totals.fielding.a",
        fieldingE: "$totals.fielding.e",
      },
    },
  ];
  return pipeline;
}


function getTeamStatPipelineBasketball(gameId: string, sportCode: string) {
  const pipeline: any = [
    {
      $match: {
        "gameId": gameId,
        "sportCode": sportCode,
      },
    },
    {
      $project: {
        tidyName: "$name",
        code: "$code",
        homeAway: "$homeAway",
        statsFGM: "$totals.stats.fgm",
        statsFGA: "$totals.stats.fga",
        statsFGPerGame: "$totals.stats.fgm",
        statsFGM3: "$totals.stats.fgm3",
        statsFGA3: "$totals.stats.fga3",
        statsFTM: "$totals.stats.ftm",
        statsFTA: "$totals.stats.fta",
        statsFTMPerGame: "$totals.stats.ftm",
        statsTP: "$totals.stats.tp",
        statsBLK: "$totals.stats.blk",
        statsBLKPerGame: "$totals.stats.blk",
        statsSTL: "$totals.stats.stl",
        statsSTLPerGame: "$totals.stats.stl",
        statsAST: "$totals.stats.ast",
        statsASTPerGame: "$totals.stats.ast",
        statsMIN: "$totals.stats.min",
        statsOREB: "$totals.stats.oreb",
        statsDREB: "$totals.stats.dreb",
        statsTREB: "$totals.stats.treb",
        statsPF: "$totals.stats.pf",
        statsTF: "$totals.stats.tf",
        statsTO: "$totals.stats.to",
        statsTOPerGame: "$totals.stats.to",

        //st"$totals.stats.dq",
        statsDeadball: "$totals.stats.deadball",
        statsFGPCT: "$totals.stats.fgpct",
        statsFG3PCT: "$totals.stats.fg3pct",
        statsFTPCT: "$totals.stats.ftpct",

        specialPTSTO: "$totals.special.ptsto",
        specialPTSCH2: "$totals.special.ptsch2",
        specialPTSPaint: "$totals.special.ptsPaint",
        specialPTSFastb: "$totals.special.ptsFastb",
        specialPTSBench: "$totals.special.ptsBench",
        specialTies: "$totals.special.ties",
        specialLeads: "$totals.special.leads",
        specialPOSSCount: "$totals.special.possCount",
        specialPOSSTime: "$totals.special.possTime",
        specialScoreCount: "$totals.special.scoreCount",
        specialScoreTime: "$totals.special.scoreTime",
        specialLeadTime: "$totals.special.leadTime",
        specialTiedTime: "$totals.special.tiedTime",
        specialLargeLead: "$totals.special.largeLead",
        specialLargeLeadT: "$totals.special.largeLeadT",

      },
    },
  ];
  return pipeline;
}

function getTeamScoringPlayPipeline(gameId: string, sportCode: string): any {
  switch (sportCode) {
    case "MFB":
      return getTeamScoringPlayPipelineFootball(gameId, sportCode);
    case "MBA":
    case "WSB":
      return getTeamScoringPlayPipelineBaseball(gameId, sportCode);
    case "MBB":
    case "WBB":
      return getTeamScoringPlayPipelineBasketball(gameId, sportCode);
      //VAF Code
    case "MSO":
    case "WSO":
      return getTeamScoringPlayPipelineSoccer(gameId, sportCode);
    default:
      // code...
      break;
  }
}

function getTeamScoringPlayPipelineFootball(gameId: string, sportCode: string) {
  const pipeline: any = [
    { $match: { gameId: gameId, "sportCode": sportCode, score: { $ne: null } } },
    { $sort: { "score.homeScore": 1, "score.visitorScore": 1 } },
    {
      $group: { _id: "$quarter", data: { $push: "$$ROOT" } },
    },
    { $sort: { _id: 1 } },
  ];
  return pipeline;
}

function getTeamScoringPlayPipelineBaseball(gameId: string, sportCode: string) {
  const pipeline: any = [
    { $match: { gameId: gameId, "sportCode": sportCode, score: { $ne: 0 } } },
    {
      $group: { _id: "$inningNumber", data: { $push: "$$ROOT" } },
    },
    { $sort: { _id: 1 } },
  ];
  return pipeline;
}


function getTeamScoringPlayPipelineBasketball(gameId: string, sportCode: string) {
  const pipeline: any = [
    { $match: { gameId: gameId, "sportCode": sportCode, score: { $ne: null } } },
    {
      $project: {
        period: 1,
        playerNames: 1,
        description: 1,
        action: 1,
        type: 1,
        gameClockStartTime: 1,
        playStartLocation: 1,
        playEndLocation: 1,
        possession: 1,
        score: 1,
        results: 1,
      },
    },
  ];
  return pipeline;
}




function getStarterRoster(gameId: string, sportCode: string, teamId: string) {
  switch (sportCode) {
    case "MFB":
      return getStarterPipelineFootball(gameId, sportCode, teamId);
    case "MBA":
    case "WSB":
      return getStarterPipelineBaseball(gameId, sportCode, teamId);
    case "MBB":
    case "WBB":
      return getStarterPipelineBasketball(gameId, sportCode, teamId);
    case "MSO":
    case "WSO":
      return getStarterPipelineSoccer(gameId, sportCode, teamId);
 


    default:
      // code...
      break;
  }
}

function getStarterPipelineFootball(gameId: string, sportCode: string, teamId: string) {
  return [
    {
      $match: {
        "games.gameId": gameId,
        "teamCode": Number(teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": gameId,
        "games.started": true,
      },
    },
    {
      $project: {
        name: "$name",
        class: "$games.playerClass",
        offense: { $cond: [{ $ne: ["$games.pos.opos", null] }, true, false] },
        position: { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] },
        plays: "$games.plays",
        stats: "$games.stats",
        uniform: "$games.uniform",
      },
    },
    { $sort: { name: 1 } },
  ];
}

function getStarterPipelineBaseball(gameId: string, sportCode: string, teamId: string) {
  return [
    {
      $match: {
        "games.gameId": gameId,
        "teamCode": Number(teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": gameId,
        "games.started": true,
        "games.gs": 1,
      },
    },
    {
      $project: {
        name: "$name",
        class: "$games.playerClass",
        bats: "$games.bats",
        spot: "$games.spot",
        position: "$games.pos",
        plays: "$games.plays",
        stats: "$games.stats",
        uniform: "$games.uniform",
      },
    },
    { $sort: { name: 1 } },
  ];
}

function getStarterPipelineBasketball(gameId: string, sportCode: string, teamId: string) {
  return [
    {
      $match: {
        "games.gameId": gameId,
        "teamCode": Number(teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": gameId,
        "games.started": true,
      },
    },
    {
      $project: {
        name: "$name",
        class: "$games.playerClass",
        plays: "$games.plays",
        stats: "$games.stats",
        uniform: "$games.uniform",
        position: "$games.pos.pos",
      },
    },
    { $sort: { name: 1 } },
  ];
}

//VAF Code

//Soccer TeamStat
function getTeamStatPipelineSoccer(gameId: string, sportCode: string) {
const pipeline:any=[
  {
    $match: {
      "gameId": gameId,
      "sportCode": sportCode,
    },
  },
  {
    $project:{
      tidyName:"$name",
      code: "$code",
      homeAway: "$homeAway",
      //GoalType
      goaltypeGW:"$totals.goaltype.gw",
      goaltypeEN:"$totals.goaltype.en",
      goaltypeSO:"$totals.goaltype.so",
      goaltypeFG:"$totals.goaltype.fg",
      goaltypeHAT:"$totals.goaltype.hat",
      goaltypeOT:"$totals.goaltype.ot",
      goaltypeUA:"$totals.goaltype.ua",
      goaltypeGT:"$totals.goaltype.gt",
      goaltypeGOC:"$totals.goaltype.goc",
      //Planty
      plantyCount:"$totals.planty.count",
      plantyFouls:"$totals.planty.fouls",
      plantyGreen:"$totals.planty.green",
      plantyYellow:"$totals.planty.yellow",
      plantyRed:"$totals.planty.red",
      //misc
      miscMinutes:"$totals.misc.minutes",
      miscDsave:"$totals.misc.dsave",
      //goalie
      goalieCbosho:"$totals.goalie.cbosho",
      goalieShutout:"$totals.goalie.shutout",
      goalieGa:"$totals.goalie.ga",
      goalieSaves:"$totals.goalie.saves",
      goalieMinutes:"$totals.goalie.minutes",
      goalieSf:"$totals.goalie.sf",
      goalieSavesbyprd:"$totals.goalie.savesbyprd",
      goalieSavebyprd:"$totals.goalie.savebyprd",
      //Shots
      shotsA:"$totals.shots.a",
      shotsps:"$totals.shots.ps",
      shotsG:"$totals.shots.g",
      shotsSog:"$totals.shots.sog",
      shotsSh:"$totals.shots.sh",
      shotsPsatt:"$totals.shots.psatt",

      //OtherStates
      otherstatsFouls:"$totals.otherStats.fouls",
      otherstatsCorners:"$totals.otherStats.corners",
      otherstatsSaves:"$totals.otherStats.saves",
      otherstatsScore:"$totals.otherStats.score",
      otherstatsOffsides:"$totals.otherStats.offsides",
      otherstatsShots:"$totals.otherStats.shots",
    },
  },
];

return pipeline;
}

function getTeamScoringPlayPipelineSoccer(gameId: string, sportCode: string)
{
  const pipeline: any = [
    { $match: { gameId: gameId, "sportCode": sportCode, score: { $ne: null } } },
    { $sort: { "score.homeScore": 1, "score.visitorScore": 1 } },
    { $group: { _id: "$period", data: { $push: "$$ROOT" } },
    },
    { $sort: { _id: 1 } },
  ];
  return pipeline;

}
function getStarterPipelineSoccer(gameId: string, sportCode: string, teamId: string) {
  return [
    {
      $match: {
        "games.gameId": gameId,
        "teamCode": Number(teamId),
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": sportCode,
      },
    },
    { $unwind: "$games" },
    {
      $match: {
        "games.gameId": gameId,
        "games.started": true,
      },
    },
    {
      $project: {
        name: "$name",
        class: "$games.playerClass",
        plays: "$games.plays",
        stats: "$games.stats",
        uniform: "$games.uniform",
        position: "$games.pos",
      },
    },
    { $sort: { name: 1 } },
  ];
}
// /api_vi/game/:sportCode/goalie/:gameId/:teamId
// Get the goalie player data for a team for a game
gameRoutes.get("/:sportCode/goalie/:gameId/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId) ,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      }},
      { $unwind: "$games"},
      {
      $match: {
        "games.gameId": req.params.gameId,
            "games.stats.goalie": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
        {
      $project: {
        name: "$name",
        cbosho: "$games.stats.goalie.cbosho",
        gs: "$games.stats.goalie.gs",
        shutout: "$games.stats.goalie.shutout",
        ga: "$games.stats.goalie.ga",
        gp: "$games.stats.goalie.gp",
        saves: "$games.stats.goalie.saves",
        minutes: "$games.stats.goalie.minutes",
        sf: "$games.stats.goalie.sf",
        savesbyprd: "$games.stats.goalie.savesbyprd",
        savebyprd: "$games.stats.goalie.savebyprd",
      },
    }
    ];
  try {
    const goalie = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: goalie,
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

// /api_vi/game/:sportCode/shots/:gameId/:teamId
// Get the shots  data for a team for a game

gameRoutes.get("/:sportCode/shots/:gameId/:teamId",async(req,res,next)=>{
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode":Number(req.params.teamId) ,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      }},
      { $unwind: "$games"},
      {
      $match: {
        "games.gameId": req.params.gameId,
            "games.stats.shots": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
        {
      $project: {
        name: "$name",
        a: "$games.stats.shots.a",
        ps: "$games.stats.shots.ps",
        g: "$games.stats.shots.g",
        sog: "$games.stats.shots.sog",
        sh: "$games.stats.shots.sh",
        psatt: "$games.stats.shots.psatt",
      },
    }
    ]
    // console.log({"sportCode":req.params.sportCode,"gameId":req.params.gameId,"teamId":req.params.teamId});
    try {
      const shots = await db.collection("players").aggregate(pipeline).toArray();
      res.status(200).json({
        data: shots,
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

// /api_vi/game/:sportCode/penalties/:gameId/:teamId
// Get the penalties  data from players collection for GameDashboard

gameRoutes.get("/:sportCode/penalties/:gameId/:teamId",async(req,res,next)=>{
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode":Number(req.params.teamId) ,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      }},
      { $unwind: "$games"},
      {
      $match: {
        "games.gameId": req.params.gameId,
            "games.stats.planty": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
        {
      $project: {
        name: "$name",
        count: "$games.stats.planty.count",
        fouls: "$games.stats.planty.fouls",
        green: "$games.stats.planty.green",
        yellow: "$games.stats.planty.yellow",
        red: "$games.stats.planty.red",
        G: "$games.stats.shots.g",
        A:"$games.stats.shots.a",
      },
    }
    ];

    // console.log({"sportCode":req.params.sportCode,"gameId":req.params.gameId,"teamId":req.params.teamId});
    try {
      const penalties = await db.collection("players").aggregate(pipeline).toArray();
      res.status(200).json({
        data: penalties,
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


// /api_vi/game/:sportCode/misc/:gameId/:teamId
// Get the misc  data from players collection for GameDashboard

gameRoutes.get("/:sportCode/misc/:gameId/:teamId",async(req,res,next)=>{
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode":Number(req.params.teamId) ,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode":  req.params.sportCode ,
      }},
      { $unwind: "$games"},
      {
      $match: {
        "games.gameId": req.params.gameId,
            "games.stats.misc": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
        {
      $project: {
        name: "$name",
        minutes: "$games.stats.misc.minutes",
        dsave: "$games.stats.misc.dsave",
        GWG:"$games.stats.goaltype.gw",
        Goals:"$games.stats.shots.ps",
        ATT:"$games.stats.shots.psatt"
      },
    }
    ];


    // console.log({"sportCode":req.params.sportCode,"gameId":req.params.gameId,"teamId":req.params.teamId});
    try {
      const misc = await db.collection("players").aggregate(pipeline).toArray();
      res.status(200).json({
        data: misc,
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

// /api_vi/game/:sportCode/scoring/:gameId/:teamId
// Get the scoring  data from players collection for GameDashboard
gameRoutes.get("/:sportCode/scoring/:gameId/:teamId",async(req,res,next)=>{
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = [
    {
      $match: {
        "games.gameId": req.params.gameId,
        "teamCode": Number(req.params.teamId) ,
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
        "sportCode": req.params.sportCode,
      }},
      { $unwind: "$games"},
      {
      $match: {
        "games.gameId": req.params.gameId,
        "games.stats.misc": { $ne: null },
        "name": { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] },
      },
    },
        {
      $project: {
        name: "$name",
        G: "$games.stats.shots.g",
        A:"$games.stats.shots.a"
      },
    }
    ];


    // console.log({"sportCode":req.params.sportCode,"gameId":req.params.gameId,"teamId":req.params.teamId});
    try {
      const scoring = await db.collection("players").aggregate(pipeline).toArray();
      res.status(200).json({
        data: scoring,
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

export { gameRoutes };