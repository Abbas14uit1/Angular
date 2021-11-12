import { IQuarterSummary, VH } from "./team.d";

export interface IAllPlaysSummary {
  $: {
    format: string;
  };
  qtr: [IQuarter];
  downtogo: [{
    $: {
      context: string;
      qtr: string;
      clock: string;
      vtoh: number;
      htoh: number;
      hasball?: string;
      id?: string;
      down?: number;
      togo?: number;
      spot?: string;
      lastplay?: string;
    };
  }];
}

export interface IQuarter {
  $: {
    number: number;
    text: string;
  };
  play: ISinglePlaySummary[];
  score: IQuarterScore[];
  drivestart: IDriveStart[];
  drivesum: IDriveSummary[];
  qtrsummary: IQuarterSummary[];
  endqtr: [{}];
  comment?: IComment[];
}

export interface ISinglePlaySummary {
  $: {
    context: string;
    playid: string;
    type?: string;
    first?: string;
    turnover?: string;
    score?: string;
    hscore?: number;
    vscore?: number;
    clock?: string;
    pcode?: string;
    tokens: string;
    text: string;
    hasball?: string;
    down?: number;
    togo?: number;
    spot?: string;
    newcontext?: string;
    ob?: string;
  };
  p_ko?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
      result?: string;
      fc?: string;
    }
  }]
  p_kr?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
    }
  }]
  p_tk?: [{
    $?: {
      vh?: VH;
      name?: string;
      sack?: string;
      assist?: string;
      ff?: string;
    }
  }]
  p_ru?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
    }
  }]
  p_pa?: [{
    $?: {
      vh?: VH;
      qb?: string;
      result?: string;
      rcv?: string;
      gain?: number;
    }
  }]
  p_bu?: [{
    $?: {
      vh?: VH;
      name?: string;
    }
  }]
  p_pu?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
      tb?: string;
      in20?: string;
      fc?: string;
      ob?: string;
    }
  }]
  p_pn?: [{
    $?: {
      vh?: VH;
      name?: string;
      code?: string;
      type?: string;
      result?: string;
      at?: string;
      yards?: number;
    }
  }]
  p_fg?: [{
    $?: {
      vh?: VH;
      name?: string;
      distance?: number;
      result?: string;
      score?: string;
    }
  }]
  p_qbh?: [{
    $?: {
      vh?: VH;
      name?: string;
    }
  }]
  p_fumb?: [{
    $?: {
      vh?: VH;
      name?: string;
      at?: string;
      frvh?: VH;
      frname?: string;
    }
  }]
  p_fr?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
    }
  }]
  p_ir?: [{
    $?: {
      vh?: VH;
      name?: string;
      at?: string;
      gain?: number;
    }
  }]
  p_pat?: [{
    $?: {
      vh?: VH;
      name?: string;
      qb?: string;
      type?: string;
      result?: string;
      score?: string;
    }
  }]
  p_to?: [{
    $?: {
      vh?: VH;
      team?: string;
    }
  }]
  p_pr?: [{
    $?: {
      vh?: VH;
      name?: string;
      gain?: number;
    }
  }]
  p_cont?: [{
    $: {
      vh?: VH;
      name?: string;
      context?: string;
      at?: string;
      gain?: number;
    }
  }]
}

export interface IQuarterScore {
  $: {
    V: number;
    H: number;
    qtr?: number;
    final?: number;
  };
}

export interface IDriveStart {
  $: {
    poss: string;
    vh: VH;
    spot: string;
    clock: string;
    driveindex: string;
  }
}

export interface IDriveSummary {
  $: {
    plays: number;
    yards: number;
    top: string;
    driveindex: number;
    complete: string;
  }
}

export interface IComment {
  $: {
    text: string;
  }
}
