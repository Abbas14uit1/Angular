import { Router } from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";

const querySoccerTeamRoute: Router = Router();
querySoccerTeamRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
  const valueKey: any = projections ? JSON.parse(req.query.statistics) : stat;

  let pipeline: any[] = [];
  let match: any[] = [
    { "sportCode": { "$eq": sportCode } }
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
      { $limit: 200 },
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

querySoccerTeamRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
  const valueKey: string = projections ? req.query.statistics : stat;
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
  // if (match.length > 0) {
  //   pipeline = [
  //     {
  //       $match: {
  //         "$and":
  //           match
  //       },
  //     }
  //   ];
  // }
  if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
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
      { $sort: { [resultcolumn]: -1, "Season": -1 } }
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
      { $sort: { [resultcolumn]: -1, "Season": -1 } }
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
        { "homeTeam.code": team },
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
  if (gamesType !== "All") {
    gameTypeMath = { "gameType": gamesType }
  }
  return gameTypeMath;
}

function getGameProjections(projectFields: any, valueKey: any, resultcolumn: string, gameType: string, teamId: string) {

  let gameProjections: any = {
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
  if (gameType !== "All" && gameType !== "Regular Season") { gameProjections["Game Type"] = "$gameType" }
  if (projectFields) {
    let finalProjections: any = {};
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
    });
    finalProjections = { ...gameProjections, ...projectionKeys };
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
    finalProjections[resultcolumn] = valueKey;
    return finalProjections;
  }
  else {
    gameProjections["TeamScore"] = {
      "$cond": {
        "if": {
          $eq: ["$homeTeam.code", Number(teamId)],
        }, then: "$homeTeam.score", else: "$visitorTeam.score",
      },
    };
    gameProjections["OppScore"] = {
      $cond: {
        if: {
          $eq: ["$homeTeam.code", Number(teamId)],
        }, then: "$visitorTeam.score", else: "$homeTeam.score",
      },
    };
    gameProjections["Res"] = "-";
    gameProjections[resultcolumn] = "$" + valueKey;
    return gameProjections;
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
        code: "$code",
        season: "$season",
      },

    }
    let projectionKeys: any = {};
    Object.keys(projectFields).forEach(function (key) {
      projectionKeys[key] = projectFields[key] == "$count" ? {"$sum":1 }: { "$sum": projectFields[key] };
    });
    finalProjections = { ...project, ...projectionKeys };
    return finalProjections;
  }
  else {
    return {
      "count": { "$sum": 1 },
      _id: {
        name: "$name",
        code: "$code",
        season: "$season",
      },
      stat: { $sum: "$" + valueKey },
    }
  }
}

function getSeasonProjections(projectFields: any, valueKey: string, resultcolumn: string) {
  try {
    let seasonProjections: any = {
      _id: 0,
      "Team": "$_id.name",
      "TeamCode": "$_id.code",
      "Season": "$_id.season",
    }
    if (projectFields) {
      let finalSeasonProjections: any = {};
      let projectionKeys: any = {};
      let stat: string = valueKey;
      Object.keys(projectFields).forEach(function (key) {
        const propVal = projectFields[key].replace('$', "");
        stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
       projectionKeys[key] = "$" + key;
      });
      finalSeasonProjections = { ...seasonProjections, ...projectionKeys };
      finalSeasonProjections[resultcolumn] = JSON.parse(stat);
      return finalSeasonProjections;
    }
    else {

      seasonProjections[resultcolumn] = "$stat";
      return seasonProjections;
    }

  } catch (e) {
    console.log(e);
    return {};
  }

}


export { querySoccerTeamRoute };
