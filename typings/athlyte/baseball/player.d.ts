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
  teamTidyName: string;
  teamCode: number; 
  sportCode: string;
  teamId?: string; // mongo ID of player's team
  playerId: string;
  teamConference: string;
  teamConferenceDivision: string;
}

export interface IPerGamePlayerStats {
  gameId?: string;
  season: number;
  playerClass: string;
  uniform: string;
  pos: string;
  started: boolean;
  side: VH;
  codeInGame: string;
  plays: string[]; // array of mongo IDs for plays
  stats: ICommonStats;
  opponentName: string;
  opponentCode: number;
  opponentConference: string,
  opponentConferenceDivision: string, 
  gameDate: Date;
  actualDate: string;
  bats: string;
  throws: string;
  spot: number;
  gp: number;
  gs: number;
}
