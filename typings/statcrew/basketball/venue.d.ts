export interface IVenue {
  $: IMetaVenueStats;
  officials: [{ $: IVenueOfficials }];
  notes: INote[];
  rules: [{ $: IVenueRules }];
}

interface IMetaVenueStats {
  gameid: string;
  sportcode: "MBB" | "WBB";
  visid: string;
  homeid: string;
  visname: string;
  homename: string;
  date: string;
  location: string;
  time: string;
  attend: number;
  schednote: string;  
  start: string;
  end: string;
  duration: string;
  leaguegame?: string;
  neutralgame?: string;
  postseason?: string;
  gametype: string;
  
}

interface IVenueOfficials {
  text: string;
}

interface IVenueRules {
  prds: number;
  minutes: number;
  minutesot: number;
  fouls: number;
  qh: string;

}

export interface INote {
  $ :{
    text: string;
  }
}