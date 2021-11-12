import { Router } from "express";
import * as moment from "moment";
import * as mongo from "mongodb";
import * as bcrypt from "bcryptjs";
import { json } from "body-parser";
const storiesRoute: Router = Router();
storiesRoute.get(
  "/:sportCode/:teamCode/:entity/:gameDate/:opponentCode",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    const pipeline: any = {
      teamCode: req.params.teamCode,
      sportCode: req.params.sportCode,
      entity: req.params.entity,
      "gameDetails.opponentCode": req.params.opponentCode,
      "gameDetails.gameDate": new Date(req.params.gameDate),
    };
    try {
      console.log(JSON.stringify(pipeline));
      const stories = await db
        .collection("stories")
        .find(pipeline)
        .sort({ storyScore: -1 })
        .toArray();
      res.status(200).json({
        data: stories,
      });
    } catch (err) {
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
  }
);
storiesRoute.get(
  "/:sportCode/latest/:teamCode/:season",
  async (req, res, next) => {
    const db: mongo.Db = req.app.locals.db;
    try {
      let today = new Date();
      let todayStr = moment(today).startOf("day").format("YYYY-MM-DD");
      let todayStrGS = moment(today).startOf("day").format("MM/DD/YYYY");
      let storiesResults: any[] = [];
      let playingTodayResults = await isGamePlayingToday(
        db,
        todayStrGS,
        req.params.teamCode,
        req.params.sportCode
      );
      if (!playingTodayResults) {
        storiesResults = await getStoriesResults(
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
          storiesResults = await getStoriesResults(
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
          storiesResults = await getStoriesResults(
            db,
            previousDate,
            req.params.teamCode,
            req.params.sportCode,
            Number(req.params.season)
          );
        }
      }
      return res.status(200).json({
        data: storiesResults,
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
let getStoriesResults = async function (
  db: mongo.Db,
  todayStr: string,
  teamCode: string,
  sportCode: string,
  season: number
) {
  let storiesResults: any[] = [];

  storiesResults = await db
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
};

export { storiesRoute };
