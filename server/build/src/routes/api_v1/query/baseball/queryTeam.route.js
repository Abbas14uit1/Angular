"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queryBaseballTeamRoute = express_1.Router();
exports.queryBaseballTeamRoute = queryBaseballTeamRoute;
queryBaseballTeamRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const teamCode = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    const valueKey = projections ? JSON.parse(req.query.statistics) : "totals." + cat + "." + stat;
    let pipeline = [];
    let match = [
        { "sportCode": { "$eq": sportCode } },
    ];
    let conferenceMatch = getConferenceMatch(teamConference, teamDivision, oppConference, oppDivision);
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
        pipeline.push({
            $match: {
                "$and": match
            },
        }, {
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    else {
        let gameLocation = getGameLocationLookUp(req.params.location, opponent, teamCode, req.params.gameType, teamConference, teamDivision, oppConference, oppDivision, nightGame);
        match = [...match, ...gameLocation];
        pipeline.push({
            $match: {
                "$and": match
            },
        }, {
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const teamStats = yield db.collection("teamGames").aggregate(pipeline).toArray();
        if (cat == "EarnedRunsAverage" || cat === "Hitsper9innings" || cat == "SOper9innings") {
            let teamInningsStats = teamStats.map((x) => {
                x["IP"] = inningsStats(x["IP"]);
                x[resultcolumn] = getResultDataForInnings(x, cat, sportCode);
                return x;
            });
            res.status(200).json({
                data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
            });
        }
        else {
            res.status(200).json({
                data: teamStats,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during team query retrieval",
                    message: err.message,
                }],
        });
    }
}));
queryBaseballTeamRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const teamCode = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    const valueKey = projections ? req.query.statistics : "totals." + cat + "." + stat;
    let pipeline = [];
    let match = [
        { "sportCode": { "$eq": sportCode } },
    ];
    let conferenceMatch = getConferenceMatch(teamConference, teamDivision, oppConference, oppDivision);
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
                "$and": match
            },
        }, {
            $group: getSeasonGroup(projections, valueKey),
        }, {
            $project: getSeasonProjections(projections, valueKey, resultcolumn),
        }, {
            $match: {
                [resultcolumn]: { [aggIneq]: value }
            },
        }, { $sort: { [resultcolumn]: -1, "Season": -1 } });
    }
    else {
        let gameLocation = getGameLocationLookUp(req.params.location, opponent, teamCode, req.params.gameType, teamConference, teamDivision, oppConference, oppDivision, nightGame);
        match = [...match, ...gameLocation];
        pipeline.push({
            $match: {
                "$and": match
            },
        }, {
            $group: getSeasonGroup(projections, valueKey),
        }, {
            $project: getSeasonProjections(projections, valueKey, resultcolumn),
        }, {
            $match: {
                [resultcolumn]: { [aggIneq]: value }
            },
        }, { $sort: { [resultcolumn]: -1, "Season": -1 } });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const teamStats = yield db.collection("teamGames").aggregate(pipeline).toArray();
        if (valueKey.indexOf("pitching.ip") >= 0) {
            if (valueKey == "totals.pitching.ip") {
                let teamInningsStats = teamStats.map((x) => {
                    x[resultcolumn] = inningsStats(x[resultcolumn]);
                    return x;
                });
                res.status(200).json({
                    data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
                });
            }
            else {
                let teamInningsStats = teamStats.map((x) => {
                    x["IP"] = inningsStats(x["IP"]);
                    x[resultcolumn] = getResultDataForInnings(x, cat, sportCode);
                    return x;
                });
                res.status(200).json({
                    data: teamInningsStats.sort((row0, row1) => (row0.Total > row1.Total) ? -1 : 1),
                });
            }
        }
        else {
            res.status(200).json({
                data: teamStats,
            });
        }
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player team retrieval",
                    message: err.message,
                }],
        });
    }
}));
function getGameLocationLookUp(location, opponent, team, gamesType, teamConference, teamDivision, oppConference, oppDivision, nightGame) {
    let nightGameMatch = {};
    if (nightGame === "Day")
        nightGameMatch = { "nightGame": false };
    if (nightGame === "Night")
        nightGameMatch = { "nightGame": true };
    let gameTypeMath = getGameTypeMatch(gamesType);
    let gameLocation = gameTypeMath;
    try {
        if (location == "All") {
            gameLocation = [
                gameTypeMath,
                nightGameMatch,
            ];
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
            ];
        }
    }
    catch (err) {
        console.log(JSON.stringify(err));
    }
    return gameLocation;
}
function getConferenceMatch(teamConference, teamDivision, oppConference, oppDivision) {
    let conferenceMatch = [];
    if (teamConference !== "NA" && oppConference !== "NA") {
        if (teamDivision !== "NA" && oppDivision !== "NA") {
            conferenceMatch = [
                { "conference": teamConference },
                { "conferenceDivision": teamDivision },
                { "opponentConference": oppConference },
                { "opponentConferenceDivision": oppDivision }
            ];
        }
        else if (teamDivision !== "NA" && oppDivision == "NA") {
            conferenceMatch = [
                { "conference": teamConference },
                { "conferenceDivision": teamDivision },
                { "opponentConference": oppConference }
            ];
        }
        else if (teamDivision == "NA" && oppDivision !== "NA") {
            conferenceMatch = [
                { "conference": teamConference },
                { "opponentConference": oppConference },
                { "opponentConferenceDivision": oppDivision }
            ];
        }
        else if (teamDivision == "NA" && oppDivision == "NA") {
            conferenceMatch = [
                { "conference": teamConference },
                { "opponentConference": oppConference }
            ];
        }
    }
    else if (teamConference !== "NA") {
        if (teamDivision !== "NA") {
            conferenceMatch = [
                { "conference": teamConference },
                { "conferenceDivision": teamDivision }
            ];
        }
        else {
            conferenceMatch = [
                { "conference": teamConference }
            ];
        }
    }
    else if (oppConference !== "NA") {
        if (oppDivision !== "NA") {
            conferenceMatch = [
                { "opponentConference": oppConference },
                { "opponentConferenceDivision": oppDivision }
            ];
        }
        else {
            conferenceMatch = [
                { "opponentConference": oppConference }
            ];
        }
    }
    return conferenceMatch;
}
function getGameTypeMatch(gamesType) {
    let gameTypeMath = {};
    if (gamesType !== "All") {
        gameTypeMath = { "gameType": gamesType };
    }
    return gameTypeMath;
}
function getGameProjections(projectFields, valueKey, resultcolumn, gameType, teamId) {
    let finalProjections = {};
    if (projectFields) {
        let project = {};
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
        };
        if (gameType !== "All" && gameType !== "Regular Season") {
            project["Game Type"] = "$gameType";
        }
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
        });
        finalProjections = Object.assign({}, project, projectionKeys);
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
        };
        if (gameType !== "All" && gameType !== "Regular Season") {
            finalProjections["Game Type"] = "$gameType";
        }
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
function getSeasonGroup(projectFields, valueKey) {
    if (projectFields) {
        let project = {};
        let finalProjections = {};
        project = {
            "count": { "$sum": 1 },
            _id: {
                name: "$name",
                code: "$code",
                season: "$season",
            }
        };
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$sum": projectFields[key] };
        });
        finalProjections = Object.assign({}, project, projectionKeys);
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
        };
    }
}
function getSeasonProjections(projectFields, valueKey, resultcolumn) {
    try {
        let finalProjections = {};
        if (projectFields) {
            let project = {};
            project = {
                _id: 0,
                "Team": "$_id.name",
                "TeamCode": "$_id.code",
                "Season": "$_id.season",
            };
            let projectionKeys = {};
            let stat = valueKey;
            Object.keys(projectFields).forEach(function (key) {
                const propVal = projectFields[key].replace('$', "");
                stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
                projectionKeys[key] = "$" + key;
            });
            finalProjections = Object.assign({}, project, projectionKeys);
            finalProjections[resultcolumn] = JSON.parse(stat);
            return finalProjections;
        }
        else {
            finalProjections = {
                _id: 0,
                "Team": "$_id.name",
                "TeamCode": "$_id.code",
                "Season": "$_id.season",
            };
            finalProjections[resultcolumn] = "$stat";
            return finalProjections;
        }
    }
    catch (e) {
        console.log(e);
        return {};
    }
}
function inningsStats(n) {
    let str = n.toString();
    if (str.indexOf('.') != -1) {
        let decimalOnly = parseFloat(Math.abs(n).toString().split('.')[1].substring(0, 1));
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
function getResultDataForInnings(x, statistics, sportCode) {
    let ipFra = getIPFractionValue(x["IP"]);
    let inns = sportCode === "MBA" ? Number(9) : Number(7);
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
function getIPFractionValue(ip) {
    let ipStr = ip.toString();
    if (ipStr.indexOf('.') != -1) {
        let ipArr = Math.abs(ipStr).toString().split('.');
        let num = parseInt(ipArr[0]);
        let decimalOnly = parseFloat(ipArr[1].substring(0, 1));
        let divisor = (decimalOnly / 3).toFixed(3);
        return Number(num) + Number(divisor);
    }
    return ip;
}
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
//# sourceMappingURL=queryTeam.route.js.map