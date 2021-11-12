import { IGame } from "./game.d";
import { IPlay } from "./play.d";
import { IPlayer } from "./player.d";
import { ITeam } from "./team.d";

export interface IPlayerGameStats {
  _id: string;
  name: string;
  teamId: string;
  teamName: string;
  games: IQueryGame[];
}

export interface IPlayerSeasonStats {
  _id: {
    _id: string,
    name: string,
    teamName: string,
    teamId: string,
    season: number;
  };
  stat: number;
}

export interface IPlayerCareerStats {
  _id: {
    _id: string,
    name: string,
    teamName: string,
    teamId: string,
  };
  stat: number;
}

export interface IPlayerGameRows {
  _id: string;
  name: string;
  teamName: string;
  teamId: string;
  season: number;
  game: string | undefined;
  gameId: string;
  stat: number;
}

export interface ITeamStats {
  player: ITeam;
  statName: string;
  statValue: number;
  season?: number;
  game?: IGame;
  drive?: number;
  quarter?: number;
  play?: IPlay;
}

interface IQueryGame {
  season: number;
  stats: any;
  gameId: string;
}
