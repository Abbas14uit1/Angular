export interface ISeasonGame {
  _id: string;
  date: string;
  opponentTidyName: string;
  opponentCode: string;
  teamScore: number;
  opponentScore: number;
  isHome: boolean;
}

export interface ISeasonGameDisplay {
  _id: string;
  date: string;
  venue: string;
  opponent: string;
  result: string;
  score: string;
  status: string;
}