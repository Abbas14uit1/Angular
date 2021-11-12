"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * returns the mongo filter object necessary to filter games by a particular season
 * @param season the season number to filter by
 */
function filterGamesBySeason(season) {
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
exports.filterGamesBySeason = filterGamesBySeason;
/**
 * returns the mongo filter object necessary to filter games between two dates
 * @param from start date
 * @param to end date
 */
function filterGamesByRange(from, to) {
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
exports.filterGamesByRange = filterGamesByRange;
//# sourceMappingURL=filterByDateQuery.js.map