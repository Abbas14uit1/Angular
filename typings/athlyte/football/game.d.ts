import { IFieldPosition, VH } from './index.d';

export interface IGame {
  _id: string;
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
  updateTime:Date;
}

export interface IGameMeta {
  startTime: Date;
  endTime: Date;
  officials: IOfficialInfo[];
  rules: {
    // TODO: more rules?
    quarters: number;
    minutes: number;
    downs: number;
    yards: number;
    kickoffSpot: number;
    touchbackSpot: number;
    kickoffTouchbackSpot: number;
  };
}

export interface IOfficialInfo {
  pos: string;
  name: string;
}

export interface IGameVenue {
  geoLocation: string;
  stadiumName: string;
  neutralLocation: boolean;
  nightGame: boolean;
  conferenceGame: boolean;
  postseasonGame: boolean;
  gameType: string[];
  attendance: number;
  temperatureF?: number;
  wind?: string | number; // TODO: is wind reported as string or number?
  weather?: string;
}

export interface IGameTeam {
  home: ITeamHeader;
  visitor: ITeamHeader;
}

export interface ITeamHeader {
  id: string;
  code: number;
  name: string;
  score: number;
  conf: string;
  confDivision: string;
}

/**
 * Game summary is four sections: scores, drives, fgas, and longplays.
 * All number values refer to indices of the Plays array for the game
 * Drives array contains arrays which hold 2 values: start and end of drive.
 * Ex: [[1,4][5,7]] indicates two drives; one from play 1 to play 4 and one from play 5 to play 7.
 */
export interface IGameSummary {
  scores: number[];
  drives: number[][];
  driveDetails?: IDriveDetails[];
  fgas: number[];
  longplay: number[];
}

export interface IDriveDetails {
  drivingTeam: VH;
  drivingTeamName: string;
  drivingTeamId?: string;
  startPlay: IDrivePlayInfo;
  endPlay: IDrivePlayInfo;
  plays: number;
  yards: number;
  timeOfPossession: string;
}

export interface IDrivePlayInfo {
  playType: string;
  quarter: number;
  clock: string;
  fieldPos: IFieldPosition;
}
