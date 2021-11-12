import * as express from "express";
import * as moment from "moment";

/**
 * returns the mongo filter object necessary to filter games by a particular season
 * @param season the season number to filter by
 */
export function filterGamesBySeason(season: number) {
  return ({
    $filter: {
      input: "$games",
      as: "game",
      cond: {
        $eq: ["$$game.season", season],
      },
    },
  });
}

/**
 * returns the mongo filter object necessary to filter games between two dates
 * @param from start date
 * @param to end date
 */
export function filterGamesByRange(from?: Date, to?: Date) {
  from = from || new Date(1000, 1, 1);
  to = to || new Date(3000, 1, 1);
  return ({
    $filter: {
      input: "$games",
      as: "game",
      cond: {
        $and: [
          { $gte: ["$$game.gameDate", from] },
          { $lte: ["$$game.gameDate", to] },
        ],
      },
    },
  });
}
