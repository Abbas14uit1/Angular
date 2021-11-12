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
const ahocQueryRoute = express_1.Router();
exports.ahocQueryRoute = ahocQueryRoute;
ahocQueryRoute.get("/:sportCode", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    try {
        const ahocQueries = yield db
            .collection("advanceQueries")
            .find({ sportCode: req.params.sportCode })
            .toArray();
        res.status(200).json({
            data: ahocQueries,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during ahocQueries retrieval",
                    message: err.message,
                },
            ],
        });
    }
}));
ahocQueryRoute.get("/execQuery/:_id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const inputFields = JSON.parse(req.query.inputFields);
    try {
        const results = [
            {
                playerName: "STOERNER,CLINT",
                gameDate: "9/6/1997",
                Opponent: "La.-Monroe",
                Atts: "27",
                Comps: "13",
                Yards: "163",
                TDs: "0",
            },
            {
                playerName: "HAMPTON,ROBBY",
                gameDate: "9/4/1999",
                Opponent: "SMU",
                Atts: "2",
                Comps: "1",
                Yards: "12",
                TDs: "0",
            },
            {
                playerName: "ZAK,CLARK",
                gameDate: "9/2/2000",
                Opponent: "Missouri St.",
                Atts: "5",
                Comps: "2",
                Yards: "17",
                TDs: "0",
            },
            {
                playerName: "SORAHAN,RYAN",
                gameDate: "8/30/2001",
                Opponent: "UNLV",
                Atts: "16",
                Comps: "7",
                Yards: "62",
                TDs: "0",
            },
            {
                playerName: "JACKSON,TARVARIS",
                gameDate: "8/30/2001",
                Opponent: "UNLV",
                Atts: "1",
                Comps: "0",
                Yards: "0",
                TDs: "0",
            },
            {
                playerName: "JONES,MATT",
                gameDate: "10/27/2001",
                Opponent: "Auburn",
                Atts: "3",
                Comps: "1",
                Yards: "21",
                TDs: "1",
            },
            {
                playerName: "LOGGAINS,DOWELL",
                gameDate: "9/7/2002",
                Opponent: "Boise St.",
                Atts: "1",
                Comps: "1",
                Yards: "11",
                TDs: "0",
            },
            {
                playerName: "LASHLEE,RHETT",
                gameDate: "9/6/2003",
                Opponent: "Tulsa",
                Atts: "1",
                Comps: "0",
                Yards: "0",
                TDs: "0",
            },
            {
                playerName: "WASHINGTON,CEDRIC",
                gameDate: "12/31/2003",
                Opponent: "Missouri",
                Atts: "1",
                Comps: "0",
                Yards: "0",
                TDs: "0",
            },
            {
                playerName: "JOHNSON,RASHAAD",
                gameDate: "9/4/2004",
                Opponent: "New Mexico St.",
                Atts: "8",
                Comps: "5",
                Yards: "132",
                TDs: "2",
            },
            {
                playerName: "DICK,CASEY",
                gameDate: "11/5/2005",
                Opponent: "South Carolina",
                Atts: "24",
                Comps: "12",
                Yards: "137",
                TDs: "1",
            },
            {
                playerName: "MUSTAIN,MITCH",
                gameDate: "9/2/2006",
                Opponent: "Southern California",
                Atts: "6",
                Comps: "4",
                Yards: "47",
                TDs: "0",
            },
            {
                playerName: "WILSON,TYLER",
                gameDate: "9/20/2008",
                Opponent: "Alabama",
                Atts: "7",
                Comps: "4",
                Yards: "27",
                TDs: "1",
            },
            {
                playerName: "DICK,NATHAN",
                gameDate: "11/8/2008",
                Opponent: "South Carolina",
                Atts: "8",
                Comps: "4",
                Yards: "38",
                TDs: "0",
            },
            {
                playerName: "BUEHNER,BRIAN",
                gameDate: "11/2/2013",
                Opponent: "Auburn",
                Atts: "1",
                Comps: "1",
                Yards: "7",
                TDs: "0",
            },
            {
                playerName: "JONES,JOHN STEPHEN",
                gameDate: "9/15/2018",
                Opponent: "North Texas",
                Atts: "3",
                Comps: "0",
                Yards: "0",
                TDs: "0",
            },
            {
                playerName: "NOLAND,CONNOR",
                gameDate: "9/15/2018",
                Opponent: "North Texas",
                Atts: "7",
                Comps: "4",
                Yards: "25",
                TDs: "0",
            },
            {
                playerName: "JEFFERSON,K.J.",
                gameDate: "11/2/2019",
                Opponent: "Mississippi St.",
                Atts: "2",
                Comps: "1",
                Yards: "32",
                TDs: "0",
            },
        ];
        const adochQuery = yield db
            .collection("advanceQueries")
            .findOne({ queryId: req.params._id });
        let mongoQuery = JSON.stringify(adochQuery["mongoQuery"]);
        inputFields.forEach(function (field) {
            if (field["allowedStatsName"]) {
                let allowedParamName = new RegExp("\\$" + field["allowedStatsName"] + "\\$", "g");
                mongoQuery = mongoQuery.replace(allowedParamName, field["allowedStatsValue"]);
            }
            let paramName = new RegExp("\\$" + field["fieldName"] + "\\$", "g");
            mongoQuery = mongoQuery.replace(paramName, field["fieldValue"]);
        });
        mongoQuery = mongoQuery.replace(/#/g, "$");
        const dataResults = yield executeMongoQuery(JSON.parse(mongoQuery), adochQuery["quertType"], adochQuery["queryCollection"]);
        res.status(200).json({
            data: dataResults,
        });
    }
    catch (err) {
        res.status(500).json({
            errors: [
                {
                    code: "AggregationError",
                    title: "Error occured during ahocQueries retrieval",
                    message: err.message,
                },
            ],
        });
    }
    function executeMongoQuery(pipeline, queryType, collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = req.app.locals.db;
                console.log("pipeline>>>>>>" + JSON.stringify(pipeline));
                switch (queryType) {
                    case "aggregate": {
                        const results = yield db
                            .collection(collectionName)
                            .aggregate(pipeline);
                        console.log("results>>>>>>" + JSON.stringify(results));
                        return results;
                    }
                    default:
                        return [];
                }
            }
            catch (ex) {
                console.log(ex);
                return [];
            }
        });
    }
    // code to execute foreach logics
    function executeCustomCode(queryDescription, queryResultsData) {
        switch (queryDescription) {
        }
    }
}));
//# sourceMappingURL=adhocQuery.route.js.map