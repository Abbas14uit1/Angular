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
const dashboardRoutes = express_1.Router();
exports.dashboardRoutes = dashboardRoutes;
dashboardRoutes.get("/opos", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    try {
        const players = yield db.collection("players").aggregate([
            { $unwind: "$games" },
            {
                $group: {
                    _id: "$games.pos.opos",
                },
            },
        ]).toArray();
        res.status(200).json({
            data: players,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [{
                    code: "MongoRetrievalError",
                    title: "Error occured while fetching data from Mongo",
                    message: err.message,
                }],
        });
        return;
    }
}));
dashboardRoutes.get("/dpos", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    try {
        const players = yield db.collection("players").aggregate([
            { $unwind: "$games" },
            {
                $group: {
                    _id: "$games.pos.dpos",
                },
            },
        ]).toArray();
        res.status(200).json({
            data: players,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [{
                    code: "MongoRetrievalError",
                    title: "Error occured while fetching data from Mongo",
                    message: err.message,
                }],
        });
        return;
    }
}));
dashboardRoutes.get("/:sportCode/seasons/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const seasonNumber = Number(req.params.year);
    const pipeline = [
        {
            $match: {
                $or: [
                    { "teamIds.home": req.params.teamId },
                    { "teamIds.visitor": req.params.teamId },
                ],
                $and: [
                    { "sportCode": req.params.sportCode },
                ]
            },
        },
        {
            $group: {
                _id: { season: "$season" },
            },
        },
        {
            $sort: {
                "_id.season": -1,
            },
        },
        {
            $project: {
                season: "$_id.season",
                _id: 0,
            },
        },
    ];
    try {
        const seasons = yield db.collection("games").aggregate(pipeline).toArray();
        res.status(200).json({
            data: seasons,
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
// api_v1/dashboard/team/:teamCode
// Get a teamId and tidyName from a teamCode
dashboardRoutes.get("/:sportCode/team/:teamCode", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = [
        {
            $match: {
                $and: [
                    { code: Number(req.params.teamCode) },
                ],
            },
        },
        {
            $project: {
                _id: "$_id",
                tidyName: "$tidyName",
                name: "$name",
            },
        },
    ];
    try {
        const team = yield db.collection("teams").aggregate(pipeline).toArray();
        res.status(200).json({
            data: team,
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
dashboardRoutes.get("/:sportCode/season/:year/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const seasonNumber = Number(req.params.year);
    const pipeline = [
        {
            $match: {
                $and: [
                    { season: seasonNumber },
                    {
                        $or: [
                            { "teamIds.home": req.params.teamId },
                            { "teamIds.visitor": req.params.teamId },
                        ],
                        $and: [
                            { "sportCode": req.params.sportCode },
                        ],
                    },
                ],
            },
        },
        {
            $project: {
                date: "$gameDate",
                actualDate: "$actualDate",
                opponentTidyName: {
                    $cond: {
                        if: {
                            $eq: ["$teamIds.home", req.params.teamId],
                        }, then: "$team.visitor.id", else: "$team.home.id",
                    },
                },
                opponentCode: {
                    $cond: {
                        if: {
                            $eq: ["$teamIds.home", req.params.teamId],
                        }, then: "$team.visitor.code", else: "$team.home.code",
                    },
                },
                teamScore: {
                    $cond: {
                        if: {
                            $eq: ["$teamIds.home", req.params.teamId],
                        }, then: "$team.home.score", else: "$team.visitor.score",
                    },
                },
                opponentScore: {
                    $cond: {
                        if: {
                            $eq: ["$teamIds.home", req.params.teamId],
                        }, then: "$team.visitor.score", else: "$team.home.score",
                    },
                },
                isHome: {
                    $cond: {
                        if: {
                            $eq: ["$teamIds.home", req.params.teamId],
                        }, then: true, else: false,
                    },
                },
            },
        },
    ];
    try {
        const season = yield db.collection("games").aggregate(pipeline).toArray();
        res.status(200).json({
            data: season,
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
dashboardRoutes.get("/:sportCode/roster/:year/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const seasonNumber = Number(req.params.year);
    const playerTeamId = req.params.teamId;
    let position = req.params.sportCode == "MFB"
        ? { $first: { $cond: [{ $ne: ["$games.pos.opos", null] }, "$games.pos.opos", "$games.pos.dpos"] } }
        : (req.params.sportCode == "MBB" || req.params.sportCode == "WBB") ? { $first: "$games.pos.pos" } : { $first: "$games.pos" };
    const pipeline = [
        { $match: {
                "$and": [
                    { "sportCode": req.params.sportCode },
                    { teamId: playerTeamId },
                    { name: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } },
                ]
            } },
        { $unwind: "$games" },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    name: "$name",
                    season: "$games.season",
                },
                class: { $first: "$games.playerClass" },
                uniform: { $first: "$games.uniform" },
                position: position,
            },
        },
        {
            $match: {
                "_id.season": seasonNumber,
            },
        },
        {
            $project: {
                _id: "$_id._id",
                name: "$_id.name",
                class: "$class",
                uniform: "$uniform",
                position: "$position",
            },
        },
        { $sort: { name: 1 } },
    ];
    try {
        const roster = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: roster,
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
//# sourceMappingURL=dashboard.route.js.map