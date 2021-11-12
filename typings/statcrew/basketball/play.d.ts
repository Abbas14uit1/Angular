import { ISpecial, ISummary, VH } from "./team.d";

export interface IPlays {
  $: {
    format: string;
  }
 period: IPeriod[];
}

interface IPeriod {
  $: {
    number: number;
    time: string;
  }
  special: ISpecial[];
  summary: ISummary[];
  play: ISinglePlay[];
  clock: IClock[];
}

interface IClock {
  $: {
    time: string;
  }
}

interface ISinglePlay {
  $: {
    vh: VH;
    time: string; 
    uni: number;
    seq: number;
    team: string;
    checkname: string;    
    action: string;
    type?: string;    
    vscore?: number;
    hscore?: number;
    paint?: string;
    fastb?: number;
    
  };
  
}

interface IPeriodStart {
  $: {
    number: number;
    time: string;
    
  }
}

