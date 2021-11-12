"use strict";
/**
 * Helper for calculating player aggregate statistics in player ID and player name routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BaseAggregator_1 = require("../../../lib/aggregator/BaseAggregator");
/**
 * Calculate aggregate player statistics based on their game-by-game statistics
 * @param player Player retrieved from MongoDB
 */
function calculatePlayerAgg(player) {
    const playerAggregate = {
        gamesPlayed: player.games.length,
        started: 0,
        name: player.name,
        tidyName: player.tidyName,
        teamName: player.teamName,
        teamId: player.teamId,
        stats: {},
    };
    for (const game of player.games) {
        if (game.started) {
            playerAggregate.started += 1;
        }
    }
    const playerAggregator = new BaseAggregator_1.BaseAggregator(player.games.map((singleGame) => singleGame.stats));
    playerAggregate.stats = playerAggregator.generateAggregates();
    return playerAggregate;
}
exports.calculatePlayerAgg = calculatePlayerAgg;
//# sourceMappingURL=calculatePlayerAggregate.js.map