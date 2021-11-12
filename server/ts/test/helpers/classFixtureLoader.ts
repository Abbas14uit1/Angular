import * as jsonfile from "jsonfile";
import * as _ from "lodash";
import * as path from "path";
import * as pify from "pify";

// classes
import { Game } from "../../src/lib/importer/statcrew/football/game";
import { Play } from "../../src/lib/importer/statcrew/football/play";
import { Player } from "../../src/lib/importer/statcrew/football/player";
import { Team } from "../../src/lib/importer/statcrew/football/team";

// interfaces
import { IGame, IPlay, IPlayer, ITeam } from "../../../../typings/athlyte/football";

const gamePath = path.join(__dirname, "..", "fixtures", "json", "parsed", "game.json");
const playersPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "players.json");
const playsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "plays.json");
const teamsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "teams.json");
const teamGamesPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "teamGames.json");

export async function getGameData(): Promise<IGame> {
  const game: IGame = await pify(jsonfile.readFile)(gamePath);
  game.gameDate = new Date(game.gameDate);
  return game;
}

export async function getPlayersData(): Promise<IPlayer[]> {
  const players: IPlayer[] = await pify(jsonfile.readFile)(playersPath);
  players.forEach((player) => {
    const games = player.games;
    games.forEach((game) => game.gameDate = new Date(game.gameDate));
  });
  return players;
}

export async function getPlaysData(): Promise<IPlay[]> {
  const plays: IPlay[] = await pify(jsonfile.readFile)(playsPath);
  return plays;
}

/**
 * Returns array with only one team
 */
export async function getTeamData(): Promise<ITeam[]> {
  const teams: ITeam[] = await pify(jsonfile.readFile)(teamsPath);
  teams.forEach((team) => {
    const game = team.games;
    //games.forEach((game) => {
      game.gameDate = new Date(game.gameDate);
    //});
  });
  return teams;
}


export async function getTeamGamesData(): Promise<any[]> {
  const teamGames: any[] = await pify(jsonfile.readFile)(teamGamesPath);
  return teamGames;
}