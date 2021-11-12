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
const teamNameRoute = express_1.Router();
exports.teamNameRoute = teamNameRoute;
/**
 * Get a specific team by name, optionally filtering by season
 */
teamNameRoute.get("/:teamName", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const season = req.query.season && Number.parseInt(req.query.season);
    if (req.query.season && !season) {
        // NaN considered falsy
        res.status(406).json({
            errors: [{
                    code: "DateError",
                    title: "The season request was malformed",
                }],
        });
    }
    else {
        if (season) {
            // specified season
            const team = yield db.collection("teams").aggregate([
                { $match: { tidyName: req.params.teamName } },
                {
                    $project: {
                        //games: filterGamesBySeason(season),
                        _id: 1,
                        name: 1,
                        tidyName: 1,
                        players: 1,
                    },
                },
            ]).toArray();
            res.status(200).json({
                // team[0] because aggregation returns array (despite us only requesting the one team)
                data: team[0],
            });
        }
        else {
            const team = yield db.collection("teams").findOne({ tidyName: req.params.teamName });
            res.status(200).json({
                data: team,
            });
        }
    }
}));
/**
 * Get the team code for a given team id
 */
teamNameRoute.get("/teamcode/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = [
        { $match: { _id: req.params.id } },
        {
            $project: {
                code: 1,
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
//# sourceMappingURL=teamName.route.js.map