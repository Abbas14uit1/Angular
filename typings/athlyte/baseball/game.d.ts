import { VH } from "./index.d";

export interface IGame {
  _id?: string;
  meta: IGameMeta;
  venue: IGameVenue;
  team: IGameTeam;
  summary: IGameSummary;
  gameDate: Date;
  actualDate: string;
  sportCode: string;
  season: number;
  playerIds: string[];
  teamIds: {
    home?: string;
    visitor?: string;
  };
  playIds: string[];
  superlatives?: [{
    superlativeId: string;
    playerId?: string;
    teamId?: string;
  }];
}

export interface IGameMeta {
  startTime: Date;
  endTime: Date;
  umpires: IUmpireInfo[];
  rules: {
    innings: number;
    //minutes: number;
    batters: string;
    usedh: string;
  };
}

export interface IUmpireInfo {
  pos: string;
  name: string;
}

export interface IGameVenue {
  geoLocation: string;
  stadiumName: string;
  neutralLocation?: boolean;
  nightGame: boolean;
  conferenceGame: boolean;
  postseasonGame: boolean;
  attendance: number;
  temperatureF?: number;
  wind?: string | number;
  weather?: string;
  dhGame?: string;
  series: string;
  schedInn: number;
  schedNote: string;
  gameType: string[];
}

export interface IGameTeam {
  home: ITeamHeader;
  visitor: ITeamHeader;
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

/**
 * Game summary is four sections: scores, drives, fgas, and longplays.
 * All number values refer to indices of the Plays array for the game
 * Drives array contains arrays which hold 2 values: start and end of drive.
 * Ex: [[1,4][5,7]] indicates two drives; one from play 1 to play 4 and one from play 5 to play 7.
 */
export interface IGameSummary {
  scores: number[];
  played: boolean[];
  battingDetails: IBattingDetails[];
  //longplay: number[];
}

export interface IBattingDetails {
  team: VH;
  teamName: string;
  teamId?: string;
  code: number;
  inning: number;
  num: number;
  r: number;
  h: number;
  e: number;
  lob: number;
  plays: number;
}


