import { ITeamGameSpecificData } from "../team.d";
import { IGameVenue } from "../game.d";
import { ICommonStats } from "../summary/common-stats.d";
import { IPlayResults } from "../play.d"
import * as Athlyte from "../index.d";


export interface IGameInfo {
  gameDate: Date;
  actualDate: string;
  venue: IGameVenue;
}
export interface ITeamStats {
  _id: string;
  tidyName: string;
  homeAway: Athlyte.VH;

//TODO: Which of this stat is needed?
  /*ptsTo: number;
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
  largeLead: number;*/
  
}
export interface ITeamStatRows {
  name: string;
  homeValue: number;
  awayValue: number;
}

export interface ITeamGame {
  _id: string;
  tidyName: string;
  name?: string;
  code: number;
  gameSpecificData: ITeamGameSpecificData;
}

export interface IPlayerAssist {
  _id: string;
  name: string;
  attempts: number;  
}

export interface IPlayerMiss {
  _id: string;
  name: string;
  attempts: number;  
  type: string;
}

export interface IPlayerBlock {
  _id: string;
  name: string;
  attempts: number;    
}

export interface IPlayerRebound {
  _id: string;
  name: string;
  attempts: number;  
  type: string;
}

export interface IPlayerTurnover {
  _id: string;
  name: string;
  attempts: number;    
}

export interface IPlayerSteal {
  _id: string;
  name: string;
  attempts: number;    
}

export interface IPlayerFoul {
  _id: string;
  name: string;
  attempts: number;  
  type: string;
}

export interface IPlayerSub {
  _id: string;
  name: string;
  attempts: number;  //number of times the player was in or out
  type: string;
}

export interface IPlayerGood {
  _id: string;
  name: string;
  attempts: number;  
  type: string;
  score: number;
}

export interface IGameFullRosterPlayer {
  _id: string;
  name: string;
  class: string;
  stats: ICommonStats[];
  plays: string[];
}

export interface IGameStarterRosterPlayer {
  _id: string;
  name: string;
  class: string;
  position: string;
  stats: ICommonStats[];
  plays: string[];
}

export interface IGamePlayByPlay {
  _id: string; 
  gameId: string;
  homeTidy: string;
  awayTidy: string;
  period: number;
  playInPeriod: number;  
  possession: Athlyte.VH;  
  action: string;
  vscore?: number;
  hscore?: number
  results: IPlayResults;
}

export interface ITeamTidyNames {
  homeTidyName: string;
  awayTidyName: string;
}

export interface IGameScoring {
  period: number;  
  possession: Athlyte.VH;
  action: string;
  type: string;  
  vscore?: number;
  hscore?: number;  
}