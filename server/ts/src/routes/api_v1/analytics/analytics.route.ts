import { Router } from "express";
import * as mongo from "mongodb";
import * as bcrypt from "bcryptjs";
const analyticsRoute: Router = Router();

analyticsRoute.get(
  "/records/:sportCode/:teamCode/:entity/:timeBucket",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const pipeline: any = {
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
      const records = await db
        .collection("analytics")
        .find(pipeline)
        .sort({ statValue: -1 })
        .limit(100)
        .toArray();
      res.status(200).json({
        data: records,
      });
    } catch (err) {
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
  }
);

analyticsRoute.get(
  "/streaks/:sportCode/:teamCode/:entity/:timeBucket",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const match: any[] = [
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
    const pipeline: any = {
      $and: match,
    };
    try {
      console.log(JSON.stringify(pipeline));
      const streaks = await db
        .collection("analytics")
        .find(pipeline)
        .sort({ currentStreakTotalLength: -1 })
        .toArray();
      res.status(200).json({
        data: streaks,
      });
    } catch (err) {
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
  }
);

analyticsRoute.get(
  "/streaksStats/:sportCode/:teamCode/:entity/:timeBucket",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    let teamCode = Number(req.params.teamCode);
    const pipeline: any = [
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
      const streaksStats = await db
        .collection("analytics")
        .aggregate(pipeline)
        .toArray();
      res.status(200).json({
        data: streaksStats,
      });
    } catch (err) {
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
  }
);
export { analyticsRoute };
