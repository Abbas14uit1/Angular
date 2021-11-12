import { VH } from "./team.d";
import { IPlayer } from "./team.d";

export interface IDidNotPlay {
  $: {
    vh: VH;
    id: string;
  };
  player: [IPlayer];
}
