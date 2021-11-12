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
  abb: string;
  rank: number;
  "conf-record"?: string;
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

interface IFirstDownStats {
  $: {
    no: number;
    rush: number;
    pass: number;
    penalty: number;
  };
}

interface IPenaltyStats {
  $: {
    no: number;
    yds: number;
  };
}

interface IConversionStats {
  $: {
    thirdconv: number;
    thirdatt: number;
    fourthconv: number;
    fourthatt: number;
  };
}

interface IFumbleStats {
  $: {
    no: number;
    lost: number;
  };
}

interface IMiscStats {
  $: {
    yds: number;
    top: string; // time
    ona: number;
    onm: number;
    ptsto: number;
  };
}

interface IRedzoneStats {
  $: {
    att: number;
    scores: number;
    points: number;
    tdrush: number;
    tdpass: number;
    fgmade: number;
    endfga: number;
    enddowns: number;
    endint: number;
    endfumb: number;
    endhalf: number;
    endgame: number;
  };
}

interface IRushStats {
  $: {
    att: number;
    yds: number;
    gain: number;
    loss: number;
    td: number;
    long: number;
  };
}

interface IPassStats {
  $: {
    comp: number;
    att: number;
    int: number;
    yds: number;
    td: number;
    long: number;
    sacks: number;
    sackyds: number;
  };
}

interface IReceivingStats {
  $: {
    no: number;
    yds: number;
    td: number;
    long: number;
  };
}

interface IPuntStats {
  $: {
    no: number;
    yds: number;
    long: number;
    avg?: number;
    blkd: number;
    tb: number;
    fc: number;
    plus50: number;
    inside20: number;
  };
}

interface IKickoffStats {
  $: {
    no: number;
    yds: number;
    ob: number;
    tb: number;
  };
}

interface IFieldgoalStats {
  $: {
    made: number;
    att: number;
    long: number;
    blkd: number;
  };
}

interface IPointAfterStats {
  $: {
    kickatt: number;
    kickmade: number;
    passatt?: number;
    passmade?: number;
    rushatt?: number;
    rushmade?: number;
  };
}

interface IDefenseStats {
  $: {
    tackua: number;
    tacka: number;
    tot_tack?: number;
    tflua?: number;
    tfla?: number;
    tflyds?: number;
    sacks?: number;
    sackyds?: number;
    sackua?: number;
    sacka?: number;
    brup?: number;
    ff?: number;
    fr?: number;
    fryds?: number;
    int?: number;
    intyds?: number;
    qbh?: number;
    blkd?: number;
  };
}

interface ICommonReturnStats {
  $: {
    no: number;
    yds: number;
    td: number;
    long: number;
  };
}

interface IScoringStats {
  $: {
    fg?: number;
    td?: number;
    patkick?: number;
  };
}

interface ITotals {
  $?: {
    totoff_plays?: number;
    totoff_yards?: number;
    totoff_avg?: number;
  };
  firstdowns: IFirstDownStats[];
  penalties: IPenaltyStats[];
  conversions: IConversionStats[];
  fumbles: IFumbleStats[];
  misc: IMiscStats[];
  redzone: IRedzoneStats[];
  rush: IRushStats[];
  pass: IPassStats[];
  rcv: IReceivingStats[];
  punt: IPuntStats[];
  ko: IKickoffStats[];
  fg?: IFieldgoalStats[];
  pat?: IPointAfterStats[];
  defense: IDefenseStats[];
  kr?: ICommonReturnStats[];
  pr?: ICommonReturnStats[];
  ir?: ICommonReturnStats[];
  fr?: ICommonReturnStats[];
  scoring?: IScoringStats[];
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
    opos?: string;
    dpos?: string;
    code: string | number;
  };
  rcv?: IReceivingStats[];
  rush?: IRushStats[];
  pass?: IPassStats[];
  defense?: IDefenseStats[];
  kr?: ICommonReturnStats[];
  fumbles?: IFumbleStats[];
  ir?: ICommonReturnStats[];
  scoring?: IScoringStats[];
  ko?: IKickoffStats[];
  fg?: IFieldgoalStats[];
  pat?: IPointAfterStats[];
  punt?: IPuntStats[];
  pr?: ICommonReturnStats[];
  fr?: ICommonReturnStats[];
  misc?: IMiscStats[];
}

export interface IQuarterSummary {
  $: {
    vh: VH;
    id: string;
  };
  firstdowns?: [IFirstDownStats];
  penalties?: [IPenaltyStats];
  conversions?: [IConversionStats];
  fumbles?: [IFumbleStats];
  misc?: [IMiscStats];
  redzone?: [IRedzoneStats];
  rush?: [IRushStats];
  pass?: [IPassStats];
  rcv?: [IReceivingStats];
  punt?: [IPuntStats];
  ko?: [IKickoffStats];
  fg?: [IFieldgoalStats];
  pat?: [IPointAfterStats];
  defense: [IDefenseStats];
  kr?: [ICommonReturnStats];
  pr?: [ICommonReturnStats];
  ir?: [ICommonReturnStats];
  fr?: [ICommonReturnStats];
  scoring?: [IScoringStats];
}
