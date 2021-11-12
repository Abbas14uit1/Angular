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
const queryBasketballTeamRoute = express_1.Router();
exports.queryBasketballTeamRoute = queryBasketballTeamRoute;
queryBasketballTeamRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
    const valueKey = projections ? JSON.parse(req.query.statistics) : stat == "ptsTo" || stat == "ptsCh2" || stat == "ptsPaint" || stat == "ptsFastb" || stat == "ptsBench" || stat == "ties" || stat == "leads" || stat == "possCount" || stat == "possTime" || stat == "leadTime" || stat == "tiedTime" || stat == "largeLead" ? "totals.special." + stat : "totals.stats." + stat;
    let pipeline = [];
    let match = [
        { "sportCode": { "$eq": sportCode } }
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
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, stat),
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
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, stat),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const teamStats = yield db.collection("teamGames").aggregate(pipeline).toArray();
        res.status(200).json({
            data: teamStats,
        });
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
queryBasketballTeamRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
    const valueKey = projections ? req.query.statistics : stat == "ptsTo" || stat == "ptsCh2" || stat == "ptsPaint" || stat == "ptsFastb" || stat == "ptsBench" || stat == "ties" || stat == "leads" || stat == "possCount" || stat == "possTime" || stat == "leadTime" || stat == "tiedTime" || stat == "largeLead" ? "totals.special." + stat : "totals.stats." + stat;
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
    if (match.length > 0) {
        pipeline = [
            {
                $match: {
                    "$and": match
                },
            }
        ];
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
        res.status(200).json({
            data: teamStats,
        });
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
        nightGameMatch = { "snightGame": true };
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
                { "homeTeam.code": team },
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
function getGameProjections(projectFields, valueKey, resultcolumn, gameType, teamId, stat) {
    let gameProjections = {
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
        gameProjections["Game Type"] = "$gameType";
    }
    if (projectFields) {
        let finalProjections = {};
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
        });
        finalProjections = Object.assign({}, gameProjections, projectionKeys);
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
        finalProjections["Period 1"] = { $first: "$totals.prdStats." + stat };
        finalProjections["Period 2"] = { $last: "$totals.prdStats." + stat };
        finalProjections["Res"] = "-";
        finalProjections[resultcolumn] = valueKey;
        return finalProjections;
    }
    else {
        if (valueKey.endsWith("largeLead")) {
            gameProjections["Time Large Lead"] = "$totals.special.largeLeadT";
        }
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
        gameProjections["Period 1"] = { $first: "$totals.prdStats." + stat };
        gameProjections["Period 2"] = { $last: "$totals.prdStats." + stat };
        gameProjections["Res"] = "-";
        gameProjections[resultcolumn] = valueKey.endsWith("largeLead") || valueKey.endsWith("leadTime") ? { $max: "$" + valueKey } : "$" + valueKey;
        return gameProjections;
    }
}
function getSeasonGroup(projectFields, valueKey) {
    let seasonGroup = {
        _id: {
            name: "$name",
            code: "$code",
            season: "$season",
        }
    };
    if (projectFields) {
        let finalSeasonGroups = {};
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$sum": projectFields[key] };
        });
        finalSeasonGroups = Object.assign({}, seasonGroup, projectionKeys);
        return finalSeasonGroups;
    }
    else {
        if (valueKey.endsWith("largeLead")) {
            seasonGroup["TimeLargeLead"] = { $first: "$totals.special.largeLeadT" };
        }
        seasonGroup["stat"] = valueKey.endsWith("leadTime") || valueKey.endsWith("largeLead") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey };
        return seasonGroup;
    }
}
function getSeasonProjections(projectFields, valueKey, resultcolumn) {
    try {
        let seasonProjections = {
            _id: 0,
            "Team": "$_id.name",
            "TeamCode": "$_id.code",
            "Season": "$_id.season",
        };
        if (projectFields) {
            let finalSeasonProjections = {};
            let projectionKeys = {};
            let stat = valueKey;
            Object.keys(projectFields).forEach(function (key) {
                const propVal = projectFields[key].replace('$', "");
                stat = stat.replace(new RegExp("\\b" + propVal + "\\b", 'g'), key);
                projectionKeys[key] = "$" + key;
            });
            finalSeasonProjections = Object.assign({}, seasonProjections, projectionKeys);
            finalSeasonProjections[resultcolumn] = JSON.parse(stat);
            return finalSeasonProjections;
        }
        else {
            if (resultcolumn == "Large Lead") {
                seasonProjections["Time Large Lead"] = "$TimeLargeLead";
            }
            seasonProjections[resultcolumn] = "$stat";
            return seasonProjections;
        }
    }
    catch (e) {
        console.log(e);
        return {};
    }
}
//VAF Code
queryBasketballTeamRoute.get("/period/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
    const valueKey = projections ? JSON.parse(req.query.statistics) : (stat == "ptsTo" || stat == "ptsCh2" || stat == "ptsPaint" || stat == "ptsFastb" || stat == "ptsBench" || stat == "ties" || stat == "leads" || stat == "possCount" || stat == "possTime" || stat == "leadTime" || stat == "tiedTime" || stat == "largeLead" ? "totals.special." + stat : "totals.prdStats." + stat);
    let pipeline = [];
    let match = [
        { "sportCode": { "$eq": sportCode } }
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
            "$unwind": "$totals.prdStats"
        }, {
            $project: getPeriodProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
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
            "$unwind": "$totals.prdStats"
        }, {
            $project: getPeriodProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const teamStats = yield db.collection("teamGames").aggregate(pipeline).toArray();
        res.status(200).json({
            data: teamStats,
        });
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
function getPeriodProjections(projectFields, valueKey, resultcolumn, gameType, teamId) {
    let gameProjections = {
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
        gameProjections["Game Type"] = "$gameType";
    }
    if (projectFields) {
        let finalProjections = {};
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
        });
        finalProjections = Object.assign({}, gameProjections, projectionKeys);
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
        finalProjections["Period"] = "$totals.prdStats.prd";
        finalProjections["Res"] = "-";
        finalProjections[resultcolumn] = valueKey;
        return finalProjections;
    }
    else {
        if (valueKey.endsWith("largeLead")) {
            gameProjections["Time Large Lead"] = "$totals.special.largeLeadT";
        }
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
        gameProjections["Period"] = "$totals.prdStats.prd";
        gameProjections["Res"] = "-";
        gameProjections[resultcolumn] = valueKey.endsWith("largeLead") || valueKey.endsWith("leadTime") ? { $max: "$" + valueKey } : "$" + valueKey;
        return gameProjections;
    }
}
//# sourceMappingURL=queryTeam.route.js.map