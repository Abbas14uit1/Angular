import { Router } from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
const queryBasketballPlayerRoute: Router = Router();

queryBasketballPlayerRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const team: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  const valueKey: any = projections ? JSON.parse(req.query.statistics) : "games.stats." + stat;
  let pipeline: any[] = [];
  let match: any[] = [
    { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
    match = [...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else {
    let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
    if (opponentConf.length > 0) {
      match = [...match, ...opponentConf];
      andCondition = [...andCondition, ...opponentConf];
    }
  }
  match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
  pipeline = [
    {
      $match: {
        "$and":
          match
      },
    },
    { $unwind: "$games" },
    { "$match": { "games.pos.gp": 1 } },
  ];
  if (andCondition.length > 0) {
    pipeline.push({
      $match: {
        "$and":
          andCondition
      },
    });
  }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },

      {
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, stat),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
      { $limit: 200 });
  }
  else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      team, req.params.gameType, nightGame);
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },

      gameLocation,
      {
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, stat),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
      { $limit: 200 });
  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: playerStats,
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

queryBasketballPlayerRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const team: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  const valueKey: any = projections ? req.query.statistics : "games.stats." + stat;
  let pipeline: any[] = [];
  let match: any[] = [
    { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
    match = [...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else {
    let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
    if (opponentConf.length > 0) {
      match = [...match, ...opponentConf];
      andCondition = [...andCondition, ...opponentConf];
    }
  }
  match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
  pipeline = [
    {
      $match: {
        "$and":
          match
      },
    },
    { $unwind: "$games" },
    { "$match": { "games.pos.gp": 1 } },
  ];
  if (andCondition.length > 0) {
    pipeline.push({
      $match: {
        "$and":
          andCondition
      },
    });
  }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
    pipeline.push(
      {
        $group: getSeasonGroup(projections, valueKey),
      },
      {
        $project: getSeasonProjections(projections, valueKey, resultcolumn),
      },
      {
        $match: {
          [resultcolumn]: { [aggIneq]: value }
        },
      },
      { $sort: { [resultcolumn]: -1, "Season": -1 } });
  }
  else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      team, req.params.gameType, nightGame);
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },
      gameLocation,
      {
        $group: getSeasonGroup(projections, valueKey),
      },
      {
        $project: getSeasonProjections(projections, valueKey, resultcolumn),
      },
      {
        $match: {
          [resultcolumn]: { [aggIneq]: value }
        },
      },
      { $sort: { [resultcolumn]: -1, "Season": -1 } });

  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: playerStats,
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

queryBasketballPlayerRoute.get("/career/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const team: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const valueKey: any = projections ? req.query.statistics : "games.stats." + stat;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  let pipeline: any[] = [];
  let match: any[] = [
    { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
    match = [...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else {
    let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
    if (opponentConf.length > 0) {
      match = [...match, ...opponentConf];
      andCondition = [...andCondition, ...opponentConf];
    }
  }
  match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
  pipeline = [
    {
      $match: {
        "$and":
          match
      },
    },
    { $unwind: "$games" },
    { "$match": { "games.pos.gp": 1 } },
  ];
  if (andCondition.length > 0) {
    pipeline.push({
      $match: {
        "$and":
          andCondition
      },
    });
  }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
    pipeline.push(
      {
        $group: getCareerGroup(projections, valueKey),
      },
      {
        $project: getCareerProjections(projections, valueKey, resultcolumn),
      },
      {
        $match: {
          [resultcolumn]: { [aggIneq]: value }
        },
      },
      { $sort: { [resultcolumn]: -1, "Season": -1 } });
  } else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      team, req.params.gameType, nightGame);
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },
      gameLocation,
      {
        $group: getCareerGroup(projections, valueKey),
      },
      {
        $project: getCareerProjections(projections, valueKey, resultcolumn),
      },
      {
        $match: {
          [resultcolumn]: { [aggIneq]: value }
        },
      },
      { $sort: { [resultcolumn]: -1, "Season": -1 } });
  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: playerStats,
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

function getGameLocationLookUp(location: string, opponent: number, team: number, gamesType: string, nightGame: string) {
  let nightGameMatch: any = {};
  if (nightGame === "Day")
    nightGameMatch = { "game.venue.nightGame": false }
  if (nightGame === "Night")
    nightGameMatch = { "game.venue.nightGame": true }
  let gameTypeMath: any = getGameTypeMatch(gamesType);
  let gameLocation: any = gameTypeMath;
  try {
    if (location == "All") {
      gameLocation = {
        $match:
        {
          "$and": [
            gameTypeMath,
            nightGameMatch,
          ]

        },
      };
    }
    else if (location == "Neutral") {
      gameLocation = {
        $match:
        {
          "$and": [
            gameTypeMath,
            { "game.venue.neutralLocation": true },
            nightGameMatch,
          ]

        },
      }
    }
    else if (location == "Away") {
      gameLocation = {
        $match:
        {
          "$and": [
            gameTypeMath,
            { "game.team.visitor.code": team },
            { "game.venue.neutralLocation": false },
            nightGameMatch,
          ]

        },

      }
    }
    else if (location == "Home") {
      gameLocation = {
        $match:
        {
          "$and": [
            gameTypeMath,
            { "game.team.home.code": team },
            { "game.venue.neutralLocation": false },
            nightGameMatch,
          ]

        },
      }
    }
  } catch (err) {
    console.log(JSON.stringify(err));
  }
  return gameLocation;
}
function getOpponentConferenceMatch(oppConference: string, oppDivision: string) {

  let conferenceMatch: any[] = [];
  if (oppDivision !== "NA" && oppConference !== "NA") {
    conferenceMatch = [
      { "games.opponentConference": oppConference },
      { "games.opponentConferenceDivision": oppDivision }]
  }
  else if (oppDivision == "NA" && oppConference !== "NA") {
    conferenceMatch = [
      { "games.opponentConference": oppConference }]
  }
  return conferenceMatch;
}
function getTeamConferenceMatch(teamConference: string, teamConferenceDivision: string) {
  let conferenceMatch: any[] = [];
  if (teamConferenceDivision !== "NA" && teamConference !== "NA") {
    conferenceMatch = [
      { "teamConference": teamConference },
      { "teamConferenceDivision": teamConferenceDivision }]
  }
  else if (teamConferenceDivision == "NA" && teamConference !== "NA") {
    conferenceMatch = [
      { "teamConference": teamConference }]
  }
  return conferenceMatch;
}
function getGameTypeMatch(gamesType: string) {
  let gameTypeMath: any = {};
  if (gamesType !== "All") {
    gameTypeMath = { "game.venue.gameType": gamesType }
  }
  return gameTypeMath;
}
function getGameProjections(projectFields: any, valueKey: any, resultcolumn: string, gameType: string, teamId: string, stat: any) {
  let project: any = {
    _id: 0,
    Name: "$name",
    Class: "$games.playerClass",
    POS: { $ifNull: ["$games.pos.opos", "$games.pos.dpos"] },
    "Date": "$games.actualDate",
    "gameDate": "$games.gameDate",
    Season: "$games.season",
    TeamCode: "$teamCode",
    Team: "$teamName",
    OPP: "$games.opponentName",
    OpponentCode: "$games.opponentCode",
  };
  if (projectFields) {
    let projectFieldsShowNullsFields: any = {};
    let finalProjections: any = {};
    if (gameType !== "All" && gameType !== "Regular Season") { project["Game Type"] = "$game.venue.gameType" }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
    });
    finalProjections = { ...project, ...projectionKeys };
    finalProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    finalProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    project["Period 1"] = { $first: "$games.prdStats." + stat };
    project["Period 2"] = { $last: "$games.prdStats." + stat };
    finalProjections["Res"] = "-";
    finalProjections[resultcolumn] = valueKey;
    return finalProjections;
  }
  else {
    if (gameType !== "All" && gameType !== "Regular Season") { project["Game Type"] = "$game.venue.gameType" }
    if (valueKey.endsWith("dDoubles") || valueKey.endsWith("tDoubles")) {
      project["TP"] = "$games.stats.tp";
      project["Steals"] = "$games.stats.stl";
      project["Assists"] = "$games.stats.ast";
      project["Blocks"] = "$games.stats.blk";
      project["TREB"] = "$games.stats.treb";
    }
    project["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    project["OppScore"] = {
      $cond: {
        if: {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    project["Period 1"] = { $first: "$games.prdStats." + stat };
    project["Period 2"] = { $last: "$games.prdStats." + stat };
    // project["Peroid 2"] = "$games.prdStats";
    project["Res"] = "-";
    project[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
    return project;
  }
}
function getSeasonGroup(projectFields: any, valueKey: any) {
  let seasonGroup: any = {
    "count": { "$sum": 1 },
    _id: {
      name: "$name",
      season: "$games.season",
      playerClass: "$games.playerClass",
    },
    teamName: { $first: "$teamName" },
    teamCode: { $first: "$teamCode" },
  };
  if (projectFields) {
    let finalProjections: any = {};
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$sum": projectFields[key] };
    });
    finalProjections = { ...seasonGroup, ...projectionKeys };
    return finalProjections;
  }
  else {
    if (!valueKey.endsWith("$GP")) {
      seasonGroup["stat"] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey };
    }
    return seasonGroup;
  }
}
function getSeasonProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  try {
    let seasonProjections: any = {
      _id: 0,
      "Name": "$_id.name",
      "Class": "$_id.playerClass",
      "GP": "$count",
      "Season": "$_id.season",
      "TeamCode": "$teamCode",
      "Team": "$teamName",
    };
    if (projectFields) {
      let finalProjections: any = {};
      let projectionKeys: any = {};
      let stat: string = valueKey;
      Object.keys(projectFields).forEach(function (key) {
        const propVal = projectFields[key].replace('$', "");
        stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
        projectionKeys[key] = "$" + key;
      });
      finalProjections = { ...seasonProjections, ...projectionKeys };
      finalProjections[resultcolumn] = JSON.parse(stat);
      return finalProjections;
    }
    else {
      if (!valueKey.endsWith("$GP")) {
        seasonProjections[resultcolumn] = "$stat";
      }
      return seasonProjections;
    }
  } catch (e) {
    console.log(e);
    return {};
  }

}
function getCareerGroup(projectFields: any, valueKey: any) {
  let careerGroup: any = {
    _id: {
      name: "$name",
    },
    seasonMin: { $min: "$games.season" },
    seasonMax: { $max: "$games.season" },
    teamName: { $first: "$teamName" },
    teamId: { $first: "$teamId" },
    teamCode: { $first: "$teamCode" },
    count: { "$sum": 1 },
  };
  if (projectFields) {
    let finalProjections: any = {};
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$sum": projectFields[key] };
    });
    finalProjections = { ...careerGroup, ...projectionKeys };
    return finalProjections;
  }
  else {
    if (!valueKey.endsWith("$GP")) {
      careerGroup["stat"] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey };
    }
    return careerGroup;
  }
}
function getCareerProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  let careerProjections: any = {
    _id: 0,
    Name: "$_id.name",
    "GP": "$count",
    "TeamCode": "$teamCode",
    Team: "$teamName",
    Season: { $cond: [{ $eq: ["$seasonMin", "$seasonMax"] }, "$seasonMin", { $concat: [{ $substr: ["$seasonMin", 0, 4] }, " - ", { $substr: ["$seasonMax", 0, 4] }] }] },
  };
  if (projectFields) {
    let finalProjections: any = {};
    let projectionKeys: any = {};
    let stat: string = valueKey;
    Object.keys(projectFields).forEach(function (key) {
      const propVal = projectFields[key].replace('$', "");
      stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
      projectionKeys[key] = "$" + key;
    });
    finalProjections = { ...careerProjections, ...projectionKeys };
    finalProjections[resultcolumn] = JSON.parse(stat);
    return finalProjections;
  }
  else {
    if (!valueKey.endsWith("$GP")) {
      careerProjections[resultcolumn] = "$stat";
    }
    return careerProjections;
  }
}

// VAF Code

queryBasketballPlayerRoute.get("/period/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const team: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  const valueKey: any = projections ? JSON.parse(req.query.statistics) : "games.prdStats." + stat;
  let pipeline: any[] = [];
  let match: any[] = [
    { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
    match = [...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else {
    let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
    if (opponentConf.length > 0) {
      match = [...match, ...opponentConf];
      andCondition = [...andCondition, ...opponentConf];
    }
  }
  match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
  pipeline = [
    {
      $match: {
        "$and":
          match
      },
    },
    { $unwind: "$games" },
    { "$match": { "games.pos.gp": 1 } },
  ];
  if (andCondition.length > 0) {
    pipeline.push({
      $match: {
        "$and":
          andCondition
      },
    });
  }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        "$unwind": "$games.prdStats"
      },
      {
        $project: gettimebucketGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
      { $limit: 200 });
  }
  else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      team, req.params.gameType, nightGame);
    pipeline.push(
      {
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        "$unwind": "$games.prdStats"
      },
      gameLocation,
      {
        $project: gettimebucketGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
      { $limit: 200 });
  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    res.status(200).json({
      data: playerStats,
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

function gettimebucketGameProjections(projectFields: any, valueKey: any, resultcolumn: string, gameType: string, teamId: string) {
  let project: any = {
    _id: 0,
    Name: "$name",
    Class: "$games.playerClass",
    POS: { $ifNull: ["$games.pos.opos", "$games.pos.dpos"] },
    "Date": "$games.actualDate",
    "gameDate": "$games.gameDate",
    Season: "$games.season",
    TeamCode: "$teamCode",
    Team: "$teamName",
    OPP: "$games.opponentName",
    OpponentCode: "$games.opponentCode",
  };
  if (projectFields) {
    let projectFieldsShowNullsFields: any = {};
    let finalProjections: any = {};
    if (gameType !== "All" && gameType !== "Regular Season") { project["Game Type"] = "$game.venue.gameType" }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
    });
    finalProjections = { ...project, ...projectionKeys };
    finalProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    finalProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    finalProjections["Period"] = "$games.prdStats.prd";
    finalProjections["Res"] = "-";
    finalProjections[resultcolumn] = valueKey;
    return finalProjections;
  }
  else {
    if (gameType !== "All" && gameType !== "Regular Season") { project["Game Type"] = "$game.venue.gameType" }
    if (valueKey.endsWith("dDoubles") || valueKey.endsWith("tDoubles")) {
      project["TP"] = "$games.stats.tp";
      project["Steals"] = "$games.stats.stl";
      project["Assists"] = "$games.stats.ast";
      project["Blocks"] = "$games.stats.blk";
      project["TREB"] = "$games.stats.treb";
    }
    project["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    project["OppScore"] = {
      $cond: {
        if: {
          $eq: [{ "$arrayElemAt": ["$game.teamIds.home", 0] }, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    project["Period"] = "$games.prdStats.prd";
    project["Res"] = "-";
    project[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
    return project;
  }
}

export { queryBasketballPlayerRoute };
