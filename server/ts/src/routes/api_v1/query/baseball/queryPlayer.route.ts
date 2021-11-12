import { Router } from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";

const queryBaseballPlayerRoute: Router = Router();

queryBaseballPlayerRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
  const valueKey: any = projections ? JSON.parse(req.query.statistics) : "games.stats." + cat + "." + stat;
  let pipeline: any[] = [];
  let match: any[]= [      
      { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else
  {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
     match = [ ...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else 
  {
     let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
     if(opponentConf.length>0)
     {
       match = [ ...match, ...opponentConf];
       andCondition = [ ...andCondition, ...opponentConf];
     }
  } 
  match.push({ name: { $nin: ["TEAM", "TM","Team", "Tm", "team", "tm"] } });
  pipeline = [
      {
        $match: {
          "$and":
            match
        },
      },
      { $unwind: "$games" },
  ];
  if(andCondition.length > 0)
      {
          pipeline.push({
          $match: {
            "$and":
              andCondition
          },
        });
      }  
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
      pipeline.push({
        $lookup:
        {
          from: "games",
          localField: "games.gameId",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1 , "gameDate":-1 } },
      { $limit: 200 });
  }
  else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      team, req.params.gameType, nightGame);
     pipeline.push({
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
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId ),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1,"gameDate":-1 } },
      { $limit: 200 });
  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    if (cat == "EarnedRunsAverage" || cat === "Hitsper9innings" || cat == "SOper9innings") {
      let playerInningsStats = playerStats.map((x: any) => {
        x["IP"] = inningsStats(x["IP"]);
        x[resultcolumn] = getResultDataForInnings(x, cat, sportCode)
        return x;
      })
      res.status(200).json({
        data: playerInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
      });
    } else {
      res.status(200).json({
        data: playerStats,
      });
    }
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
queryBaseballPlayerRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
  const valueKey: any = projections ? req.query.statistics : "games.stats." + cat + "." + stat;
  let pipeline: any[] = [];
  let match: any[]= [
      { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else
  {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
     match = [ ...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else 
  {
     let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
     if(opponentConf.length>0)
     {
       match = [ ...match, ...opponentConf];
       andCondition = [ ...andCondition, ...opponentConf];
     }
  }
  if (cat === 'hitSummaryAvg'){
    for (let key in projections) {
      const statValue = projections[key].replace('$', '');
      const addCond: any = {};
      addCond[statValue] = { "$gt": 0 }
      andCondition.push(addCond);
    }
  }
  if (valueKey.indexOf("pitching.ip") >= 0) {
    const addCond: any = {};
    addCond["games.stats.pitching.ip"] = { "$gt": 0 }
    andCondition.push(addCond);
  }
  match.push({ name: { $nin: ["TEAM", "TM","Team", "Tm", "team", "tm"] } });
  pipeline = [
      {
        $match: {
          "$and":
            match
        },
      },
      { $unwind: "$games" },
  ];
  if(andCondition.length > 0)
      {
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
      { $sort: { [resultcolumn]: -1, "Season":-1 } });
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
      { $sort: { [resultcolumn]: -1, "Season":-1 } });

  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    
    if (valueKey.indexOf("pitching.ip") >= 0) {
      if (valueKey == "games.stats.pitching.ip") {
        let playerInningsStats = playerStats.map((x: any) => {
          x[resultcolumn] = inningsStats(x[resultcolumn])
          return x;
        });
        res.status(200).json({
          data: playerInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
      else {
        let playerInningsStats = playerStats.map((x: any) => {
          x["IP"] = inningsStats(x["IP"]);
          x[resultcolumn] = getResultDataForInnings(x, cat, sportCode)
          return x;
        })
        res.status(200).json({
          data: playerInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
    }
    else {
      res.status(200).json({
        data: playerStats,
      });
    }
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

queryBaseballPlayerRoute.get("/career/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
  const valueKey: any = projections ? req.query.statistics : "games.stats." + cat + "." + stat;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  let pipeline: any[] = [];
  let match: any[]= [
      { sportCode: { $eq: sportCode } },
  ];
  let andCondition: any[] = [];
  if (team) {
    match.push({ teamCode: { $eq: team } });
  }
  else
  {
    let teamConf: any = getTeamConferenceMatch(teamConference, teamDivision);
     match = [ ...match, ...teamConf];
  }
  if (opponent) {
    match.push({ "games.opponentCode": { "$eq": opponent } });
    andCondition.push({ "games.opponentCode": { "$eq": opponent } });
  }
  else 
  {
     let opponentConf: any = getOpponentConferenceMatch(oppConference, oppDivision);
     if(opponentConf.length>0)
     {
       match = [ ...match, ...opponentConf];
       andCondition = [ ...andCondition, ...opponentConf];
     }
  }
  if (cat === 'hitSummaryAvg'){
    for (let key in projections) {
      const statValue = projections[key].replace('$', '');
      const addCond: any = {};
      addCond[statValue] = { "$gt": 0 }
      andCondition.push(addCond);
    }
  }
  if (valueKey.indexOf("pitching.ip") >= 0) {
    const addCond: any = {};
    addCond["games.stats.pitching.ip"] = { "$gt": 0 }
    andCondition.push(addCond);
  }
  match.push({ name: { $nin: ["TEAM", "TM","Team", "Tm", "team", "tm"] } });
  pipeline = [
      {
        $match: {
          "$and":
            match
        },
      },
      { $unwind: "$games" },
  ];
  if(andCondition.length > 0)
      {
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
      { $sort: { [resultcolumn]: -1,"Season":-1 } });
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
      { $sort: { [resultcolumn]: -1,"Season":-1 } });
  }
  console.log(JSON.stringify(pipeline));
  try {
    const playerStats = await db.collection("players").aggregate(pipeline).toArray();
    if (valueKey.indexOf("pitching.ip") >= 0) {
      if (valueKey == "games.stats.pitching.ip") {
        let playerInningsStats = playerStats.map((x: any) => {
          x[resultcolumn] = inningsStats(x[resultcolumn])
          return x;
        });
        res.status(200).json({
          data: playerInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
      else {
        let playerInningsStats = playerStats.map((x: any) => {
          x["IP"] = inningsStats(x["IP"]);
          x[resultcolumn] = getResultDataForInnings(x, cat, sportCode)
          return x;
        })
        res.status(200).json({
          data: playerInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
    }
    else {
      res.status(200).json({
        data: playerStats,
      });
    }
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
    conferenceMatch =  [
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
    conferenceMatch =  [
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
function getGameProjections(projectFields: any, valueKey: any, resultcolumn: string, gameType: string, teamId: string) {
  let project: any = {};
  if (projectFields) {    
    let projectFieldsShowNullsFields: any = {};
    let finalProjections: any = {};
    project = {
      _id: 0,
      Name: "$name",
      Class: "$games.playerClass",
      POS: { $ifNull: ["$games.pos.opos", "$games.pos.dpos"] },
      "Date": "$games.actualDate",      
      "gameDate":"$games.gameDate",
      Season: "$games.season",
      TeamCode: "$teamCode",
      Team: "$teamName",      
      OPP: "$games.opponentName",
      OpponentCode: "$games.opponentCode",      
    }
    if(gameType !== "All" && gameType !== "Regular Season")
    { project["Game Type"] = "$game.venue.gameType" }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
    });
    finalProjections = { ...project, ...projectionKeys };
    finalProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{"$arrayElemAt": ["$game.teamIds.home", 0]}, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    finalProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: [{"$arrayElemAt": ["$game.teamIds.home", 0]}, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    finalProjections["Res"] = "-";
    finalProjections[resultcolumn] = valueKey;
    return finalProjections;
  }
  else {
    project = {
      _id: 0,
      Name: "$name",
      Class: "$games.playerClass",
      POS: { $ifNull: ["$games.pos.opos", "$games.pos.dpos"] },
      "Date": "$games.actualDate",
      "gameDate":"$games.gameDate",
      Season: "$games.season",
      TeamCode: "$teamCode",
      Team: "$teamName",
      OPP: "$games.opponentName",
      OpponentCode: "$games.opponentCode",      
    }
    if(gameType !== "All" && gameType !== "Regular Season")
    { project["Game Type"] = "$game.venue.gameType" }
    project["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: [{"$arrayElemAt": ["$game.teamIds.home", 0]}, teamId],
        }, then: "$game.team.home.score", else: "$game.team.visitor.score",
      },
    };
    project["OppScore"] = {
      $cond: {
        if: {
          $eq: [{"$arrayElemAt": ["$game.teamIds.home", 0]}, teamId],
        }, then: "$game.team.visitor.score", else: "$game.team.home.score",
      },
    };
    project["Res"] = "-";
    project[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
    return project;
  }
}
function getSeasonGroup(projectFields: any, valueKey: any) {
  if (projectFields) {
    let project: any = {};
    let finalProjections: any = {};
    project = {
      "count": { "$sum": 1 },
      _id: {
        name: "$name",
        season: "$games.season",
        playerClass: "$games.playerClass",
      },
      teamName: { $first: "$teamName" },
      teamCode: { $first: "$teamCode" },
    }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$sum": projectFields[key] };
    });
    finalProjections = { ...project, ...projectionKeys };
    return finalProjections;
  }
  else {
    return {
      "count": { "$sum": 1 },
      _id: {
        name: "$name",
        season: "$games.season",
        playerClass: "$games.playerClass",
      },
      stat: valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey },
      teamName: { $first: "$teamName" },
      teamCode: { $first: "$teamCode" },
    }
  }
}
function getSeasonProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  try {
    if (projectFields) {
      let project: any = {};
      let finalProjections: any = {};
      project = {
        _id: 0,
        "Name": "$_id.name",
        "Class": "$_id.playerClass",
        "GP": "$count",
        "Season": "$_id.season",
        "TeamCode": "$teamCode",
        "Team": "$teamName",       
      }
      let projectionKeys: any = {};
      let stat: string = valueKey;
      Object.keys(projectFields).forEach(function (key) {
        const propVal = projectFields[key].replace('$', "");
        stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
        projectionKeys[key] = "$" + key;
      });
      finalProjections = { ...project, ...projectionKeys };
      finalProjections[resultcolumn] = JSON.parse(stat);
      return finalProjections;
    }
    else {
      return {
        _id: 0,
        "Name": "$_id.name",
        "Class": "$_id.playerClass",
        "GP": "$count",
        "Season": "$_id.season",
        "TeamCode": "$teamCode",
        "Team": "$teamName",       
        [resultcolumn]: "$stat",
      }
    }
  } catch (e) {
    console.log(e);
    return {};
  }

}
function getCareerGroup(projectFields: any, valueKey: any) {
  if (projectFields) {
    let project: any = {};
    let finalProjections: any = {};
    project = {
      _id: {
        name: "$name",
      },
      seasonMin: { $min: "$games.season" },
      seasonMax: { $max: "$games.season" },
      teamName: { $first: "$teamName" },
      teamId: { $first: "$teamId" },
      teamCode: { $first: "$teamCode" },
      count: { "$sum": 1 },
    }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$sum": projectFields[key] };
    });
    finalProjections = { ...project, ...projectionKeys };
    return finalProjections;
  }
  else {
    return {
      _id: {
        name: "$name",
      },
      seasonMin: { $min: "$games.season" },
      seasonMax: { $max: "$games.season" },
      teamName: { $first: "$teamName" },
      teamId: { $first: "$teamId" },
      teamCode: { $first: "$teamCode" },
      stat: valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey },
      count: { "$sum": 1 },
    }
  }
}
function getCareerProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  if (projectFields) {
    let project: any = {};
    let finalProjections: any = {};
    project = {
      _id: 0,
      Name: "$_id.name",
      "GP": "$count",
      "TeamCode": "$teamCode",
      Team: "$teamName",      
      Season: { $cond: [{ $eq: ["$seasonMin", "$seasonMax"] }, "$seasonMin", { $concat: [{ $substr: ["$seasonMin", 0, 4] }, " - ", { $substr: ["$seasonMax", 0, 4] }] }] },
    }
    let projectionKeys: any = {};
    let stat: string = valueKey;
    Object.keys(projectFields).forEach(function (key) {
      const propVal = projectFields[key].replace('$', "");
      stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
      projectionKeys[key] = "$" + key;
    });
    finalProjections = { ...project, ...projectionKeys };
    finalProjections[resultcolumn] = JSON.parse(stat);
    return finalProjections;
  }
  else {
    return {
      _id: 0,
      Name: "$_id.name",
      "GP": "$count",
      "TeamCode": "$teamCode",
      Team: "$teamName",
      Season: { $cond: [{ $eq: ["$seasonMin", "$seasonMax"] }, "$seasonMin", { $concat: [{ $substr: ["$seasonMin", 0, 4] }, " - ", { $substr: ["$seasonMax", 0, 4] }] }] },
      [resultcolumn]: "$stat",
    }
  }
}
function inningsStats(n: any) {
  let str = n.toString();
  if (str.indexOf('.') != -1) {
    let decimalOnly = parseFloat(Math.abs(n).toString().split('.')[1].substring(0,1));
    if (decimalOnly >= 3) {
      let divisor = Math.floor(decimalOnly / 3);
      let remainder = "0." + (decimalOnly % 3);
      let intNum = Math.trunc(n);
      return Number((Number(intNum) + Number(divisor) + Number(remainder)).toFixed(1));
    }
    return Number(n.toFixed(1));
  }
  return Number(n.toFixed(1));
}

function getResultDataForInnings(x: any, statistics: string, sportCode: string) {
  let ipFra = getIPFractionValue(x["IP"]);
  let inns = sportCode === "MBA" ? Number(9): Number(7);
  switch (statistics) {
    case "EarnedRunsAverage":
      return round(x["IP"] !== 0 ? ((x["ER"] / Number(ipFra)) * inns) : 0, 2);
    case "Hitsper9innings":
      return round(x["IP"] !== 0 ? ((x["H"] / Number(ipFra)) * inns) : 0, 1);
    case "SOper9innings":
        return round(x["IP"] !== 0 ? ((x["K"] / Number(ipFra)) * inns) : 0, 1);
    default: return x["IP"];
  }
}

function getIPFractionValue(ip: any){
  let ipStr = ip.toString();
  if (ipStr.indexOf('.') != -1) {
    let ipArr = Math.abs(ipStr).toString().split('.');
    let num = parseInt(ipArr[0]);
    let decimalOnly = parseFloat(ipArr[1].substring(0,1));
    let divisor = (decimalOnly / 3).toFixed(3);
    return Number(num) + Number(divisor);
  }
  return ip;
}

function round(value: number, precision: number) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export { queryBaseballPlayerRoute };
