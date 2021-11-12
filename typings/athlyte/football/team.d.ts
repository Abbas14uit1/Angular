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
  sportCode: string;
  season: number;
  homeAway: Athlyte.VH;
  linescore: ITeamLineScore;
  totals: ITeamTotals;
  qtrTotals?: IQuarterTotals[];
  homeTeam: ITeamHeader;
  visitorTeam: ITeamHeader;
  gameType: string[];
  geoLocation: string;
  attendance: number;
  nightGame: boolean;
  neutralLocation: boolean;
  startTime: Date;
  superlatives?: string[];
  players: string[];
}

export interface ITeamHeader {
  id: string;
  code: number;
  name: string;
  score: number;
  conf: string;
  confDivision: string;
}

export interface ITeamLineScore {
  score: number;
  periods: ITeamPeriodScore[];
}

export interface ITeamPeriodScore {
  period: number;
  score: number;
}

export interface ITeamTotals extends CommonStats.ICommonStats {
  firstdowns: { // aggregate of first downs
    fdTotal: number; // total # of first downs
    fdRush: number; // # of rush first downs
    fdPass: number; // # of pass first downs
    fdPenalty: number; // # of penalty first downs
  };
  penalties: { // aggregate for penalty stats
    penTotal: number; // number of penalties
    penYards: number; // number of yards penalized total
  };
  conversions: { // aggregate of 3rd and 4th down conversions
    convThird: number; // successful third down conversions
    convThirdAtt: number; // total attempted third down conversions
    convFourth: number; // successful fourhtdown conversions
    convFourthAtt: number; // total attempted fourth down converisons
  };
  redzone: {
    redAtt: number;
    redScores: number;
    redPoints: number;
    redTdRush: number;
    redTdPass: number;
    redFgMade: number;
    redEndFga: number;
    redEndDown: number;
    redEndInt: number;
    redEndFumb: number;
    redEndHalf: number;
    redEndGame: number;
  };
}

export interface IQuarterTotals extends ITeamTotals {
  qtrNum: number;
}
