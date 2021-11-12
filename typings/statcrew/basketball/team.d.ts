export interface ITeam {
  $: IMetaTeamStats;
  linescore: ILinescore[];
  totals: ITotals[];
  player: IPlayer[];
}

export type VH = "V" | "H";

interface IMetaTeamStats {
  vh: VH;
  code: number;
  id: string;
  name: string;
  record: string;
  conf: string;
  confdivision: string;
}

interface ILinescore {
  $: {
    prds: number;
    line: string;
    score: number;
  };
  lineprd: ILinePrd[];
}

interface ILinePrd {
  $: {
    prd: number;
    score: number;
  };
}


interface IStats {
  $: {     
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
    dq: number;
    deadball: string;
    fgpct: number;
    fg3pct: number;
    ftpct: number;
    foul: number;
  };
}

export interface ISummary {
  $: {
    vh: VH;
    fgm: number;
    fga: number;
    fgm3: number;
    fga3: number;
    ftm: number;
    fta: number;
    blk: number;
    stl: number;
    ast: number;
    oreb: number;
    dreb: number;
    treb: number;
    pf: number;
    tf: number;
    to: number;
  }
}

interface IStatsByPrd {
  $: {
    prd: number;
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
    treb: number;  
    pf: number;  
    tf: number;  
    to: number;
    fgpct: number;
    fg3pct: number;
    ftpct: number;
    deadball: string;
    foul: number;
  }
}

interface ISpecial {
  $: {
    vh: VH;
    pts_to: number;
    pts_ch2: number;
    pts_paint: number;
    pts_fastb: number;
    pts_bench: number;
    ties: number;
    leads: number;
    poss_count: number;
    poss_time: number;
    score_count: number;
    score_time: number;
    lead_time: number;
    tied_time:  number;
    large_lead: number;
    large_lead_t: string;
  }
}



interface ITotals {
  stats: IStats[];
  statsbyprd: IStatsByPrd[];
  special: ISpecial[]; 
}

interface IPlayer {
  $: {
    name: string;    
    shortname?: string;
    checkname: string;
    uni: string | number;
    class: "FR" | "SO" | "JR" | "SR";
    gp: number;
    gs?: number;
    pos?: string;
    code: string | number;
    oncourt?: "Y";
    playerid: string;
  };
  stats?: IStats[];
  statsbyprd: IStatsByPrd[];    
}

