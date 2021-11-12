import { VH } from "./team.d";

export interface IAllPlaysSummary {
  $: {
    format: string;
  };
  inning: IInning[];
}

interface IInning {
  $: {
    number: number;
  };
  batting: IBatting[];
}

interface IBatting {
  $: {
    vh: VH;
    id: string;
  };
  play: IPlay[];
  innsummary: IInningSummary[];
}

interface ISub {
  $: {
    vh: VH;
    spot: number;
    who: string;
    for: string;
    whocode: string;
    forcode:string;
    pos: string;
  }
}

interface IPlay {
  $: {
    seq: number;
    outs: number;
    batter: string;
    batprof: string;
    pitcher: string;
    pchprof: string;
  };
  sub?: ISub[];
  batter?: IBatter[];
  pitcher?: IPitcher[];
  pitches?: IPitches[];
  fielder?: IFielder[];
  runner?: IRunner[];
  narrative: INarrative[];
}

interface IInningSummary {
  r: number;
  h: number;
  e: number;
  lob: number;
}

interface INarrative {
  $: {
    text: string;
  };
}


interface IBatter {
  $:{
    name: string;
    action: string;
    code: string;
    out: number;
    adv: number;
    tobase: number;
    ab: number;
    k?: number;
    kl?: number;
    flyout?: number;
    wherehit?: number;
  }
}

interface IPitcher {
  $: {
    name: string;
    code: string;
    bf: number;
    ip: number;
    ab: number;
    k?: number;
    kl?: number;
    flyout?: number;

  }
}

interface IPitches {
  $: {
    text: string;
    b: number;
    s: number;
  }
}

interface IFielder {
  $: {
    pos: string;
    name: string;
    code: string;
    po?: number;
    a?: number;

  }
}

interface IRunner {
  $: {
    base: number;
    name: string;
    code: string;
    action: string;
    out: number;
    adv: number;
    tobase: number;
    scored?: number;
    por?: string;
  }
}