import { IPeriodSummaries } from "./periodSummary.d";
import { IPlays } from "./play.d";
import { IScore } from "./scores.d";
import { ITeam } from "./team.d";
import { IStatus } from "./status.d";
import { IVenue } from "./venue.d";

export interface IStatcrewBasketballJSON {
  $: IMetaStats;
  gametracker?: [{ $: { gameid: string } }];
  venue: [IVenue];
  status: IStatus;
  team: ITeam[];
  byprdsummaries: [IPeriodSummaries];  
  plays: IPlays[];  
}

interface IMetaStats {
  source: string;
  version: string;
  generated: string;
}
