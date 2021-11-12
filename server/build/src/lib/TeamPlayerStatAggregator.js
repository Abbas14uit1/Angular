"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculateAggregateStats(stats) {
    const aggregateStats = {};
    for (const individualGameStats of stats) {
        for (const statGroupingName in individualGameStats) {
            /* istanbul ignore else */
            if (individualGameStats.hasOwnProperty(statGroupingName)) {
                const statGrouping = individualGameStats[statGroupingName];
                /* istanbul ignore if */
                if (typeof statGrouping !== typeof {}) {
                    aggregateStats[statGrouping] =
                        (aggregateStats[statGrouping] || (aggregateStats[statGrouping] = 0)) + statGrouping;
                }
                else {
                    for (const statName in statGrouping) {
                        /* istanbul ignore else */
                        if (statGrouping.hasOwnProperty(statName)) {
                            const val = statGrouping[statName];
                            aggregateStats[statGroupingName] = aggregateStats[statGroupingName] || {};
                            aggregateStats[statGroupingName][statName] = (aggregateStats[statGroupingName][statName] ||
                                (aggregateStats[statGroupingName][statName] = 0)) + val;
                        }
                    }
                }
            }
        }
    }
    return aggregateStats;
}
exports.calculateAggregateStats = calculateAggregateStats;
//# sourceMappingURL=TeamPlayerStatAggregator.js.map