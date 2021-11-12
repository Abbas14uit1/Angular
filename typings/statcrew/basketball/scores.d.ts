import { VH } from "./team.d";

export interface IScore {
  $: IScoreBase;
}

interface IScoreBase {
  vh: VH;
  team: string;
  clock: string;
  type: string;
  vscore: number;
  hscore: number;
  checkname: string;
}

