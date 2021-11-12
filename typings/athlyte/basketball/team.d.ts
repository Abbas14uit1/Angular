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
  //players: string[];
  games: ITeamGameSpecificData;
}

export interface ITeamMeta {
  tidyName: string; // shorthand for team
  name: string; // formal name for team
}

export interface ITeamGameSpecificData {
  teamId?: string;
  gameId?: string;
  opponentCode: number;
  opponentName: string;
  opponentConference: string;
  opponentConferenceDivision: string;
  conference: string;
  conferenceDivision: string;
  gameDate: Date;
  actualDate: string;
  season: number;
  sportCode: string;
  homeAway: Athlyte.VH;
  linescore: ITeamLineScore;
  totals: ITeamTotals;
  record: string[];  
  superlatives?: string[];
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
  code: number;
  name: string;
  score: number;
  record: string[];
}

export interface ITeamLineScore {
  score: number; 
  totalOvertimePeriods: number; 
  periods: ITeamPeriodScore[];
}

export interface ITeamPeriodScore {
  period: number | "ot";
  overtime: boolean;
  score: number;
}

export interface ITeamTotals {
  stats: CommonStats.ICommonStats;
  prdStats?: CommonStats.ICommonStats[];
  special?: ITotalSpecial;
}

export interface ITotalSpecial {
  vh: Athlyte.VH;
  ptsTo: number;
  ptsCh2: number;
  ptsPaint: number;
  ptsFastb: number;
  ptsBench: number;
  ties: number;
  leads: number;
  possCount: number;
  possTime: number;
  scoreCount: number;
  scoreTime: number;
  leadTime: number;
  tiedTime:  number;
  largeLead: number;
  largeLeadT: string;
}

export interface ITotalStats{
  fgm: number;
  fga: number;
  fgm3: number;
  fga3: number;
  ftm: number;
  fta: number;
  blk: number;
  stl: number;
  ast: number;
  oreb: number;
  dreb: number;
  treb: number;
  pf: number;
  tf: number;
  to: number;  
  prdClockTime: string;
  prds: number;  
}