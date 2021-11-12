export interface ICommonStats {
  hitting?: IHittingStats;
  fielding?: IFieldingStats;
  pitching?: IPitchingStats;
  hitSeason?: IHitsSeasonStats;
  hitSummary?: IHitSummary;
  pitchSummary?: IPitchSummary;
  hitSituation?: IHittingSituation[];
  fieldSituation?: IFieldSituation;
  pitchingSituation?: IPitchSituation[];
  [index: string]: any;
}

export interface IHittingSituation {  
  context: string;
  pos: string;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  ground: number;
  fly: number;
  cs: number;
  sf: number;
  gdp: number;
  hitDp: number;
  so: number;
  bb: number;
  double: number;
  triple: number;
  kl: number;
  sb: number;    
  spot: number;
  pitcher?: string;
  pitcherPlayerId?: string;
  sbcs: number;
}


export interface IFieldSituation {  
  context: string;
  pos: string;
  po: number;
  a: number;
  e: number;
  sba?: number;
  csb?: number;
  sbcs: number;
}

export interface IPitchSituation { 
  context: string;
  innining: number;
  ip: number;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  bf: number;
  ab: number;
  fly: number;
  ground: number;
  kl: number;
  double: number;
  triple: number;
  ibb: number;
  gdp: number;  
}

export interface IHittingStats {
  appear: number;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  double: number;  
  triple: number; 
  hr: number;
  bb: number;
  ibb: number;
  so: number;
  hbp: number;
  kl: number;
  sb: number;
  cs: number;
  sh: number;
  sf: number;
  rchci: number; 
  rcherr: number;
  rchfc: number;
  gdp: number;
  picked: number;
  hitDp: number;
  ground: number;
  fly: number;
  tb: number;
  hwhp: number;
  abbhpsf: number;
  pa: number;
  babp: number;
  single: number;
  hhr: number;
  sba: number;
}

export interface IFieldingStats {
  appear: number;
  po: number;
  a: number;
  e: number;
  sba: number;
  csb: number;
  pb: number;
  ci: number;
  indp: number;
  intp: number;
  poa: number;
  poae: number;
}

export interface IPitchingStats {
  appear: number;
  win: number;
  save: number;
  loss: number;
  gs: number;
  cg: number;
  sho: number;
  cbo: number;  
  ip: number;
  h: number;
  r: number;
  er: number;
  bb: number;
  k: number;
  so: number;
  bf: number;
  ab: number;
  double: number;
  triple: number;
  hr: number;
  wp: number;
  bk: number;
  hbp: number;
  kl: number;
  ibb: number;
  inheritr: number;
  inherits: number;
  sfa: number;
  sha: number;
  cia: number;
  pitches: number;
  gdp: number;
  fly: number;
  ground: number;
  teamue: number;
  hhr: number;
  abkhrsf: number;
  hwhp: number;
  pa: number; 
  tb: number; 
}

export interface IHitSummary {  
  rchfc: number;
  rcherr: number;
  rchci: number;
  ground: number;
  fly: number;
  w2Outs: number[];
  wRunners: number[];
  wrBiops: number[];
  vsLeft: number[];
  vsRight: number[];
  leadOff: number[];
  rbiThird: number[];
  //TODO: Does not exist in pdf
  wLoaded: number[];
  advops: number[];
  adv: number;
  lob: number;
  rbi2Out: number;
  wRunnersH: number;
  wRunnersAB: number;
  wLoadedH: number;
  wLoadedAB: number;
  w2OutsH: number;
  w2OutsAB: number;
}

export interface IPitchSummary {  
  fly: number;
  ground: number;
  leadoff: number[];
  wRunners: number[];
  vsLeft: number[];
  vsRight: number[];
  w2Outs: number[];
  pitches: number;
  strikes: number;
}

export interface IHitsSeasonStats {
  appear: number;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  so: number;
  bb: number;
  hbp: number;
  double: number;
  hr: number;
  sb: number;
  cs: number;
  sf: number;
  e: number;
  avg: number;
  vsLeft: number;
  vsRight: number;
  w2outs: number;
  wRunners: number;
  wrbiOps: number;
  leadff: number;
  rbi3rd: number;
  loaded: number;
  pinchHit: number;
  rbi2Out: number;
}