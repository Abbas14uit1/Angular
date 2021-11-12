import * as CommonStats from './common-stats.d';
import * as Athlyte from './index.d';

export interface IAllTeams {
  home: ITeam;
  away: ITeam;
}

export interface ITeam extends ITeamStaticData, ITeamDynamicData { }

export interface ITeamStaticData {
  code: number;
  name: string;
  _id?: string;
  tidyName: string;
}

export interface ITeamDynamicData {
  players: string[];
  games: ITeamGameSpecificData[];
}

export interface ITeamMeta {
  tidyName: string; // shorthand for team
  name: string; // formal name for team
}

export interface ITeamGameSpecificData {
  gameId?: string;
  opponentCode: number;
  opponentName: string;
  gameDate: Date;
  actualDate: string;
  season: number;
  homeAway: Athlyte.VH;
  linescore: ITeamLineScore;
  record: string;  
  superlatives?: string[];
}

export interface ITeamLineScore {
  score: number;  
  periods: ITeamPeriodScore[];
}

export interface ITeamPeriodScore {
  period: number;
  score: number;
}

