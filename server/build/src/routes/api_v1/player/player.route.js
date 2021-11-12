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
const footballPlayer_1 = require("./footballPlayer");
const basketballPlayer_1 = require("./basketballPlayer");
const baseballPlayer_1 = require("./baseballPlayer");
const soccerPlayer_1 = require("./soccerPlayer");
exports.playerRoutes = express_1.Router();
const footballPlayer = new footballPlayer_1.FootballPlayer();
const basketballPlayer = new basketballPlayer_1.BasketballPlayer();
const baseballPlayer = new baseballPlayer_1.BaseballPlayer();
const soccerPlayer = new soccerPlayer_1.SoccerPlayer();
exports.playerRoutes.get("/:sportCode/stats/career/:playerId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = getStatsCareerPipeline(req.params.sportCode, req.params.playerId);
    try {
        //console.log(JSON.stringify(pipeline));
        const player = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: req.params.sportCode === "MBB" || req.params.sportCode === "WBB" ? player : player[0],
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
exports.playerRoutes.get("/:sportCode/stats/season/:playerId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = getStatsSeasonPipeline(req.params.sportCode, req.params.playerId);
    try {
        //console.log(JSON.stringify(pipeline));
        const player = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: player,
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
exports.playerRoutes.get("/:sportCode/stats/game/:playerId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = getStatsGamePipeline(req.params.sportCode, req.params.playerId);
    try {
        //console.log(JSON.stringify(pipeline));
        const player = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: player,
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
exports.playerRoutes.get("/:sportCode/info/:playerId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = [
        {
            $match: {
                _id: req.params.playerId,
                sportCode: req.params.sportCode
            },
        },
        {
            $project: {
                _id: 1,
                tidyName: 1,
                name: 1,
                teamName: 1,
                teamTidyName: 1,
                teamId: 1,
                game: {
                    $arrayElemAt: ["$games", 0],
                },
            },
        },
        {
            $project: {
                _id: 1,
                tidyName: 1,
                name: 1,
                teamName: 1,
                teamTidyName: 1,
                teamId: 1,
                uniform: "$game.uniform",
            },
        },
    ];
    try {
        const player = yield db.collection("players").aggregate(pipeline).toArray();
        res.status(200).json({
            data: player,
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
function getStatsGamePipeline(sportCode, playerId) {
    switch (sportCode) {
        case "MFB":
            return footballPlayer.getStatsGamePipelineFootball(sportCode, playerId);
        case "MBA":
        case "WSB":
            return baseballPlayer.getStatsGamePipelineBaseball(sportCode, playerId);
        case "MBB":
        case "WBB":
            return basketballPlayer.getStatsGamePipelineBasketball(sportCode, playerId);
        case "MSO":
        case "WSO":
            return soccerPlayer.getStatsGamePipeline(sportCode, playerId);
        default:
            // code...
            break;
    }
}
function getStatsSeasonPipeline(sportCode, playerId) {
    switch (sportCode) {
        case "MFB":
            return footballPlayer.getStatsSeasonPipelineFootball(sportCode, playerId);
        case "MBA":
        case "WSB":
            return baseballPlayer.getStatsSeasonPipelineBaseball(sportCode, playerId);
        case "MBB":
        case "WBB":
            return basketballPlayer.getStatsSeasonPipelineBasketball(sportCode, playerId);
        case "MSO":
        case "WSO":
            return soccerPlayer.getStatsSeasonPipeline(sportCode, playerId);
        default:
            // code...
            break;
    }
}
function getStatsCareerPipeline(sportCode, playerId) {
    switch (sportCode) {
        case "MFB":
            return footballPlayer.getStatsCareerPipelineFootball(sportCode, playerId);
        case "MBA":
        case "WSB":
            return baseballPlayer.getStatsCareerPipelineBaseball(sportCode, playerId);
        case "MBB":
        case "WBB":
            return basketballPlayer.getStatsCareerPipelineBasketball(sportCode, playerId);
        case "MSO":
        case "WSO":
            return soccerPlayer.getStatsCareerPipeline(sportCode, playerId);
        default:
            // code...
            break;
    }
}
//# sourceMappingURL=player.route.js.map