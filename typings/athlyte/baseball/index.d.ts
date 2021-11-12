import { IGame } from "./game.d";
import { IPlay } from "./play.d";
import { IPlayer, IPerGamePlayerStats } from "./player.d";
import { IAllTeams, ITeam } from "./team.d";


export interface IStats {
  game: IGame;
  team: IAllTeams;
  teamGames: IAllTeams;
  homePlayers: IPlayer[];
  visitorPlayers: IPlayer[];
  plays: IPlay[];
}

export { IGame, ITeam, IPlayer, IPlay, IPerGamePlayerStats };

/**
 * PlayerId is unique to a player and constant between games
 */
export type PlayerId = string;

export declare enum VH {
  visitor = 0,
  home = 1,
}
