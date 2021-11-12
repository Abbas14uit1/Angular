import * as CommonStats from "./common-stats.d";
import * as Athlyte from "./index.d";

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
  games: ITeamGameSpecificData;
  record: {
    wins: number,
    losses: number,
  };
  confRecord: {
    wins: number,
    losses: number,
  };
  rank: number;
  conference: number;
}

export interface ITeamMeta {
  tidyName: string; // shorthand for team
  name: string; // formal name for team
}

export interface ITeamGameSpecificData {
  teamId?: string;
  gameId?: string;
  gameDate: Date;
  actualDate: string;
  season: number;
  record: number;
  sportCode: string;
  homeAway: Athlyte.VH;
  opponentCode: number;
  opponentName: string;
  linescore: ITeamLineScore;
  totals: ITeamTotals;
  starters: IStarter[];
  conference: string;
  conferenceDivision: string;
  opponentConference: string;
  opponentConferenceDivision: string;
  homeTeam: ITeamHeader;
  visitorTeam: ITeamHeader;
  gameType: string[];
  geoLocation: string;
  attendance: number;
  nightGame: boolean;
  neutralLocation: boolean;
  startTime: Date;
  players: string[];
}

export interface ITeamHeader {
  id: string;
  name: string;
  score: number;
  code: number;
  runs: number;
  hits: number;
  errs: number;
  lob: number;
}

export interface ITeamLineScore {
  score: number;
  runs: number;
  hits: number;
  errs: number;
  lob: number;
  innings: ITeamInningScore[];
}

export interface ITeamInningScore {
  inning: number;
  score: number;
}

export interface ITeamTotals extends CommonStats.ICommonStats { }

export interface IStarter {
  playerId?: Athlyte.PlayerId;
  spot: number;
  name: string;
  uni: number;
  pos: string;
}