import { PlayerId, VH } from "./index.d";

export interface IPlay {
  _id?: string;
  gameId: string;
  sportCode: string;
  playerIds: PlayerId[];
  inningNumber: number;  
  playInBat: number; // 1st play in bat, 2nd, etc.
  playInGame: number; // 1st play of game, 2nd, etc.
  outs: number;
  possession: VH;
  description: string; // todo: look at description, come up with parser to determine results.  
  batProf: string;  
  pitchProf: string;
  narrative: string;
  results: IPlayResults;
  score: number;
}

interface IPlayResults {
  sub?: ISub;
  batter?: IBatter;
  runner?: IRunner;  
  pitches?: IPitches;
  pitcher?: IPitcher;
  fielder?: IFielder[]; 
}


interface ISub {
  team: VH;
  forId: PlayerId;
  whoId: PlayerId;
  for: string;
  who: string;
  pos: string;
  spot: number;
}

interface IBatter {
  id?: PlayerId;
  name: string;
  action: string;
  out: number;
  adv: number;
  tobase: number;
  ab: number;
  k?: number;
  kl?: number;
  flyout?: number;
  wherehit?: number;  
}

interface IPitcher {
  id?: PlayerId;
  name: string;
  bf: number;
  ip: number;
  ab: number;
  k?: number;
  kl?: number;
  flyout?: number;
}

interface IPitches {  
  text: string;
  b: number;
  s: number;
}

interface IFielder {
  id?: PlayerId;  
  pos: string;
  name: string;
  po?: number;
  a?: number;
}

interface IRunner {
  id?: PlayerId;
  base: number;
  name: string;
  action: string;
  out: number;
  adv: number;
  tobase: number;
  scored?: number;
  por?: string;
}