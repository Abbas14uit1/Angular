import { IFieldPosition, PlayerId, VH } from "./index.d";

export interface IPlay {
  _id?: string; // unique play ID?
  gameId: string;
  playerIds: string[];
  quarter: number;
  drive: number;
  playInDrive: number; // 1st play in drive, 2nd, etc.
  playInGame: number; // 1st play of game, 2nd, etc.
  down: number;
  possession: VH;
  playStartLocation: IFieldPosition;
  playEndLocation?: IFieldPosition;
  yardsToGo: number;
  gameClockStartTime: ITime;
  resultedInFirstDown: boolean;
  description: string;
  sportCode: string;
  // TODO: enum of turnover types?
  turnover?: string; // if a forced turnover, turned over on int, fumble, etc. Also enter details in results section.
  score?: IScoreInfo;
  results: IPlayResults;
  superlatives?: [{
    superlativeId: string;
    playerId?: string;
    teamId?: string;
  }];
  tokens: string;
}

interface ITime {
  minutes: number;
  seconds: number;
}

interface IScoreInfo {
  side: VH;
  scoringPlayerId: PlayerId;
  type: string; // TODO: enum as string types TD, PAT, FG, etc.?
  yards?: number;
  homeScore: number;
  visitorScore: number;
}

interface IPenaltyDetails {
  against: VH;
  accepted: boolean;
  details: {
    playerDrawingPenalty?: PlayerId; // unlisted if penalty declined
    type: string; // offsides, false start, etc.
    newFieldPosition?: IFieldPosition; // unlisted if penalty declined
    // there's one mystery property for penalty details
  };
}

interface IFumbleDetails {
  fumbledBy: PlayerId;
  recoveredLocation: IFieldPosition;
}

interface IKickoffDetails {
  kickerId: PlayerId;
  kickedTo: IFieldPosition;
}

interface IPassDetails {
  passerId: PlayerId; // unique
  wasCompleted: boolean;
  wasIntercepted: boolean;
  receiverId: PlayerId; // unique
  endingLocation: IFieldPosition;
}

interface ITackleDetails {
  tacklerId: PlayerId; // unique
}

interface IReturnDetails {
  // kickoff or punt
  returnerId: PlayerId;
  ballReturnedTo: IFieldPosition;
}

interface IRushDetails {
  rusherId: PlayerId;
  endingLocation: IFieldPosition;
}

interface ISackDetails {
  sackerIds: PlayerId[];
}

interface IPuntDetails {
  punterId: PlayerId;
  puntedToLocation: IFieldPosition;
  blocked?: boolean;
  recoveringTeam?: VH;
  recoveredLocation?: IFieldPosition;
  recoveringId?: PlayerId;
}

interface ITimeOutDetails {
  calledBy: VH;
}

interface IQBHurryDetails {
  playerId: PlayerId;
}

interface IFieldGoalDetails {
  kickerId: PlayerId;
  distance: number;
  wasGood: boolean;
}

interface IFairCatchDetails {
  callerId: PlayerId;
}

interface IFumbleRecoveryDetails {
  recoveringId: PlayerId;
  returnedToLocation: IFieldPosition;
}

interface IFumbleForceDetails {
  forcerId: PlayerId;
}

interface IBrokenUpDetails {
  breakingUpId: PlayerId;
}

interface IPointAfterTdDetails {
  type: string;
  playerId: PlayerId;
  good: boolean;
}

interface ISafetyDetails {
  scoringTeam: VH;
  playerId: PlayerId;
}

interface IBlockDetails {
  blockerId: PlayerId;
}

export interface IPlayResults {
  // Note: scoring info is in score property
  kickoff?: IKickoffDetails;
  touchback?: boolean; // kickoff
  pass?: IPassDetails;
  brokenUp?: IBrokenUpDetails; // defense
  tackle?: ITackleDetails[]; // defense
  return?: IReturnDetails; // punt or kickoff
  pointAfterTd?: IPointAfterTdDetails; // scoring
  outOfBounds?: boolean; // ran out, punted out, etc. // punt or kickoff
  rush?: IRushDetails;
  sack?: ISackDetails; // defense
  punt?: IPuntDetails; // punt
  timeout?: ITimeOutDetails;
  fumble?: IFumbleDetails; // defense // fumble
  fumbleForced?: IFumbleForceDetails; // defense
  fumbleRecovery?: IFumbleRecoveryDetails; // defense
  down?: boolean;
  qbHurry?: IQBHurryDetails; // defense
  fga?: IFieldGoalDetails; // scoring // fga
  fairCatch?: IFairCatchDetails; // kickoff and punt
  penalty?: IPenaltyDetails;
  noplay?: boolean;
  safety?: ISafetyDetails;
  block?: IBlockDetails; // defense //punt and fga
  playersInvolved: string[];
}
