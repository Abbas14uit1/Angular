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
  teamTidyName: string;
  teamName: string;
  teamId?: string; // Mongo ID of player's team
  playerId: string;
  teamConference: string;
  teamConferenceDivision: string;
}

export interface IPerGamePlayerStats {
  gameId?: string;
  season: number;
  playerClass: string;
  uniform: string;
  pos: {
    pos?: string; 
    gp?: number;
    gs?: number;   
  };
  started: boolean;
  side: VH;
  codeInGame: string;
  opponentCode: number;
  opponentName: string;
  opponentConference: string;
  opponentConferenceDivision: string;
  plays: string[]; // array of mongo IDs for plays
  stats?: ICommonStats;
  prdStats?: ICommonStats[];
  gameDate: Date;
  actualDate: string;
  superlatives?: string[];
}
