import { ICommonStats } from "./common-stats";
import { PlayerId, VH } from "./index.d";

export interface IPlayer extends IPlayerStaticData, IPlayerDynamicData { }

export interface IPlayerDynamicData {
  games: IPerGamePlayerStats[]; // will be pushed onto array in Mongo
}

export interface IPlayerStaticData {
  _id?: string; // mongo ID
  name: string;
  tidyName: string;
  teamName: string;
  teamId?: string; // mongo ID of player's team
}

export interface IPerGamePlayerStats {
  gameId?: string;
  season: number;
  playerClass: string;
  uniform: string;
  pos: {
    opos?: string;
    dpos?: string;
  };
  started: boolean;
  side: VH;
  codeInGame: string;
  stats: ICommonStats;
  gameDate: Date;
  actualDate: string;
  superlatives?: string[];
}
