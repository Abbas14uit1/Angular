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
const moment = require("moment");
const storiesRoute = express_1.Router();
exports.storiesRoute = storiesRoute;
storiesRoute.get("/:sportCode/:teamCode/:entity/:gameDate/:opponentCode", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = {
        teamCode: req.params.teamCode,
        sportCode: req.params.sportCode,
        entity: req.params.entity,
        "gameDetails.opponentCode": req.params.opponentCode,
        "gameDetails.gameDate": new Date(req.params.gameDate),
    };
    try {
        console.log(JSON.stringify(pipeline));
        const stories = yield db
            .collection("stories")
            .find(pipeline)
            .sort({ storyScore: -1 })
            .toArray();
        res.status(200).json({
            data: stories,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during stories query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
storiesRoute.get("/:sportCode/latest/:teamCode/:season", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    try {
        let today = new Date();
        let todayStr = moment(today).startOf("day").format("YYYY-MM-DD");
        let todayStrGS = moment(today).startOf("day").format("MM/DD/YYYY");
        let storiesResults = [];
        let playingTodayResults = yield isGamePlayingToday(db, todayStrGS, req.params.teamCode, req.params.sportCode);
        if (!playingTodayResults) {
            storiesResults = yield getStoriesResults(db, todayStr, req.params.teamCode, req.params.sportCode, Number(req.params.season));
        }
        else {
            let gameResult = yield db.collection("games").findOne({
                $and: [
                    { sportCode: req.params.sportCode },
                    { season: Number(req.params.season) },
                    {
                        $or: [
                            { "team.home.code": Number(req.params.teamCode) },
                            { "team.visitor.code": Number(req.params.teamCode) },
                        ],
                    },
                    { actualDate: { $eq: todayStrGS } },
                ],
            });
            if (gameResult !== null) {
                storiesResults = yield getStoriesResults(db, todayStr, req.params.teamCode, req.params.sportCode, Number(req.params.season));
            }
            else {
                let previousDate = moment(today)
                    .startOf("day")
                    .subtract(1, "days")
                    .format("YYYY-MM-DD");
                storiesResults = yield getStoriesResults(db, previousDate, req.params.teamCode, req.params.sportCode, Number(req.params.season));
            }
        }
        return res.status(200).json({
            data: storiesResults,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during team query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
let isGamePlayingToday = function (db, todayStr, teamCode, sportCode) {
    return __awaiter(this, void 0, void 0, function* () {
        let pipeline = {
            $and: [
                { teamCode: teamCode },
                { gameDate: todayStr },
                { sportCode: sportCode },
            ],
        };
        let result = yield db.collection("GameSchedules").findOne(pipeline);
        return result;
    });
};
let getStoriesResults = function (db, todayStr, teamCode, sportCode, season) {
    return __awaiter(this, void 0, void 0, function* () {
        let storiesResults = [];
        storiesResults = yield db
            .collection("GameSchedules")
            .aggregate([
            {
                $match: {
                    $and: [
                        { sportCode: sportCode },
                        { teamCode: teamCode },
                        { season: season },
                    ],
                },
            },
            {
                $project: {
                    oppoTeamCode: 1,
                    oppoTeamName: 1,
                    gameDate: { $dateFromString: { dateString: "$gameDate" } },
                },
            },
            { $match: { gameDate: { $gt: new Date(todayStr) } } },
            { $sort: { gameDate: 1 } },
            { $limit: 1 },
        ])
            .toArray();
        return storiesResults;
    });
};
//# sourceMappingURL=stories.route.js.map