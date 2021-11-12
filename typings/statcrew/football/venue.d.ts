export interface IVenue {
  $: IMetaVenueStats;
  officials: [{ $: IVenueOfficials }];
  rules: [{ $: IVenueRules }];
}

interface IMetaVenueStats {
  gameid: string;
  visid: string;
  homeid: string;
  visname: string;
  homename: string;
  date: string;
  location: string;
  stadium: string;
  start: string;
  end: string;
  neutralgame?: string;
  nitegame?: string;
  duration: string;
  attend: number;
  temp: number;
  wind?: string;
  gametype: string;
  leaguegame?: string;
  postseason?: string;
  weather: string;
}

interface IVenueOfficials {
  ref: string;
  ump: string;
  line: string;
  lj: string;
  bj: string;
  fj: string;
  sj: string;
  cj: string;
  alt: string;
  [key: string]: string;
}

interface IVenueRules {
  qtrs: number;
  mins: number;
  downs: number;
  yds: number;
  kospot: number;
  tbspot: number;
  kotbspot: number;
  patspot: number;
  safspot: number;
  td: number;
  fg: number;
  pat: number;
  patx: number;
  saf: number;
  defpat: number;
  rouge: number;
  field: number;
  toh: number;
  sackrush: string;
  fgaplay: string;
  netpunttb: string;
}
