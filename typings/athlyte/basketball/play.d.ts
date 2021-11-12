import { PlayerId, VH } from "./index.d";

export interface IPlay {
  _id?: string; // unique play ID?
  gameId: string;
  sportCode: string; //TODO: should be enum of all the sports supported by Athlyte
  playerIds: string[]; //Its only one player  
  playerNames: string[];
  period: number | "ot"; 
  playInGame: number; // 1st play of game, 2nd, etc.
  overtime: boolean;
  possession: VH;
  description: string;
  gameClockStartTime: ITime;
  action: string;
  type?: string;
  paint?: string;
  score?: IScoreInfo;
  possessionTeamName: string;
  possessionTeamCode: number;
    
  superlatives?: [{
    superlativeId: string;
    playerId?: string;
    teamId?: string;
  }];
}

interface ITime {
  minutes: number;
  seconds: number;
}

interface IScoreInfo {
  side: VH;
  scoringPlayerId: PlayerId;
  type: string; 
  homeScore: number;
  visitorScore: number;
}

/*
interface IPenaltyDetails {
  against: VH;
  accepted: boolean;
  details: {
    playerDrawingPenalty?: PlayerId; // unlisted if penalty declined
    type: string; // offsides, false start, etc.    
  };
}


interface ITimeOutDetails {
  calledBy: VH;
}

interface IQBHurryDetails {
  playerId: PlayerId;
}
*/
