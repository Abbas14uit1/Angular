import { VH } from "./team.d";

export interface IFGA {
  $: {
    vh: VH;
    team: string;
    kicker: string;
    qtr: number;
    clock: string;
    distance: number;
    result: string; // "good" or ...
  };
}
