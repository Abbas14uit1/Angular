import { Router } from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";

const queryFootBallTeamRoute: Router = Router();

queryFootBallTeamRoute.get("/allteams", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;

  const pipeline: any[] = [
    {
      $project: {
        code: 1,
        name: 1,
      },
    },
    { $sort: { name: 1 } },
  ];

  try {
    const teams = await db.collection("teams").aggregate(pipeline).toArray();
    res.status(200).json({
      data: teams,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during team query retrieval",
        message: err.message,
      }],
    });
  }
});

queryFootBallTeamRoute.get("/confteams/:confname", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  let match: any[];
  const confPipeline: any[] =[];

  if(req.params.confname !== 'null'){
      confPipeline.push(   {
        $match: { "confName": { "$eq": req.params.confname } },
      });
  }
  confPipeline.push(
    {
      $project: {
        confName: 1,
        teamCode: 1,
        teamName: 1,
        sportCode: 1,
      },
    },
    { $sort: { teamName: 1 } },
  );

  try {
    const confTeams = await db.collection("ConfTeams").aggregate(confPipeline).toArray();
    if(confTeams){
     const teamCodes = confTeams.map((item: any) => Number(item["teamCode"]));
     const pipeline: any[] = [
     {
        $match: { "code": { "$in": teamCodes } },
      },
    {
      $project: {
        code: 1,
        name: 1
        
      },
    },
    { $sort: { name: 1 } },
    ];
     const teams = await await db.collection("teams").aggregate(pipeline).toArray();
     teams.map((team: any) => {
        for (const ct of confTeams) {
          if (team["code"] === Number(ct["teamCode"])){
            team['sportCodes'] = ct["sportCode"];
          }
        }
        return team;
     })
     res.status(200).json({
        data: teams,
     });
    }
    else{
      res.status(200).json({
        data: [],
      });
    }   
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during team query retrieval",
        message: err.message,
      }],
    });
  }
});

queryFootBallTeamRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const teamCode: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  const valueKey: any = projections ? JSON.parse(req.query.statistics) : "totals." + cat + "." + stat;

  let pipeline: any[] = [];
  let match: any[] = [
    { "sportCode": { "$eq": sportCode } },
  ];
  let conferenceMatch: any = getConferenceMatch(teamConference, teamDivision, oppConference, oppDivision);

  if (teamCode) {
    match.push({ code: { $eq: teamCode } });
  }
  if (opponent) {
    match.push({ "opponentCode": { "$eq": opponent } });
  }
  if (conferenceMatch.length > 0) {
    match = [...match, ...conferenceMatch];
  }

  if (req.params.location === "All" && req.params.gameType === "All" && nightGame === "All") {
    pipeline.push(
      {
        $match: {
          "$and":
            match
        },
      },
      {
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
    );
  }
  else {
    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent,
      teamCode, req.params.gameType, teamConference, teamDivision, oppConference, oppDivision, nightGame);
    match = [...match, ...gameLocation];
    pipeline.push(
      {
        $match: {
          "$and":
            match
        },
      },
      {
        $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
      },
      { $match: { [resultcolumn]: { [aggIneq]: value } } },
      { $sort: { [resultcolumn]: -1, "gameDate": -1 } },
      { $limit: 200 },
    );
  }
  console.log(JSON.stringify(pipeline));
  try {
    const teamStats = await db.collection("teamGames").aggregate(pipeline).toArray();
    res.status(200).json({
      data: teamStats,
    });
  } catch (err) {
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during team query retrieval",
        message: err.message,
      }],
    });
  }
});

queryFootBallTeamRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const stat: any = req.query.statistics;
  const projections: any = req.query.projections ? JSON.parse(req.query.projections) : "";
  const cat: string = req.params.stat_category;
  const value: number = Number(req.params.val);
  const ineq: string = req.params.ineq;
  const aggIneq: string = "$" + ineq;
  const teamCode: number = Number(req.params.team);
  const opponent: number = Number(req.params.opponent);
  const sportCode: string = req.params.sportCode;
  const teamConference: string = req.params.teamConference;
  const teamDivision: string = req.params.teamDivision;
  const oppConference: string = req.params.oppConference;
  const oppDivision: string = req.params.oppDivision;
  const nightGame: string = req.params.nightGame;
  const resultcolumn: string = req.params.resultcolumn;
  const valueKey: string = projections ? req.query.statistics : "totals." + cat + "." + stat;
  let pipeline: any[] = [];
  let match: any[] = [
    { "sportCode": { "$eq": sportCode } },
  ];
  let conferenceMatch: any = getConferenceMatch(teamConference, teamDivision, oppConference, oppDivision);
  if (teamCode) {
    match.push({ code: { $eq: teamCode } });
  }
  if (opponent) {
    match.push({ "opponentCode": { "$eq": opponent } });
  }
  if (conferenceMatch.length > 0) {
    match = [...match, ...conferenceMatch];
  }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
    pipeline.push({
      $match: {
        "$and":
          match
      },
    },
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
      { $sort: { [resultcolumn]: -1, "Season": -1 } },
    );
  }
  else {

    let gameLocation: any = getGameLocationLookUp(req.params.location, opponent, teamCode, req.params.gameType, teamConference, teamDivision, oppConference, oppDivision, nightGame);
    match = [...match, ...gameLocation];
    pipeline.push(
      {
        $match: {
          "$and":
            match
        },
      },
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
      { $sort: { [resultcolumn]: -1, "Season": -1 } },
    );
  }

  console.log(JSON.stringify(pipeline));
  try {
    const teamStats = await db.collection("teamGames").aggregate(pipeline).toArray();
    res.status(200).json({
      data: teamStats,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during player team retrieval",
        message: err.message,
      }],
    });
  }
});

function getGameLocationLookUp(location: string, opponent: number, team: number, gamesType: string, teamConference: string, teamDivision: string, oppConference: string, oppDivision: string, nightGame: string) {
  let nightGameMatch: any = {};
  if (nightGame === "Day")
    nightGameMatch = { "nightGame": false }
  if (nightGame === "Night")
    nightGameMatch = { "nightGame": true }

  let gameTypeMath: any = getGameTypeMatch(gamesType);
  let gameLocation: any = gameTypeMath;
  try {
    if (location == "All") {
      gameLocation = [
        gameTypeMath,
        nightGameMatch,
      ]
    }
    else if (location == "Neutral") {
      gameLocation = [
        gameTypeMath,
        { "neutralLocation": true },
        nightGameMatch,
      ];
    }
    else if (location == "Away") {
      gameLocation = [
        gameTypeMath,
        { "visitorTeam.code": team },
        { "neutralLocation": false },
        nightGameMatch,
      ];
    }
    else if (location == "Home") {
      gameLocation = [
        gameTypeMath,
        { "homeTeam.code": Number(team) },
        { "neutralLocation": false },
        nightGameMatch,
      ]
    }
  } catch (err) {
    console.log(JSON.stringify(err));
  }
  return gameLocation;
}

function getConferenceMatch(teamConference: string, teamDivision: string, oppConference: string, oppDivision: string) {

  let conferenceMatch: any[] = [];
  if (teamConference !== "NA" && oppConference !== "NA") {
    if (teamDivision !== "NA" && oppDivision !== "NA") {
      conferenceMatch = [
        { "conference": teamConference },
        { "conferenceDivision": teamDivision },
        { "opponentConference": oppConference },
        { "opponentConferenceDivision": oppDivision }
      ]
    }
    else if (teamDivision !== "NA" && oppDivision == "NA") {
      conferenceMatch = [
        { "conference": teamConference },
        { "conferenceDivision": teamDivision },
        { "opponentConference": oppConference }]
    }
    else if (teamDivision == "NA" && oppDivision !== "NA") {
      conferenceMatch = [
        { "conference": teamConference },
        { "opponentConference": oppConference },
        { "opponentConferenceDivision": oppDivision }]
    }
    else if (teamDivision == "NA" && oppDivision == "NA") {
      conferenceMatch = [
        { "conference": teamConference },
        { "opponentConference": oppConference }]
    }
  }
  else if (teamConference !== "NA") {
    if (teamDivision !== "NA") {
      conferenceMatch = [
        { "conference": teamConference },
        { "conferenceDivision": teamDivision }]
    }
    else {
      conferenceMatch = [
        { "conference": teamConference }]
    }
  }
  else if (oppConference !== "NA") {
    if (oppDivision !== "NA") {
      conferenceMatch = [
        { "opponentConference": oppConference },
        { "opponentConferenceDivision": oppDivision }]
    }
    else {
      conferenceMatch = [
        { "opponentConference": oppConference }]
    }
  }
  return conferenceMatch;
}

function getGameTypeMatch(gamesType: string) {
  let gameTypeMath: any = {};
  if (gamesType !== "All" && gamesType === "Post Season") {
    gameTypeMath = {
      "$or": [
        { "gameType": gamesType },
        { "gameType": "Bowl" },
        { "gameType": "Conference Championship" },
        { "gameType": "CFP Semi-Final" },
        { "gameType": "CFP National Championship" },
      ]
    }
  }
  else if (gamesType !== "All" && gamesType === "Regular Season") {
    gameTypeMath = { "gameType": gamesType }
  }
  return gameTypeMath;
}

function getGameProjections(projectFields: any, valueKey: any, resultcolumn: string, gameType: string, teamId: string) {
  let finalProjections: any = {};
  if (projectFields) {
    let project: any = {};
    project = {
      _id: 0,
      Name: 1,
      TeamCode: "$code",
      Team: "$name",
      OPP: "$opponentName",
      OpponentCode: "$opponentCode",
      "Date": "$actualDate",
      "gameDate": "$gameDate",
      Season: "$season",
    }
    if (gameType !== "All" && gameType !== "Regular Season") { project["Game Type"] = "$gameType" }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
    });
    finalProjections = { ...project, ...projectionKeys };
    finalProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: ["$homeTeam.code", Number(teamId)],
        }, then: "$homeTeam.score", else: "$visitorTeam.score",
      },
    };
    finalProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: ["$homeTeam.code",Number(teamId)],
        }, then: "$visitorTeam.score", else: "$homeTeam.score",
      },
    };
    finalProjections["Res"] = "-";
    finalProjections[resultcolumn] = valueKey;
    return finalProjections;
  }
  else {
    finalProjections = {
      _id: 0,
      Name: 1,
      TeamCode: "$code",
      Team: "$name",
      OPP: "$opponentName",
      OpponentCode: "$opponentCode",
      "Date": "$actualDate",
      "gameDate": "$gameDate",
      Season: "$season",
    }
    if (gameType !== "All" && gameType !== "Regular Season") { finalProjections["Game Type"] = "$gameType" }
    finalProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: ["$homeTeam.code", Number(teamId)],
        }, then: "$homeTeam.score", else: "$visitorTeam.score",
      },
    };
    finalProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: ["$homeTeam.code", Number(teamId)],
        }, then: "$visitorTeam.score", else: "$homeTeam.score",
      },
    };
    finalProjections["Res"] = "-";
    finalProjections[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
    return finalProjections;
  }
}

function getSeasonGroup(projectFields: any, valueKey: any) {
  if (projectFields) {
    let project: any = {};
    let finalProjections: any = {};
    project = {
      _id: {
        name: "$name",
        code: "$code",
        season: "$season",
      }
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
        code: "$code",
        season: "$season",
      },
      stat: valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey },
    }
  }
}

function getSeasonProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  try {
    let finalProjections: any = {};
    if (projectFields) {
      let project: any = {};
      project = {
        _id: 0,
        "Team": "$_id.name",
        "TeamCode": "$_id.code",
        "Season": "$_id.season",
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
      finalProjections = {
        _id: 0,
        "Team": "$_id.name",
        "TeamCode": "$_id.code",
        "Season": "$_id.season",
      }
      finalProjections[resultcolumn] = "$stat";
      return finalProjections;
    }

  } catch (e) {
    console.log(e);
    return {};
  }

}

export { queryFootBallTeamRoute };
