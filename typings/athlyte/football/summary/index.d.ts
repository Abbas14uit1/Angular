import { IGame, IOfficialInfo } from "./game.d";
import { IPlayer, IPerGamePlayerStats } from "./player.d";
import { IAllTeams, ITeam } from "./team.d";
import { ISuperlative } from "../superlative.d";

export interface IStats {
  game: IGame;
  team: IAllTeams;
  homePlayers: IPlayer[];
  visitorPlayers: IPlayer[];
}

export { IGame, ITeam, IPlayer, ISuperlative, IPerGamePlayerStats };

/**
 * PlayerId is unique to a player and constant between games
 */
export type PlayerId = string;

export interface IFieldPosition {
  side: VH;
  yardline: number;
  endzone: boolean; // if play ended in an endzone, yardline is 0 and endzone is true
}

export declare enum VH {
  visitor = 0,
  home = 1,
}
