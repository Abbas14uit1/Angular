export interface ICommonStats {
  receiving?: IReceivingStats;
  rushing?: IRushingStats;
  pass?: IPassStats;
  defense?: IDefenseStats;
  kickReceiving?: IKickReceivingStats;
  fumbles?: IFumbleStats;
  intReturn?: IInterceptionReturnStats;
  scoring?: IScoringStats;
  kickoff?: IKickoffStats;
  fieldgoal?: IFieldgoalStats;
  pointAfter?: IPointAfterStats;
  punt?: IPuntingStats;
  puntReturn?: IPuntReturnStats;
  misc?: IMiscStats;
  [index: string]: any;
}

export interface IMiscStats {
  yards: number;
  top: string; // TIME OF POSSESSION?
  ona: number;
  onm: number;
  ptsto: number;
}

export interface IPointAfterStats {
  kickatt: number;
  kickmade: number;
  passatt: number;
  passmade: number;
  rushatt: number;
  rushmade: number;
}

export interface IFumbleStats {
  fumbTotal: number; // total number of fumbles
  fumbLost: number; // number of those fumbles that were not recovered
}

export interface IRushingStats {
  rushAtt: number;
  rushYards: number;
  rushGain: number;
  rushLoss: number;
  rushTd: number;
  rushLong: number; // longest rush
}

export interface IPassStats {
  passComp: number;
  passAtt: number;
  passInt: number;
  passYards: number;
  passTd: number;
  passLong: number; // longest pass
  passSacks: number; // number of sacks
  passSackYards: number; // yards lost from sacks
}

export interface IReceivingStats {
  rcvNum: number;
  rcvYards: number;
  rcvTd: number;
  rcvLong: number;
}

export interface IPuntingStats {
  puntNum: number;
  puntYards: number;
  puntLong: number;
  puntBlocked: number;
  puntTb: number; // touchbacks
  puntFc: number; // fair catches
  puntPlus50: number; // count of punts over 50 yards
  puntInside20: number;
}

export interface IKickoffStats {
  koNum: number;
  koYards: number;
  koOb: number; // not sure what this is
  koTb: number;
}

export interface IFieldgoalStats {
  fgMade: number;
  fgAtt: number;
  fgLong: number;
  fgBlocked: number;
}

export interface IDefenseStats { // not sure about most of these
  dTackUa: number;    // tackle unassisted
  dTackA: number;
  dTackTot: number;
  dTflua: number;
  dTfla: number;
  dTflyds: number;
  dSacks: number;
  dSackUa: number;
  dSackA: number;
  dSackYards: number;
  dBrup: number;
  dFf: number;
  dFr: number;
  dFryds: number;
  dInt: number;
  dIntYards: number;
  dQbh: number;
  dblkd: number;
}

export interface IKickReceivingStats {
  krNo: number;
  krYards: number;
  krTd: number;
  krLong: number;
}

export interface IPuntReturnStats {
  prNo: number;
  prYards: number;
  prTd: number;
  prLong: number;
}

export interface IInterceptionReturnStats {
  irNo: number;
  irYards: number;
  irTd: number;
  irLong: number;
}

export interface IScoringStats {
  td: number;
  fg: number;
  patKick: number;
}
