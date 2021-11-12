import { IDidNotPlay } from "./dnp.d";
import { IDrive } from "./drive.d";
import { IFGA } from "./fga.d";
import { ILongplay } from "./longplay.d";
import { IMessage } from "./message.d";
import { IAllPlaysSummary } from "./play.d";
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
  drives: [{ drive: IDrive[] }];
  plays: IAllPlaysSummary[];
  message: IMessage[];
  dnp: IDidNotPlay[];
  longplays: ILongplay;
}

interface IMetaStats {
  source: string;
  version: string;
  generated: string;
}
