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
const filterByDateQuery_1 = require("../../../lib/filterByDateQuery");
const calculatePlayerAggregate_1 = require("./calculatePlayerAggregate");
const playerNameRoute = express_1.Router();
exports.playerNameRoute = playerNameRoute;
/**
 * Get a player by name, optionally a player's stats to a certain season
 */
playerNameRoute.get("/:sportCode/:tidyName", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const season = req.query.season ? Number.parseInt(req.query.season) : undefined;
    if (req.query.season && isNaN(season)) {
        res.status(406).json({
            errors: [{
                    code: "DateError",
                    title: "The season request was malformed",
                }],
        });
    }
    else if (req.query.season && season) {
        // season was specified, so limit to a particular season (among all players)
        // Note: tidyName is expected to ALWAYS BE UNIQUE
        const players = yield db.collection("players").aggregate([
            { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
            {
                $project: {
                    games: filterByDateQuery_1.filterGamesBySeason(season),
                    _id: 1,
                    name: 1,
                    tidyName: 1,
                    teamName: 1,
                    teamId: 1,
                },
            },
        ]).toArray();
        res.status(200).json({
            data: players[0],
        });
    }
    else {
        const players = yield db.collection("players").findOne({ tidyName: req.params.tidyName, sportCode: req.params.sportCode });
        res.status(200).json({
            data: players,
        });
    }
}));
/**
 * Get aggregate stats for a player (by name),
 * optionally restricting stats to within a range of dates
 * using `from` and `to` queries.
 * Dates should be in ISO8601 ormat (YYYY-MM-DD).
 * If `to` is blank, defaults to current date.
 * If `from` is blank, defaults to earliest record.
 * If both are blank, returns lifetime stats.
 * Alternatively, can specify a season to get stats from that season.
 * Ex: /HURTS,JALEN/aggregate?from=2016-01-01&to=2016-05-31
 * Ex: /HURTS,JALEN/aggregate?season=2016
 */
playerNameRoute.get("/:sportCode/:tidyName/aggregate", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const from = req.query.from ? moment(req.query.from, "YYYY-MM-DD").toDate() : undefined;
    const to = req.query.to ? moment(req.query.to, "YYYY-MM-DD").toDate() : undefined;
    const season = req.query.season ? Number.parseInt(req.query.season) : undefined;
    let player;
    // get relevant data
    try {
        if (from && to && season) {
            res.status(406).json({
                errors: [{
                        code: "DateError",
                        title: "Too many parameters",
                        message: "Too many parameters were supplied; should supply either (from AND to) OR season",
                    }],
            });
            return;
        }
        else if (season !== undefined) {
            const players = yield db.collection("players").aggregate([
                { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
                {
                    $project: {
                        games: filterByDateQuery_1.filterGamesBySeason(season),
                        _id: 1,
                        name: 1,
                        tidyName: 1,
                        teamName: 1,
                        teamId: 1,
                    },
                },
            ]).toArray();
            player = players[0];
        }
        else {
            // if season not specified, use from and to (if they're undefined, filterGamesByDate goes from 1000AD to 3000AD)
            const players = yield db.collection("players").aggregate([
                { $match: { tidyName: req.params.tidyName, sportCode: req.params.sportCode } },
                {
                    $project: {
                        games: filterByDateQuery_1.filterGamesByRange(from, to),
                        _id: 1,
                        name: 1,
                        tidyName: 1,
                        teamName: 1,
                        teamId: 1,
                    },
                },
            ]).toArray();
            player = players[0];
        }
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "MongoRetrievalError",
                    title: "Error occured while fetching data from Mongo",
                    message: err.message,
                }],
        });
        /* istanbul ignore next */
        return;
    }
    try {
        if (!player) {
            res.status(404).json({
                errors: [{
                        code: "NoDataError",
                        title: "Data for the requested player was not found",
                        message: `Aggregation is not possible since no data was found for ${req.params.tidyName}`,
                    }],
            });
            return;
        }
        const playerAggregate = calculatePlayerAggregate_1.calculatePlayerAgg(player);
        res.status(200).json({
            data: playerAggregate,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during player data aggregation",
                    message: err.message,
                }],
        });
    }
}));
//# sourceMappingURL=tidyName.route.js.map