import { Router } from "express";
import * as moment from "moment";
import * as mongo from "mongodb";
import * as bcrypt from "bcryptjs";
const alertsRoute: Router = Router();

alertsRoute.get(
  "/:sportCode/pregame/:teamCode/:category/:oppoTeamCode",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    const pipeline: any = {
      $and: [
        { teamCode: req.params.teamCode },
        { sportCode: req.params.sportCode },
        { alertType: "Pre" },
        { alertCategory: req.params.category },
        { "gameDetails.oppoTeamCode": req.params.oppoTeamCode },
      ],
    };
    const sortName =
      req.params.category == "Player" ? "playerName" : "teamName";
    try {
      console.log(JSON.stringify(pipeline));
      const games = await db
        .collection("GameSchedules")
        .find(pipeline)
        .sort({ [sortName]: 1 })
        .limit(50)
        .toArray();
      const alerts = await db
        .collection("alerts")
        .find(pipeline)
        .sort({ [sortName]: 1 })
        .limit(50)
        .toArray();
      res.status(200).json({
        data: alerts,
      });
    } catch (err) {
      res.status(500).json({
        errors: [
          {
            code: "AggregationError",
            title: "Error occured during player query retrieval",
            message: err.message,
          },
        ],
      });
    }
  }
);

alertsRoute.get(
  "/:sportCode/postgame/:teamCode/:oppoTeamCode/:season/:category",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    const sortName =
      req.params.category == "Player" ? "playerName" : "teamName";
    const pipeline: any = {
      $and: [
        { teamCode: req.params.teamCode },
        { sportCode: req.params.sportCode },
        { alertType: "Post" },
        { "gameDetails.oppoTeamCode": req.params.oppoTeamCode },
        { alertCreatedSeason: Number(req.params.season) },
        { alertCategory: req.params.category },
      ],
    };

    try {
      console.log(JSON.stringify(pipeline));
      const alerts = await db
        .collection("alerts")
        .find(pipeline)
        .sort({ [sortName]: 1 })
        .limit(50)
        .toArray();
      res.status(200).json({
        data: alerts,
      });
    } catch (err) {
      res.status(500).json({
        errors: [
          {
            code: "AggregationError",
            title: "Error occured during player query retrieval",
            message: err.message,
          },
        ],
      });
    }
  }
);

alertsRoute.get(
  "/:sportCode/:teamCode/:oppoTeamCode/:season/:category",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    const sortName =
      req.params.category === "Player" ? "playerName" : "teamName";
    const pipeline: any = {
      $and: [
        { teamCode: req.params.teamCode },
        { sportCode: req.params.sportCode },
        { "gameDetails.oppoTeamCode": req.params.oppoTeamCode },
        { alertCreatedSeason: Number(req.params.season) },
        { alertCategory: req.params.category },
      ],
    };
    try {
      console.log(JSON.stringify(pipeline));
      const alerts = await db
        .collection("alerts")
        .find(pipeline)
        .sort({ [sortName]: 1 })
        .limit(50)
        .toArray();
      res.status(200).json({
        data: alerts,
      });
    } catch (err) {
      res.status(500).json({
        errors: [
          {
            code: "AggregationError",
            title: "Error occured during player query retrieval",
            message: err.message,
          },
        ],
      });
    }
  }
);

alertsRoute.get("/:sportCode/:teamCode", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any = {
    teamCode: req.params.teamCode,
    sportCode: req.params.sportCode,
  };
  try {
    console.log(JSON.stringify(pipeline));
    const alerts = await db.collection("alerts").count(pipeline);
    res.status(200).json({
      data: alerts,
    });
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          code: "AggregationError",
          title: "Error occured during player query retrieval",
          message: err.message,
        },
      ],
    });
  }
});

alertsRoute.get("/:sportCode/seasons/:teamCode", async (req, res, next) => {
  console.log("Aplert Api>>>");
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any[] = [
    {
      $match: {
        $and: [
          { sportCode: req.params.sportCode },
          { teamCode: req.params.teamCode },
          { season: { $ne: null } },
        ],
      },
    },
    {
      $group: {
        _id: {
          season: "$season",
          oppoTeamCode: "$oppoTeamCode",
          oppoTeamName: "$oppoTeamName",
          gameDate: "$gameDate",
        },
      },
    },
    {
      $project: {
        season: "$_id.season",
        oppoTeamCode: "$_id.oppoTeamCode",
        oppoTeamName: "$_id.oppoTeamName",
        gameDate: { $dateFromString: { dateString: "$_id.gameDate" } },
        _id: 0,
      },
    },
    {
      $sort: {
        "gameDate": 1,
      },
    }
  ];
  try {
    const seasons = await db
      .collection("GameSchedules")
      .aggregate(pipeline)
      .toArray();
    res.status(200).json({
      data: seasons,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [
        {
          code: "AggregationError",
          title: "Error occured during GameSchedules query retrieval",
          message: err.message,
        },
      ],
    });
  }
});

alertsRoute.get(
  "/:sportCode/latest/:teamCode/:season",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    try {
      let today = new Date();
      let todayStr = moment(today).startOf("day").format("YYYY-MM-DD");
      let todayStrGS = moment(today).startOf("day").format("M/D/YYYY");
      let alertResults: any[] = [];
      let playingTodayResults = await isGamePlayingToday(
        db,
        todayStrGS,
        req.params.teamCode,
        req.params.sportCode
      );
      if (!playingTodayResults) {
        alertResults = await getAlertResults(
          db,
          todayStr,
          req.params.teamCode,
          req.params.sportCode,
          Number(req.params.season)
        );
      } else {
        let gameResult = await db.collection("games").findOne({
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
          alertResults = await getAlertResults(
            db,
            todayStr,
            req.params.teamCode,
            req.params.sportCode,
            Number(req.params.season)
          );
        } else {
          let previousDate = moment(today)
            .startOf("day")
            .subtract(1, "days")
            .format("YYYY-MM-DD");
          alertResults = await getAlertResults(
            db,
            previousDate,
            req.params.teamCode,
            req.params.sportCode,
            Number(req.params.season)
          );
        }
      }
      return res.status(200).json({
        data: alertResults,
      });
    } catch (err) {
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
  }
);
let isGamePlayingToday = async function (
  db: mongo.Db,
  todayStr: string,
  teamCode: string,
  sportCode: string
) {
  let pipeline: any = {
    $and: [
      { teamCode: teamCode },
      { gameDate: todayStr },
      { sportCode: sportCode },
    ],
  };
  let result = await db.collection("GameSchedules").findOne(pipeline);
  return result;
};
let getAlertResults = async function (
  db: mongo.Db,
  todayStr: string,
  teamCode: string,
  sportCode: string,
  season: number
) {
  let alertResults: any[] = [];

  let preAlerts = await db
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

  let postAlerts = await getPostAlerts(
    db,
    todayStr,
    teamCode,
    sportCode,
    season
  );
  alertResults = [...preAlerts, ...postAlerts];
  return alertResults;
};

let getPostAlerts = async function (
  db: mongo.Db,
  todayStr: string,
  teamCode: string,
  sportCode: string,
  season: number
) {
  let postAlerts = await db
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
      { $match: { gameDate: { $lte: new Date(todayStr) } } },
      { $sort: { gameDate: -1 } },
      { $limit: 1 },
    ])
    .toArray();
  return postAlerts;
};
export { alertsRoute };
