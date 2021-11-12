import { IDidNotPlay } from "./dnp.d";
import { IFGA } from "./fga.d";
import { IMessage } from "./message.d";
import { IScore } from "./scores.d";
import { ITeam } from "./team.d";
import { IVenue } from "./venue.d";

export interface IStatcrewFootballJSON {
  $: IMetaStats;
  gametracker?: [{ $: { gameid: string } }];
  venue: [IVenue];
  team: ITeam[];
  scores: [{ score: IScore[] }];
  fgas: [{ fga: IFGA[] }];
  message: IMessage[];
  dnp: IDidNotPlay[];
}

interface IMetaStats {
  source: string;
  version: string;
  generated: string;
}
