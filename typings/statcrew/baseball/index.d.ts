import { IAllPlaysSummary } from "./play.d";
import { ITeam } from "./team.d";
import { IVenue } from "./venue.d";

export interface IStatcrewBaseballJSON {
  $: IMetaStats;
  gametracker?: [{ $: { gameid: string } }];
  venue: IVenue[];
  team: ITeam[];
  plays: IAllPlaysSummary[];
}

declare interface IMetaStats {
  source: string;
  version: string;
  generated: string;
}
