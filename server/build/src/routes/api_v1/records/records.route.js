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
const recordRoutes = express_1.Router();
exports.recordRoutes = recordRoutes;
recordRoutes.get("/:sportCode/:teamId/", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const db = req.app.locals.db;
        const teamId = String(req.params.teamId);
        const recordTitle = req.query.recordTitle;
        let pipeline = [];
        pipeline = [
            {
                $match: {
                    $and: [
                        { teamCode: teamId },
                        { sportCode: req.params.sportCode },
                        { recordTitle: recordTitle },
                    ],
                },
            },
            {
                $project: {
                    recordTitle: "$recordTitle",
                    results: "$historyRecords",
                    headers: "$headers",
                    footers: "$footers",
                    teamName: "$teamName",
                    sortField: {
                        $setDifference: [
                            {
                                $map: {
                                    input: "$headers",
                                    as: "hdrs",
                                    in: { $cond: [{ $ne: ["$$hdrs", ""] }, "$$hdrs", false] },
                                },
                            },
                            [false],
                        ],
                    },
                },
            },
            {
                $match: {
                    results: { $ne: [] },
                },
            },
            { $sort: { sortField: 1 } },
        ];
        const records = yield db
            .collection("recordBook")
            .aggregate(pipeline)
            .toArray();
        res.status(200).json({
            data: records,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during record query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
recordRoutes.get("/recordTitles/:sportCode/:teamId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const db = req.app.locals.db;
        const teamId = String(req.params.teamId);
        const records = yield db
            .collection("recordBook")
            .distinct("recordTitle", {
            $and: [
                { teamCode: teamId },
                { sportCode: req.params.sportCode },
                { status: "Active" },
            ],
        });
        res.status(200).json({
            data: records,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during record title query retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
//# sourceMappingURL=records.route.js.map