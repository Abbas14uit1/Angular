import { VH } from "./team.d";

export interface IDrive {
  $: {
    vh: VH;
    team: string;
    start: string;
    end: string;
    plays: number;
    yards: number;
    top: string; // time
    driveindex: number;
    rz?: number;
    start_how?: string;
    start_qtr?: number;
    start_time?: string;
    start_spot?: string;
    end_how?: string;
    end_qtr?: number;
    end_time?: string;
    end_spot?: string;
  };
}
