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
const queryFootBallPlayerRoute = express_1.Router();
exports.queryFootBallPlayerRoute = queryFootBallPlayerRoute;
queryFootBallPlayerRoute.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const team = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    const valueKey = projections ? JSON.parse(req.query.statistics) : "games.stats." + cat + "." + stat;
    let pipeline = [];
    let match = [
        { sportCode: { $eq: sportCode } },
    ];
    let andCondition = [];
    if (team) {
        match.push({ teamCode: { $eq: team } });
    }
    else {
        let teamConf = getTeamConferenceMatch(teamConference, teamDivision);
        match = [...match, ...teamConf];
    }
    if (opponent) {
        match.push({ "games.opponentCode": { "$eq": opponent } });
        andCondition.push({ "games.opponentCode": { "$eq": opponent } });
    }
    else {
        let opponentConf = getOpponentConferenceMatch(oppConference, oppDivision);
        if (opponentConf.length > 0) {
            match = [...match, ...opponentConf];
            andCondition = [...andCondition, ...opponentConf];
        }
    }
    match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
    pipeline = [
        {
            $match: {
                "$and": match
            },
        },
        { $unwind: "$games" },
    ];
    if (andCondition.length > 0) {
        pipeline.push({
            $match: {
                "$and": andCondition
            },
        });
    }
    if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
        pipeline.push({
            $lookup: {
                from: "games",
                localField: "games.gameId",
                foreignField: "_id",
                as: "game"
            }
        }, {
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    else {
        let gameLocation = getGameLocationLookUp(req.params.location, opponent, team, req.params.gameType, nightGame);
        pipeline.push({
            $lookup: {
                from: "games",
                localField: "games.gameId",
                foreignField: "_id",
                as: "game"
            }
        }, gameLocation, {
            $project: getGameProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const playerStats = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: playerStats,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player query retrieval",
                    message: err.message,
                }],
        });
    }
}));
queryFootBallPlayerRoute.get("/season/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const team = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    const valueKey = projections ? req.query.statistics : "games.stats." + cat + "." + stat;
    let pipeline = [];
    let match = [
        { sportCode: { $eq: sportCode } },
    ];
    let andCondition = [];
    if (team) {
        match.push({ teamCode: { $eq: team } });
    }
    else {
        let teamConf = getTeamConferenceMatch(teamConference, teamDivision);
        match = [...match, ...teamConf];
    }
    if (opponent) {
        match.push({ "games.opponentCode": { "$eq": opponent } });
        andCondition.push({ "games.opponentCode": { "$eq": opponent } });
    }
    else {
        let opponentConf = getOpponentConferenceMatch(oppConference, oppDivision);
        if (opponentConf.length > 0) {
            match = [...match, ...opponentConf];
            andCondition = [...andCondition, ...opponentConf];
        }
    }
    match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
    pipeline = [
        {
            $match: {
                "$and": match
            },
        },
        { $unwind: "$games" },
    ];
    if (andCondition.length > 0) {
        pipeline.push({
            $match: {
                "$and": andCondition
            },
        });
    }
    if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
        pipeline.push({
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
        let gameLocation = getGameLocationLookUp(req.params.location, opponent, team, req.params.gameType, nightGame);
        pipeline.push({
            $lookup: {
                from: "games",
                localField: "games.gameId",
                foreignField: "_id",
                as: "game"
            }
        }, gameLocation, {
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
        const playerStats = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: playerStats,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player query retrieval",
                    message: err.message,
                }],
        });
    }
}));
queryFootBallPlayerRoute.get("/career/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const team = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const valueKey = projections ? req.query.statistics : "games.stats." + cat + "." + stat;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    let pipeline = [];
    let match = [
        { sportCode: { $eq: sportCode } },
    ];
    let andCondition = [];
    if (team) {
        match.push({ teamCode: { $eq: team } });
    }
    else {
        let teamConf = getTeamConferenceMatch(teamConference, teamDivision);
        match = [...match, ...teamConf];
    }
    if (opponent) {
        match.push({ "games.opponentCode": { "$eq": opponent } });
        andCondition.push({ "games.opponentCode": { "$eq": opponent } });
    }
    else {
        let opponentConf = getOpponentConferenceMatch(oppConference, oppDivision);
        if (opponentConf.length > 0) {
            match = [...match, ...opponentConf];
            andCondition = [...andCondition, ...opponentConf];
        }
    }
    match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
    pipeline = [
        {
            $match: {
                "$and": match
            },
        },
        { $unwind: "$games" },
    ];
    if (andCondition.length > 0) {
        pipeline.push({
            $match: {
                "$and": andCondition
            },
        });
    }
    if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
        pipeline.push({
            $group: getCareerGroup(projections, valueKey),
        }, {
            $project: getCareerProjections(projections, valueKey, resultcolumn),
        }, {
            $match: {
                [resultcolumn]: { [aggIneq]: value }
            },
        }, { $sort: { [resultcolumn]: -1, "Season": -1 } });
    }
    else {
        let gameLocation = getGameLocationLookUp(req.params.location, opponent, team, req.params.gameType, nightGame);
        pipeline.push({
            $lookup: {
                from: "games",
                localField: "games.gameId",
                foreignField: "_id",
                as: "game"
            }
        }, gameLocation, {
            $group: getCareerGroup(projections, valueKey),
        }, {
            $project: getCareerProjections(projections, valueKey, resultcolumn),
        }, {
            $match: {
                [resultcolumn]: { [aggIneq]: value }
            },
        }, { $sort: { [resultcolumn]: -1, "Season": -1 } });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const playerStats = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: playerStats,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player query retrieval",
                    message: err.message,
                }],
        });
    }
}));
function getGameLocationLookUp(location, opponent, team, gamesType, nightGame) {
    let nightGameMatch = {};
    if (nightGame === "Day")
        nightGameMatch = { "game.venue.nightGame": false };
    if (nightGame === "Night")
        nightGameMatch = { "game.venue.nightGame": true };
    let gameTypeMath = getGameTypeMatch(gamesType);
    let gameLocation = gameTypeMath;
    try {
        if (location == "All") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        nightGameMatch,
                    ]
                },
            };
        }
        else if (location == "Neutral") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        { "game.venue.neutralLocation": true },
                        nightGameMatch,
                    ]
                },
            };
        }
        else if (location == "Away") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        { "game.team.visitor.code": team },
                        { "game.venue.neutralLocation": false },
                        nightGameMatch,
                    ]
                },
            };
        }
        else if (location == "Home") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        { "game.team.home.code": team },
                        { "game.venue.neutralLocation": false },
                        nightGameMatch,
                    ]
                },
            };
        }
    }
    catch (err) {
        console.log(JSON.stringify(err));
    }
    return gameLocation;
}
function getOpponentConferenceMatch(oppConference, oppDivision) {
    let conferenceMatch = [];
    if (oppDivision !== "NA" && oppConference !== "NA") {
        conferenceMatch = [
            { "games.opponentConference": oppConference },
            { "games.opponentConferenceDivision": oppDivision }
        ];
    }
    else if (oppDivision == "NA" && oppConference !== "NA") {
        conferenceMatch = [
            { "games.opponentConference": oppConference }
        ];
    }
    return conferenceMatch;
}
function getTeamConferenceMatch(teamConference, teamConferenceDivision) {
    let conferenceMatch = [];
    if (teamConferenceDivision !== "NA" && teamConference !== "NA") {
        conferenceMatch = [
            { "teamConference": teamConference },
            { "teamConferenceDivision": teamConferenceDivision }
        ];
    }
    else if (teamConferenceDivision == "NA" && teamConference !== "NA") {
        conferenceMatch = [
            { "teamConference": teamConference }
        ];
    }
    return conferenceMatch;
}
function getGameTypeMatch(gamesType) {
    let gameTypeMath = {};
    if (gamesType === "Post Season") {
        gameTypeMath = {
            "$or": [
                { "game.venue.gameType": gamesType },
                { "game.venue.gameType": "Bowl" },
                { "game.venue.gameType": "Conference Championship" },
                { "game.venue.gameType": "CFP Semi-Final" },
                { "game.venue.gameType": "CFP National Championship" },
            ]
        };
    }
    else if (gamesType === "Regular Season") {
        gameTypeMath = { "game.venue.gameType": gamesType };
    }
    return gameTypeMath;
}
function getGameProjections(projectFields, valueKey, resultcolumn, gameType, teamId) {
    let project = {};
    if (projectFields) {
        let projectFieldsShowNullsFields = {};
        let finalProjections = {};
        project = {
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
        if (gameType !== "All" && gameType !== "Regular Season") {
            project["Game Type"] = "$game.venue.gameType";
        }
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
        });
        finalProjections = Object.assign({}, project, projectionKeys);
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
            "gameDate": "$games.gameDate",
            Season: "$games.season",
            TeamCode: "$teamCode",
            Team: "$teamName",
            OPP: "$games.opponentName",
            OpponentCode: "$games.opponentCode",
        };
        if (gameType !== "All" && gameType !== "Regular Season") {
            project["Game Type"] = "$game.venue.gameType";
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
        project["Res"] = "-";
        project[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
        return project;
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
                season: "$games.season",
                playerClass: "$games.playerClass",
            },
            teamName: { $first: "$teamName" },
            teamCode: { $first: "$teamCode" },
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
                season: "$games.season",
                playerClass: "$games.playerClass",
            },
            stat: valueKey.endsWith("Long") ? { $max: "$" + valueKey } : { $sum: "$" + valueKey },
            teamName: { $first: "$teamName" },
            teamCode: { $first: "$teamCode" },
        };
    }
}
function getSeasonProjections(projectFields, valueKey, resultcolumn) {
    try {
        if (projectFields) {
            let project = {};
            let finalProjections = {};
            project = {
                _id: 0,
                "Name": "$_id.name",
                "Class": "$_id.playerClass",
                "GP": "$count",
                "Season": "$_id.season",
                "TeamCode": "$teamCode",
                "Team": "$teamName",
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
            return {
                _id: 0,
                "Name": "$_id.name",
                "Class": "$_id.playerClass",
                "GP": "$count",
                "Season": "$_id.season",
                "TeamCode": "$teamCode",
                "Team": "$teamName",
                [resultcolumn]: "$stat",
            };
        }
    }
    catch (e) {
        console.log(e);
        return {};
    }
}
function getCareerGroup(projectFields, valueKey) {
    if (projectFields) {
        let project = {};
        let finalProjections = {};
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
        };
    }
}
function getCareerProjections(projectFields, valueKey, resultcolumn) {
    if (projectFields) {
        let project = {};
        let finalProjections = {};
        project = {
            _id: 0,
            Name: "$_id.name",
            "GP": "$count",
            "TeamCode": "$teamCode",
            Team: "$teamName",
            Season: { $cond: [{ $eq: ["$seasonMin", "$seasonMax"] }, "$seasonMin", { $concat: [{ $substr: ["$seasonMin", 0, 4] }, " - ", { $substr: ["$seasonMax", 0, 4] }] }] },
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
        return {
            _id: 0,
            Name: "$_id.name",
            "GP": "$count",
            "TeamCode": "$teamCode",
            Team: "$teamName",
            Season: { $cond: [{ $eq: ["$seasonMin", "$seasonMax"] }, "$seasonMin", { $concat: [{ $substr: ["$seasonMin", 0, 4] }, " - ", { $substr: ["$seasonMax", 0, 4] }] }] },
            [resultcolumn]: "$stat",
        };
    }
}
//VAF Code
queryFootBallPlayerRoute.get("/timebucket/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId/:entity/:statPeriod", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const stat = req.query.statistics;
    const projections = req.query.projections ? JSON.parse(req.query.projections) : "";
    const cat = req.params.stat_category;
    const value = Number(req.params.val);
    const ineq = req.params.ineq;
    const aggIneq = "$" + ineq;
    const team = Number(req.params.team);
    const opponent = Number(req.params.opponent);
    const sportCode = req.params.sportCode;
    const teamConference = req.params.teamConference;
    const teamDivision = req.params.teamDivision;
    const oppConference = req.params.oppConference;
    const oppDivision = req.params.oppDivision;
    const nightGame = req.params.nightGame;
    const resultcolumn = req.params.resultcolumn;
    const valueKey = projections ? JSON.parse(req.query.statistics) : "totals." + cat + "." + stat;
    const statPeriod = req.params.statPeriod;
    const entity = req.params.entity;
    let pipeline = [];
    let match = [
        { sportCode: { $eq: sportCode } }, { entity: { $eq: entity } }, { statPeriod: { $eq: statPeriod } }
    ];
    let andCondition = [];
    if (team) {
        match.push({ teamCode: { $eq: team } });
    }
    else {
        let teamConf = getTimeBucketTeamConferenceMatch(teamConference, teamDivision);
        match = [...match, ...teamConf];
    }
    if (opponent) {
        match.push({ "gameDetails.opponentTeamCode": { "$eq": opponent } });
        andCondition.push({ "gameDetails.opponentTeamCode": { "$eq": opponent } });
    }
    else {
        let opponentConf = getTimeBucketOpponentConferenceMatch(oppConference, oppDivision);
        if (opponentConf.length > 0) {
            match = [...match, ...opponentConf];
            andCondition = [...andCondition, ...opponentConf];
        }
    }
    match.push({ name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } });
    pipeline = [
        {
            $match: {
                "$and": match
            },
        },
    ];
    if (andCondition.length > 0) {
        pipeline.push({
            $match: {
                "$and": andCondition
            },
        });
    }
    if (req.params.location == "All" && req.params.gameType == "All" && nightGame == "All") {
        pipeline.push({
            $project: getTimeBucketProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, req.params.entity, req.params.statPeriod),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    else {
        let gameLocation = getTimeBucketGameLocationLookUp(req.params.location, opponent, team, req.params.gameType, nightGame);
        pipeline.push(gameLocation, {
            $project: getTimeBucketProjections(projections, valueKey, resultcolumn, req.params.gameType, req.params.teamId, req.params.entity, req.params.statPeriod),
        }, { $match: { [resultcolumn]: { [aggIneq]: value } } }, { $sort: { [resultcolumn]: -1, "gameDate": -1 } }, { $limit: 200 });
    }
    console.log(JSON.stringify(pipeline));
    try {
        const playerStats = yield db.collection("IntermediateData").aggregate(pipeline).toArray();
        res.status(200).json({
            data: playerStats,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player query retrieval",
                    message: err.message,
                }],
        });
    }
}));
function getTimeBucketProjections(projectFields, valueKey, resultcolumn, gameType, teamId, entity, statPeriod) {
    let project = {};
    if (projectFields) {
        let finalProjections = {};
        switch (entity) {
            case "Player":
                project = {
                    _id: 0,
                    Name: "$playerName",
                    Class: "$playerClass",
                    POS: "$playerPos",
                    Date: "$gameDetails.gameDate",
                    Season: "$gameDetails.season",
                    TeamCode: "$teamCode",
                    Team: "$teamName",
                    OPP: "$gameDetails.opponentTeamName",
                    OpponentCode: "$gameDetails.opponentTeamCode",
                };
                break;
            case "Team":
                project = {
                    _id: 0,
                    Team: "$teamName",
                    TeamCode: "$teamCode",
                    OPP: "$gameDetails.opponentTeamName",
                    OpponentCode: "$gameDetails.opponentTeamCode",
                    Date: "$gameDetails.gameDate",
                    Season: "$gameDetails.season",
                };
                break;
            default:
                break;
        }
        switch (statPeriod) {
            case "drive":
                project["Dr"] = "$periodDetails.drive";
                project["Qtr"] = "$periodDetails.quarter";
                break;
            case "quarter   ":
                project["Qtr"] = "$periodDetails.quarter";
                project["Half"] = "$periodDetails.half";
                break;
            case "half":
                project["Half"] = "$periodDetails.half";
                break;
            default:
                break;
        }
        if (gameType !== "All" && gameType !== "Regular Season") {
            project["Game Type"] = "$gameDetails.gameType";
        }
        let projectionKeys = {};
        Object.keys(projectFields).forEach(function (key) {
            projectionKeys[key] = { "$ifNull": [projectFields[key], 0] };
        });
        finalProjections = Object.assign({}, project, projectionKeys);
        finalProjections["Res"] = "$gameDetails.gameResult";
        finalProjections[resultcolumn] = valueKey;
        return finalProjections;
    }
    else {
        switch (entity) {
            case "Player":
                project = {
                    _id: 0,
                    Name: "$playerName",
                    Class: "$playerClass",
                    POS: "$playerPos",
                    Date: "$gameDetails.gameDate",
                    Season: "$gameDetails.season",
                    TeamCode: "$teamCode",
                    Team: "$teamName",
                    OPP: "$gameDetails.opponentTeamName",
                    OpponentCode: "$gameDetails.opponentTeamCode",
                };
                break;
            case "Team":
                project = {
                    _id: 0,
                    Team: "$teamName",
                    TeamCode: "$teamCode",
                    OPP: "$gameDetails.opponentTeamName",
                    OpponentCode: "$gameDetails.opponentTeamCode",
                    Date: "$gameDetails.gameDate",
                    Season: "$gameDetails.season",
                };
                break;
            default:
                break;
        }
        switch (statPeriod) {
            case "drive":
                project["Dr"] = "$periodDetails.drive";
                project["Qtr"] = "$periodDetails.quarter";
                break;
            case "quarter":
                project["Qtr"] = "$periodDetails.quarter";
                project["Half"] = "$periodDetails.half";
                break;
            case "half":
                project["Half"] = "$periodDetails.half";
                break;
            default:
                break;
        }
        if (gameType !== "All" && gameType !== "Regular Season") {
            project["Game Type"] = "$gameDetails.gameType";
        }
        project["Res"] = "$gameDetails.gameResult";
        project[resultcolumn] = valueKey.endsWith("Long") ? { $max: "$" + valueKey } : "$" + valueKey;
        return project;
    }
}
function getTimeBucketTeamConferenceMatch(teamConference, teamConferenceDivision) {
    let conferenceMatch = [];
    if (teamConferenceDivision !== "NA" && teamConference !== "NA") {
        conferenceMatch = [
            { "gameDetails.teamConf": teamConference },
            { "gameDetails.teamConfDivision": teamConferenceDivision }
        ];
    }
    else if (teamConferenceDivision == "NA" && teamConference !== "NA") {
        conferenceMatch = [
            { "gameDetails.teamConf": teamConference }
        ];
    }
    return conferenceMatch;
}
function getTimeBucketOpponentConferenceMatch(oppConference, oppDivision) {
    let conferenceMatch = [];
    if (oppDivision !== "NA" && oppConference !== "NA") {
        conferenceMatch = [
            { "gameDetails.opponenentTeamConf": oppConference },
            { "gameDetails.opponentTeamConfDivision": oppDivision }
        ];
    }
    else if (oppDivision == "NA" && oppConference !== "NA") {
        conferenceMatch = [
            { "gameDetails.opponenentTeamConf": oppConference }
        ];
    }
    return conferenceMatch;
}
function getTimeBucketGameLocationLookUp(location, opponent, team, gamesType, nightGame) {
    let nightGameMatch = {};
    if (nightGame === "Day")
        nightGameMatch = { "gameDetails.nightGame": false };
    if (nightGame === "Night")
        nightGameMatch = { "gameDetails.nightGame": true };
    let gameTypeMath = getTimeBucketGameTypeMatch(gamesType);
    let gameLocation = gameTypeMath;
    try {
        if (location == "All") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        nightGameMatch,
                    ]
                },
            };
        }
        else if (location == "Neutral" || location == "Away" || location == "Home") {
            gameLocation = {
                $match: {
                    "$and": [
                        gameTypeMath,
                        { "gameDetails.location": location },
                        nightGameMatch,
                    ]
                },
            };
        }
    }
    catch (err) {
        console.log(JSON.stringify(err));
    }
    return gameLocation;
}
function getTimeBucketGameTypeMatch(gamesType) {
    let gameTypeMath = {};
    if (gamesType === "Post Season") {
        gameTypeMath = {
            "$or": [
                { "gameDetails.gameType": gamesType },
                { "gameDetails.gameType": "Bowl" },
                { "gameDetails.gameType": "Conference Championship" },
                { "gameDetails.gameType": "CFP Semi-Final" },
                { "gameDetails.gameType": "CFP National Championship" },
            ]
        };
    }
    else if (gamesType === "Regular Season") {
        gameTypeMath = { "gameDetails.gameType": gamesType };
    }
    return gameTypeMath;
}
//# sourceMappingURL=queryPlayer.route.js.map