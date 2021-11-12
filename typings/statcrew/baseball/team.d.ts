export interface ITeam {
  $: IMetaTeamStats;
  linescore: ILinescore[];
  starters: IStarters[];
  batords: IBatOrd[];
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
  rank?: number;
  conf: string;
  confrecord?: string;
  confdivision:string;
}

interface ILinescore {
  $: {
    line: string;
    runs: number;
    hits: number;
    errs: number;
    lob: number;
  };
  lineinn: ILineInn[];
}

interface ILineInn {
  $: {
    inn: number;
    score: string;
  };
}

interface IStarters {
  starter: IStarter[];
}

interface IStarter {
  $: {
    spot: number;
    name: string;
    uni: number;
    pos: string;
  };
}

interface IBatOrd {
  $: {
    spot: number;
    name: string;
    uni: number;
    pos: string;
  }
}

interface ITotals {
  hitting: IHittingStats[];
  fielding: IFieldingStats[];
  hsitsummary: IHittingSituationsSummary[];
  hsituation: IHittingSituation[];
  fsituation: IFieldSituation[];
  pitching: IPitchingStats[];
  psitsummary: IPitchingSituationsSummary[];
  psituation: IPitchSituation[];
}

interface IHittingStats {
  $: {
    ab: number;
    r: number;
    h: number;
    rbi: number;
    double?: number;        
    bb?: number;
    so?: number;
    hbp?: number;
    kl?: number;
    sh?: number;
    sf?: number;
    picked?: number;
    triple?: number;
    hitdp?: number;
    ground?: number;
    fly?: number;
    hr?: number;
    ibb?: number;
    sb?: number;
    cs?: number;
    rchci?: number; 
    rcherr?: number;
    rchfc?: number;
    gdp?: number;
    hitDp?: number;
  }
}

interface IFieldingStats {
  $: {
    po: number;
    a: number;
    e: number;
    sba?: number;
    csb?: number;
    pb?: number;
    ci?: number;
    indp?: number;
    intp?: number;
  }
}

interface IHittingSituationsSummary {
  $: {
    rchfc?: number;
    rcherr?: number;
    rchci?: number;
    ground?: number;
    fly?: number;
    w2outs?: string;
    wrunners?: string;
    wrbiops?: string;
    vsleft?: string;
    vsright?: string;
    leadoff?: string;
    rbi3rd?: string;
    wloaded?: string;
    advops?: string;
    adv?: number;
    lob?: number;
    "rbi-2out"?: number;
  }
}

interface IPitchingStats {
  $: {
    appear?: number;
    win?: number;
    gs?: number;
    save?: number;
    loss: number;
    cg?: number;
    sho?: number;
    cbo?: number;
    ip?: number;
    h?: number;
    r?: number;
    k?: number;
    er?: number;
    bb?: number;
    so?: number;
    bf?: number;
    ab?: number;
    double?: number;
    triple?: number;
    pitches?: number;
    strikes?: number;
    inheritr?: number;
    inherits?: number;
    sfa?: number;
    sha?: number;
    cia?: number;
    hr?: number;
    wp?: number;
    bk?: number;
    hbp?: number;
    kl?: number;
    ibb?: number;
    gdp?: number;
    fly?: number;
    ground?: number;
    teamue?: number;
  }
}

interface IHittingSituation {
  $: {
      context: string;
      pos?: string;
      ab?: number;
      r?: number;
      h?: number;
      rbi?: number;
      bb?: number;
      so?: number;
      ground?: number;
      fly?: number;
      cs?: number;
      sf?: number;
      gdp?: number;
      hitdp?: number;  
      double?: number;
      triple?: number;
      kl?: number;
      sb?: number;          
      spot?: number;
      pitcher?: string;      
  }
}

interface IFieldSituation {
  $: {
    context: string;
    pos: string;
    po: number;
    a: number;
    e: number;
    sba?: number;
    csb?: number;
  }
}

interface IPitchSituation {
  $: {
    context: string;
    inn?: number;
    ip?: number;
    h?: number;
    r?: number;
    er?: number;
    bb: number;
    so?: number;
    bf?: number;
    ab?: number;
    fly?: number;
    ground?: number;
    kl?: number;
    double?: number;
    triple?: number;
    ibb?: number;
    gdp?: number;     
  }
}

interface IPitchingSituationsSummary {
  $: {
    fly?: number;
    ground?: number;
    leadoff?: string;
    wrunners?: string;
    vsleft?: string;
    vsright?: string;
    w2outs?: string;
    pitches?: number;
    strikes?: number;
  }
}

interface IHitSeasonStats {
  $: {
    ab?: number;
    r?: number;
    h?: number;
    rbi?: number;
    so?: number;
    bb?: number;
    hbp?: number;
    double?: number;
    hr?: number;
    sb?: number;
    sh?: number;
    sf?: number;
    e?: number;
    avg?: number | string;
    vsleft?: number | string;
    vsright?: number | string;
    w2outs?: number | string;
    wrunners?: number | string;
    wrbiops?: number | string;
    leadoff?: number | string;
    rbi3rd?: number | string;
    loaded?: number | string;
    pinchhit?: number | string;
    rbi2out?: number;
  }
}

interface IPitchingSeasonStats {
  $: {
    era?: number;
    ip?: number;
    h?: number;
    r?: number;
    er?: number;
    bb?: number;
    so?: number;
    double?: number;
    triple?: number;
    hr?: number;
    wp?: number;
    hbp?: number;
    win?: number;
    loss?: number;
    save?: number;
    vsleft?: number;
    vsright?: number;
    w2outs?: number;
    wrunners?: number;
    leadoff?: number;
  }
}

interface IPlayer {
  $: {
    name: string;
    shortname?: string;    
    uni: string | number;
    class: "FR" | "SO" | "JR" | "SR";
    gp: number;
    gs?: number;
    spot: number;
    pos: string;
    atpos: string;
    bats: "L" | "R" | "B";
    throws: "L" | "R" | "B";
    code: string | number;
    playerid: string;
  };
  hitting?: IHittingStats[];
  hsitsummary?: IHittingSituationsSummary[];
  hsituation?: IHittingSituation[];
  fsituation?: IFieldSituation[];
  hitseason?: IHitSeasonStats[];
  fielding?: IFieldingStats[];
  pitching?: IPitchingStats[];
  pchseason?: IPitchingSeasonStats[];
  psitsummary?: IPitchingSituationsSummary[];
}
