import { Router } from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";

const queryBaseballTeamRoute: Router = Router();

queryBaseballTeamRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
      { $limit: 200 });
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
    if (cat == "EarnedRunsAverage" || cat === "Hitsper9innings" || cat == "SOper9innings") {
      let teamInningsStats = teamStats.map((x: any) => {
        x["IP"] = inningsStats(x["IP"]);
        x[resultcolumn] = getResultDataForInnings(x, cat, sportCode)
        return x;
      })
      res.status(200).json({
        data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
      });
    } else {
      res.status(200).json({
        data: teamStats,
      });
    }
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

queryBaseballTeamRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", async (req, res, next) => {
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
    if (valueKey.indexOf("pitching.ip") >= 0) {
      if (valueKey == "totals.pitching.ip") {
        let teamInningsStats = teamStats.map((x: any) => {
          x[resultcolumn] = inningsStats(x[resultcolumn])
          return x;
        });
        res.status(200).json({
          data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
      else {
        let teamInningsStats = teamStats.map((x: any) => {
          x["IP"] = inningsStats(x["IP"]);
          x[resultcolumn] = getResultDataForInnings(x, cat, sportCode)
          return x;
        })
        res.status(200).json({
          data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
        });
      }
    } else {
      res.status(200).json({
        data: teamStats,
      });
    }
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
  if (gamesType !== "All") {
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
      "count": { "$sum": 1 },
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
     "count": { "$sum": 1 },
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

export { queryBaseballTeamRoute };
