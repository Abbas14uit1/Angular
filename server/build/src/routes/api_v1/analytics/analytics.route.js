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
const analyticsRoute = express_1.Router();
exports.analyticsRoute = analyticsRoute;
analyticsRoute.get("/records/:sportCode/:teamCode/:entity/:timeBucket", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const pipeline = {
        $and: [
            { "$or": [{ teamCode: req.params.teamCode }, { teamCode: teamCode }] },
            { sportCode: req.params.sportCode },
            { statCategory: req.query.category },
            { entity: req.params.entity },
            { statPeriod: req.params.timeBucket },
            { statistic: req.query.statistic },
            { playerName: { $nin: ["TEAM", "TM", "Team", "Tm", "team", "tm"] } },
            { statValue: { $gt: 0 } },
            { analyticType: "Records" },
        ],
    };
    try {
        console.log(JSON.stringify(pipeline));
        const records = yield db
            .collection("analytics")
            .find(pipeline)
            .sort({ statValue: -1 })
            .limit(100)
            .toArray();
        res.status(200).json({
            data: records,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during records query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
analyticsRoute.get("/streaks/:sportCode/:teamCode/:entity/:timeBucket", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const match = [
        //{ teamCode: "8" },
        { "$or": [{ teamCode: req.params.teamCode }, { teamCode: teamCode }] },
        { sportCode: req.params.sportCode },
        { entity: req.params.entity },
        { statPeriod: req.params.timeBucket },
        { analyticType: "Streaks" },
        { currentStreakTotalLength: { $gt: 1 } }
    ];
    if (req.query.statQualifierValue !== "") {
        match.push({ statQualifierValue: Number(req.query.statQualifierValue) });
    }
    if (req.query.statQualifier !== "") {
        match.push({ statQualifier: req.query.statQualifier });
    }
    if (req.query.category !== "") {
        match.push({ statCategory: req.query.category });
    }
    if (req.query.statistic !== "") {
        match.push({ statistic: req.query.statistic });
    }
    const pipeline = {
        $and: match,
    };
    try {
        console.log(JSON.stringify(pipeline));
        const streaks = yield db
            .collection("analytics")
            .find(pipeline)
            .sort({ currentStreakTotalLength: -1 })
            .toArray();
        res.status(200).json({
            data: streaks,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during streaks query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
analyticsRoute.get("/streaksStats/:sportCode/:teamCode/:entity/:timeBucket", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const pipeline = [
        {
            $match: {
                $and: [
                    //{ teamCode: "8" },
                    { "$or": [{ teamCode: req.params.teamCode }, { teamCode: teamCode }] },
                    { sportCode: req.params.sportCode },
                    { entity: req.params.entity },
                    { statPeriod: req.params.timeBucket },
                    { analyticType: "Streaks" },
                ],
            },
        },
        {
            "$group": {
                "_id": "$statCategory",
                "statsdata": {
                    "$addToSet": {
                        "statCategory": "$statCategory",
                        "statistic": "$statistic",
                        "statQualifiers": "$statQualifier",
                        "statQualifierValue": "$statQualifierValue"
                    }
                }
            }
        },
        { $sort: { "_id": 1 } }
    ];
    try {
        console.log(JSON.stringify(pipeline));
        const streaksStats = yield db
            .collection("analytics")
            .aggregate(pipeline)
            .toArray();
        res.status(200).json({
            data: streaksStats,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during streaksStats query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
//# sourceMappingURL=analytics.route.js.map