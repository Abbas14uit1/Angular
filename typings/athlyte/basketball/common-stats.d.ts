export interface ICommonStats {
  fgm: number;
  fga: number;
  fgm3: number;
  fga3: number;
  ftm: number;
  fta: number;
  tp: number;
  blk: number;
  stl: number;
  ast: number;
  min: number;
  oreb: number;
  dreb: number;
  treb:number;
  pf: number; 
  tf: number;
  to: number;
  //dq: number;
  deadball?: number;
  deadballByPeriod?: number[];
  fgpct: number;
  fg3pct: number;
  ftpct: number;
  prd?: number;
  foul?: number;
  dDoubles?: number;
  tDoubles?: number;
}

