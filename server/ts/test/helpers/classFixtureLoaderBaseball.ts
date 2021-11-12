import * as jsonfile from "jsonfile";
import * as _ from "lodash";
import * as path from "path";
import * as pify from "pify";

// classes
import { Game } from "../../src/lib/importer/statcrew/baseball/game";
import { Play } from "../../src/lib/importer/statcrew/baseball/play";
import { Player } from "../../src/lib/importer/statcrew/baseball/player";
import { Team } from "../../src/lib/importer/statcrew/baseball/team";

// interfaces
import { IGame, IPlay, IPlayer, ITeam } from "../../../../typings/athlyte/baseball";

const gamePath = path.join(__dirname, "..", "fixtures", "json", "parsed", "gameBaseball.json");
const playersPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "playersBaseball.json");
const playsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "playsBaseball.json");
const teamsPath = path.join(__dirname, "..", "fixtures", "json", "parsed", "teamsBaseball.json");

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
    const games = team.games;
    //games.forEach((game) => {
    games.gameDate = new Date(games.gameDate);
    //});
  });
  return teams;
}
