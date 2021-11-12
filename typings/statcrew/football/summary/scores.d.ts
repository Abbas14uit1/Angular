import { VH } from "./team.d";

export interface IScore {
  $: IScoreFG | IScoreTD | IScoreBase;
}

interface IScoreBase {
  vh: VH;
  team: string;
  qtr: number;
  clock: string;
  type: string;
  yds?: number;
  scorer?: string;
  plays?: number;
  drive?: number;
  top: string;
  vscore: number;
  hscore: number;
  driveindex: number;
}

interface IScoreFG extends IScoreBase {
  type: "FG";
}

interface IScoreTD extends IScoreBase {
  type: "TD";
  how: string; // "PASS", "INT", ...
  passer?: string;
  patby: string;
  pattype: string; // "KICK" or ???
  patres: string; // "GOOD" or ???
}
