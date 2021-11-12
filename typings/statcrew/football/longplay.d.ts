import { VH } from "./team.d";

export interface ILongplay {
  $: {
    thresh: number;
  };
  longplay: [{
    $: {
      vh: VH;
      id: string;
      yds: number;
      play: string;
      players: string;
      td: string; // Y or N
    };
  }];
}
