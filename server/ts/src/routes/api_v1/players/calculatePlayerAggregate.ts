/**
 * Helper for calculating player aggregate statistics in player ID and player name routes
 */

import { BaseAggregator } from "../../../lib/aggregator/BaseAggregator";
import { calculateAggregateStats } from "../../../lib/TeamPlayerStatAggregator";

import { ICommonStats } from "../../../../../../typings/athlyte/football/common-stats.d";
import { IPerGamePlayerStats, IPlayer } from "../../../../../../typings/athlyte/football/player.d";

/**
 * Calculate aggregate player statistics based on their game-by-game statistics
 * @param player Player retrieved from MongoDB
 */
export function calculatePlayerAgg(player: IPlayer) {
  const playerAggregate = {
    gamesPlayed: player.games.length,
    started: 0,
    name: player.name,
    tidyName: player.tidyName,
    teamName: player.teamName,
    teamId: player.teamId,
    stats: {} as ICommonStats,
  };
  for (const game of player.games as Array<IPerGamePlayerStats & { stats: ICommonStats & { [key: string]: any } }>) {
    if (game.started) {
      playerAggregate.started += 1;
    }
  }
  const playerAggregator = new BaseAggregator(player.games.map((singleGame: any) => singleGame.stats));
  playerAggregate.stats = playerAggregator.generateAggregates();
  return playerAggregate;
}
