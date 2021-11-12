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
  fds: number;
  thirdDown: number;
  thirdDownAtt: number;
  rushNet: number;
  passNet: number;
  penalties: number;
  avgPunt: number;
  tds: number;
  fgs: number;
  top: string;
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

export interface IPlayerRushing {
  _id: string;
  name: string;
  attempts: number;
  yards: number;
  touchdowns: number;
  long: number;
}

export interface IPlayerPassing {
  _id: string;
  name: string;
  completed: number;
  attempts: number;
  yards: number;
  touchdowns: number;
  interceptions: number;
  rating: number;
}

export interface IPlayerReceiving {
  _id: string;
  name: string;
  targets: number;
  receptions: number;
  yards: number;
  touchdowns: number;
  long: number;
}

export interface IPlayerDefense {
  _id: string;
  name: string;
  tackles: number;
  assists: number;
  total: number;
  sacksAndYards: number;
  interceptions: number;
}

export interface IPlayerInterceptions {
  _id: string;
  name: string;
  num: number;
  yards: number;
  average: number;
  touchdowns: number;
  long: number;
}

export interface IPlayerFumbles {
  _id: string;
  name: string;
  total: number;
  lost: number;
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
  offense: boolean; // defense if false
  position: string;
  stats: ICommonStats[];
  plays: string[];
}

export interface IGamePlayByPlay {
  _id: string; 
  gameId: string;
  homeTidy: string;
  awayTidy: string;
  quarter: number;
  drive: number;
  playInDrive: number;
  down: number;
  possession: Athlyte.VH;
  playStartLocation: Athlyte.IFieldPosition;
  playEndLocation?: Athlyte.IFieldPosition;
  yardsToGo: number;
  resultedInFirstDown: boolean;
  turnover: string;
  score?: any;
  results: IPlayResults;
}

export interface ITeamTidyNames {
  homeTidyName: string;
  awayTidyName: string;
}

export interface IGameScoring {
  quarter: number;
  drive: number;
  description: string;
  playStartLocation: Athlyte.IFieldPosition;
  playEndLocation?: Athlyte.IFieldPosition;
  possession: Athlyte.VH;  
  score?: any;
  results: any;
}


export interface IPlayerFumbles {
  _id: string;
  name: string;
  total: number;
  lost: number;
}



export interface IPlayerFumbles {
  _id: string;
  name: string;
  total: number;
  lost: number;
}

export interface IPlayerPitchingStats {
  name: string;
  ip: number;
  h: number;  
  er: number;
  bb: number;
  so: number;
  r: number;
  ab: number;
  ground: number;
}


export interface IPlayerHittingStats {
    name: string;
    bats:string;
    bat: string;
    atbat: number;
    runs: number;
    hits:number;
    rbi:number;
    so:number;
    ground:number;
    fly: number;
}

export interface IBaseBallTeamStats {
    _id: string;  
    tidyName: string;
    homeAway: number;
    hittingAB: number;
    hittingR: number;
    hittingH: number;
    hittingRBI: number;
    hittingBB: number;
    hittingSO: number;
    ground: number;
    pitchingIP: number;
    pitchingH: number;
    pitchingER: number;
    pitchingBB: number;
    pitchingSO: number;
    fieldingPO: number;
    fieldingA: number;
    fieldingE: number;
}
export interface IGameBaseBallScoring {
  inningNumber: number;
  description: string; 
  possession: number;  
  results: any;
  score:number;
}
export interface IGameBasketBallScoring {
  _id: string;
  possession: number;  
description:string;  
  score:any;
  period:number;
  gameClockStartTime:any;
  action:string;
  type:string;
  playerNames:any;
}
export interface IBasketBallTeamStats {
 _id: string;
tidyName: string;
homeAway: number;
statsFGM: number;
statsFGA: number;
statsFGM3:  number;
statsFGA3:  number;
statsFTM:  number;
statsFTA:  number;
statsTP: number;
statsBLK: number;
statsSTL:  number;
statsAST: number;
statsMIN:  number;
statsOREB:  number;
statsDREB:   number;
statsTREB:  number;
statsPF:  number;
statsTF:   number;
statsTO:  number;
statsDeadball:   number;
statsFGPCT:   number;
statsFG3PCT:  number;
statsFTPCT:  number;
specialPTSTO:  number;
specialPTSCH2:  number;
specialPTSPaint:  number;
specialPTSFastb:  number;
specialPTSBench:  number;
specialTies:  number;
specialLeads:  number;
specialPOSSCount:  number;
specialPOSSTime:  number;
specialScoreCount:  number;
specialScoreTime:  number;
specialLeadTime:  number;
specialTiedTime:  number;
specialLargeLead:  number;
specialLargeLeadT:  number;
}