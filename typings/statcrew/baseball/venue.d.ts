export interface IVenue {
  $: IMetaVenueStats;
  //officials: [{ $: IVenueUmpires }];
  umpires: [{ $: IVenueUmpires }];
  rules: [{ $: IVenueRules }];
}

declare interface IMetaVenueStats {
  gameid: string;
  sportcode: "MBA" | "WSB";
  visid: string;
  homeid: string;
  visname: string;
  homename: string;
  date: string;
  location: string;
  stadium: string;
  start: string;
  end?: string;
  neutralgame?: string;
  nitegame?: string;
  duration: string;
  attend: number;
  temp?: number;
  wind?: string;
  dhgame?: string;
  series: string;
  schednote: string;
  leaguegame?: string;
  postseason?: string;
  weather: string;
  schedinn: number;
  gametype: string;
}

declare interface IVenueUmpires {
  hp: string;
  first: string;
  second: string;
  third: string;
  lf: string;
  rf: string;
  [key: string]: string;
}

interface IVenueRules {
  batters: string;
  usedh: string;
}
