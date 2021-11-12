import { ICommonStats } from './common-stats';
import { PlayerId, VH } from './index.d';

export interface IPlayer extends IPlayerStaticData, IPlayerDynamicData { }

export interface IPlayerDynamicData {
  games: IPerGamePlayerStats[]; // will be pushed onto array in Mongo
}

export interface IPlayerStaticData {
  _id?: string; // Mongo ID
  name: string;
  sportCode: string;
  teamCode: number;
  tidyName: string;
  teamConference: string;
  teamConferenceDivision: string;
  teamTidyName: string;
  playerId?: string;
  teamName: string;
  teamId?: string; // Mongo ID of player's team
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
  opponentCode: number;
  opponentName: string;
  opponentConference: string;
  opponentConferenceDivision: string,
  codeInGame: string;
  plays: string[]; // array of mongo IDs for plays
  stats: ICommonStats;
  gameDate: Date;
  actualDate: string;
  superlatives?: string[];
}
