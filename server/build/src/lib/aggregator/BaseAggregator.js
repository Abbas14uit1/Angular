"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
/**
 * This class is used to aggregate player and team statistics for the stats page
 * This probably can be deprecated by the new aggregation by the superlative engine
 * but going to keep it for now since it works
 */
class BaseAggregator {
    constructor(commonStats) {
        this.commonStats = commonStats;
    }
    /**
     * Generates the aggregates of player or team stats
     * returns an object of the same form as the incoming stats, but with the aggregates
     */
    generateAggregates() {
        const aggregateStats = {};
        // Goes through every game in the stats given to the aggregator
        for (const individualGameStats of this.commonStats) {
            /* istanbul ignore if */
            if (individualGameStats === null) {
                continue;
            }
            // Goes through each stat group, e.g. "rushing", "receiving"
            for (const statGroupingName of Object.getOwnPropertyNames(individualGameStats)) {
                const statGrouping = individualGameStats[statGroupingName];
                // skips the groups that are saved as undefined in the database
                if (statGrouping === null) {
                    continue;
                }
                // Goes through each stat and adds it to the aggregation
                for (const statName of Object.getOwnPropertyNames(statGrouping)) {
                    const val = statGrouping[statName];
                    // Establishes the group object if it hasn't been defined yet
                    aggregateStats[statGroupingName] = aggregateStats[statGroupingName] || {};
                    switch (statName) {
                        case "top":// Time of possesion: needs to aggregate time
                            const oldVal = aggregateStats[statGroupingName][statName] || moment("00:00:00", "hh:mm:ss");
                            aggregateStats[statGroupingName][statName] = moment(oldVal, "hh:mm:ss")
                                .add({ minutes: val.split(":")[0], seconds: val.split(":")[1] }).format("hh:mm:ss");
                            break;
                        case "rushLong":
                        case "passLong":
                        case "rcvLong":
                        case "fgLong":
                        case "krLong":
                        case "prLong":
                        case "irLong":
                        case "puntLong":// Looking for the max value for these statistics
                            aggregateStats[statGroupingName][statName] = aggregateStats[statGroupingName][statName] !== undefined &&
                                aggregateStats[statGroupingName][statName] > val ? aggregateStats[statGroupingName][statName] : val;
                            break;
                        default:// All else just need a sum, so just add the new value
                            aggregateStats[statGroupingName][statName] = (aggregateStats[statGroupingName][statName] ||
                                (aggregateStats[statGroupingName][statName] = 0)) + val;
                            break;
                    }
                }
            }
        }
        return aggregateStats;
    }
}
exports.BaseAggregator = BaseAggregator;
//# sourceMappingURL=BaseAggregator.js.map