import * as moment from "moment";
import * as mongo from "mongodb";

import * as Athlyte from "../../../../../../../typings/athlyte/football";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { AthlyteImporter, VH } from "../../AthlyteImporter";

import { winstonLogger } from "../../../winstonLogger";
import { checkInputData } from "../helpers/checkData";
import { Game } from "./game";
import { parsePlays, Play } from "./play";
import { Player } from "./player";
import { Team } from "./team";
import { TeamGame } from "./teamGame";

import { IPlayer } from "../../../../../../../typings/athlyte/football/player.d";
import { IPlayer as StatcrewPlayer } from "../../../../../../../typings/statcrew/football/team.d";
/**
 * StatcrewImportCoordinator runs the entire import process for statcrew XML data.
 * It creates a new instances of game, play, team, and players classes and parses the data into each class.
 * It then controls the registering of dependents, generating mongo ids, updating the dependents, and then saving
 */
export class FootballImporter extends AthlyteImporter {
  private game: Game;
  private plays: Play[];
  private players: {
    homePlayers: Player[],
    visitorPlayers: Player[],
  };
  private teams: {
    home: Team,
    visitor: Team,
  };
  private teamGames: {
    home: TeamGame,
    visitor: TeamGame,
  };

  constructor() {
    super();
    this.game = new Game();
    this.plays = [];
    this.players = {
      homePlayers: [],
      visitorPlayers: [],
    };
    this.teams = {
      home: new Team(),
      visitor: new Team(),
    };
    this.teamGames = {
      home: new TeamGame(),
      visitor: new TeamGame(),
    };
  }

  /**
   * returns the parsedData from each game, play, team, and player class
   * Represents the full scope of data saved from a game
   */
  public getParsedData(): Athlyte.IStats {
    return {
      game: this.game.parsedData,
      homePlayers: this.players.homePlayers.map((player) => player.parsedData),
      visitorPlayers: this.players.visitorPlayers.map((player) => player.parsedData),
      plays: this.plays.map((play) => play.parsedData),
      team: {
        home: this.teams.home.parsedData,
        away: this.teams.visitor.parsedData,
      },
      teamGames: {
        home: this.teamGames.home.parsedData,
        away: this.teamGames.home.parsedData,
      }
    };
  }

  /**
   * Parse Statcrew data into Game, Team, Players, and Plays.
   * Most information included in Plays.
   */
  public parse(input: IStatcrewFootballJSON): void {
    const gameDate: Date = moment(input.venue[0].$.date, "MM/DD/YYYY").toDate();
    let playsExist = false;
    

    if ('plays' in input && input.plays.length > 0){
      this.plays = parsePlays(input.plays[0]);  
      playsExist = true;
    }


    const actualDate: string = input.venue[0].$.date;
    /* istanbul ignore if:  No Statcrew files have "H" as the first property in the file*/
    if (input.team[0].$.vh === "H") {
      this.teams.home.parse(input.team[0], input.team[1], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teams.visitor.parse(input.team[1], input.team[0], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teamGames.home.parse(input.team[0], input.team[1], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teamGames.visitor.parse(input.team[1], input.team[0], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);

      this.players.homePlayers = input.team[0].player.map((player) => {
        const playerClass = new Player();
        playerClass.parse(player,
          input.team[0].$.code,
          input.team[0].$.name,
          input.team[0].$.conf,
          input.team[0].$.confdivision,
          input.team[0].$.id,
          input.team[1].$.code,
          input.team[1].$.name,
          input.team[1].$.conf,
          input.team[1].$.confdivision,
          VH.home,
          gameDate, actualDate);
        return playerClass;
      });
      this.players.visitorPlayers = input.team[1].player.map((player) => {
        const playerClass = new Player();
        playerClass.parse(player,
          input.team[1].$.code,
          input.team[1].$.name,
          input.team[1].$.conf,
          input.team[1].$.confdivision,
          input.team[1].$.id,
          input.team[0].$.code,
          input.team[0].$.name,
          input.team[0].$.conf,
          input.team[0].$.confdivision,
          VH.visitor,
          gameDate, actualDate);
        return playerClass;
      });
    } else {
      // note the swapped array indices
      this.teams.home.parse(input.team[1], input.team[0], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teams.visitor.parse(input.team[0], input.team[1], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teamGames.home.parse(input.team[1], input.team[0], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.teamGames.visitor.parse(input.team[0], input.team[1], input.venue[0], playsExist?input.plays[0].qtr:undefined, gameDate, actualDate);
      this.players.homePlayers = input.team[1].player.map((player) => {
        const playerClass = new Player();
        playerClass.parse(player,
          input.team[1].$.code,
          input.team[1].$.name,
          input.team[1].$.conf,
          input.team[1].$.confdivision,
          input.team[1].$.id,
          input.team[0].$.code,
          input.team[0].$.name,
          input.team[0].$.conf,
          input.team[0].$.confdivision,
          VH.home,
          gameDate, actualDate);
        return playerClass;
      });
      this.players.visitorPlayers = input.team[0].player.map((player) => {
        const playerClass = new Player();
        playerClass.parse(player,
          input.team[0].$.code,
          input.team[0].$.name,
          input.team[0].$.conf,
          input.team[0].$.confdivision,
          input.team[0].$.id,
          input.team[1].$.code,
          input.team[1].$.name,
          input.team[1].$.conf,
          input.team[1].$.confdivision,
          VH.visitor,
          gameDate, actualDate);
        return playerClass;
      });
    }
    this.game.parse(input.venue[0], input.team, input.drives[0].drive, this.plays.map((play) => play.parsedData));
  }

  /**
   * Save game, play, team, and player classes to the database
   * Orchestrates the process of registering dependents, generating mongo ids, and then updating dependents
   * Finally, saves all the classes to the database
   * @param db mongo database
   */
  public async saveToMongo(db: mongo.Db) {

    // team IDs
    const homeId = await this.teams.home.generateId(db);
    const visitorId = await this.teams.visitor.generateId(db);

    const homeGameId = await this.teamGames.home.generateId(db);
    const visitorGameId = await this.teamGames.visitor.generateId(db);

    // player IDs (done before registering so that only new players are registered to a team)
    for (const player of this.players.homePlayers) {
      player.updateTeamRef(homeId)
      const id = await player.generateId(db);
      player.populateId(id);
    }
    for (const player of this.players.visitorPlayers) {
      player.updateTeamRef(visitorId)
      const id = await player.generateId(db);
      player.populateId(id);
    }

    registerAllDependents(
      this.game, this.teams.home, this.teams.visitor,
      this.players.homePlayers, this.players.visitorPlayers, this.plays, 
      this.teamGames.home, this.teamGames.visitor,
    );

    // game id
    const gameId = await this.game.generateId(db);
    this.game.populateId(gameId);
    this.game.updateDependents();

    // team IDs
    // const homeId = await this.teams.home.generateId(db);
    // const visitorId = await this.teams.visitor.generateId(db);
    this.teams.home.populateId(homeId);
    this.teams.visitor.populateId(visitorId);
    this.teams.home.updateDependents();
    this.teams.visitor.updateDependents();

    this.teamGames.home.populateId(homeGameId);
    this.teamGames.visitor.populateId(visitorGameId);

    // play IDs
    for (const play of this.plays) {
      // Don't use a forEach here; https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
      const id = await play.generateId(db);
      play.populateId(id);
      play.updateDependents();
    }

    // ids generated so updates all of the dependents with the ids
    this.players.homePlayers.forEach((player) => {
      player.updateDependents();
    });
    this.players.visitorPlayers.forEach((player) => {
      player.updateDependents();
    });
    // checks to see if the game is in the db and if so removes it so that we do not duplicate the data
    if (this.game.getAlreadyExists()) {
      await this.removeGame(db);
      winstonLogger.log("info", "Removing existing game from DB");
    }
    // get IDs back from successful saves
    return await saveGameComponents(
      db, this.players.homePlayers.concat(this.players.visitorPlayers),
      this.game, this.teams.home, this.teams.visitor, this.plays, this.teamGames.home, this.teamGames.visitor);
  }

  /**
   * Removes all of the data associated with a game from the database
   * This is used before saving a game to make sure the game information is not duplicated
   * @param db mongo database
   */
  public async removeGame(db: mongo.Db) {
    const teamDelete = await db.collection("teams").updateMany({}, { $pull: { games: this.game.getId() } });
    const playerDelete = await db.collection("players")
      .updateMany({"games.gameId": this.game.getId()}, { $pull: { games: { gameId: this.game.getId() } } });
    const playDelete = await db.collection("plays").deleteMany({ gameId: this.game.getId() });
    const gameDelete = await db.collection("games").deleteOne({ _id: this.game.getId() });
    const teamGameDelete = await db.collection("teamGames").deleteMany({ gameId: this.game.getId() });

    return [teamDelete, playerDelete, playDelete, gameDelete, teamGameDelete];
  }

  /**
   * updates the status to the game schedule database
   * @param db mongo database
   * @param input input statscrew files in json format
   * @param uploadStatus status of the upload. Allowed values "upload_initiated" | "upload_success" | "upload_failed"
   */
  public async updateUploadStatusSchedule(
    db: mongo.Db, input: IStatcrewFootballJSON, uploadStatus: "upload_initiated" | "upload_success" | "upload_failed") {
    const playedDate: string = moment(input.venue[0].$.date, "MM/DD/YYYY").format("MM/DD/YYYY");
    const team1: number = input.team[0].$.code;
    const team2: number = input.team[1].$.code;
    const query = { gameDate: playedDate, teamCode: "" + team1, oppoTeamCode: "" + team2, sportCode: "MFB" };
    const status = { $set: { status: uploadStatus } };
    const result = await db.collection("GameSchedules").update(query, status);

    const reverseQuery = { gameDate: playedDate, teamCode: "" + team2, oppoTeamCode: "" + team1, sportCode: "MFB" };
    const reverseResult = await db.collection("GameSchedules").update(reverseQuery, status);
  }

}

/**
 * Update in upload in progress to game schedule.
 * This is used to set the status in the gameschedule colletion.
 * @param db mongo database
 * @param input statcrew football json
 */



/**
 * Saves all of the various components of a game to the database
 * @param db mongo database
 * @param players player classes to save
 * @param game game to save
 * @param homeTeam home team to save
 * @param visitingTeam visiting team to save
 * @param plays plays to save
 * @return the ids of the players, game, teams, and plays successfully save into the database
 */
export async function saveGameComponents(
  db: mongo.Db, players: Player[], game: Game,
  homeTeam: Team, visitingTeam: Team, plays: Play[],
  homeGameTeam: TeamGame, visitingGameTeam: TeamGame,
) {
  // batch the players by if they are new or not
  const existingPlayers: Player[] = [];
  const newPlayers: Player[] = [];
  for (const player of players) {
    if (player.getAlreadyExists()) {
      existingPlayers.push(player);
    } else {
      newPlayers.push(player);
    }
  }
  // gets the information necessary to save or update the player
  const existingPlayerUpdates = existingPlayers.map((player) => player.prepareForBatchSave());
  const newPlayerInserts = newPlayers.map((player) => player.prepareForBatchSave());

  try {
    let existingCommand = Promise.resolve();
    let insertedCommand = Promise.resolve();
    if (existingPlayerUpdates.length > 0) {
      // Update command requires > 0 updates or will throw an error
      existingCommand = db.command({
        update: "players",
        updates: existingPlayerUpdates,
        ordered: true, // true = bail out if any update fails
      }).catch()
        .then(() => { return; });
    }
    if (newPlayerInserts.length > 0) {
      // insertMany requires > 0 docs or will throw an error
      insertedCommand = db.collection("players").insertMany(newPlayerInserts)
        .catch()
        .then(() => { return; });
    }

    const gameId = await game.save(db);
    let playIds: string[] = [];
    if (plays.length > 0){
      playIds = await db.collection("plays").insertMany((plays.map((play) => play.prepareForBatchSave())))
      .then(() => plays.map((play) => play.getId()));  
    }
    
    const [updatePlayerIds, newPlayerIds] = await Promise.all([
      existingCommand.then(() => existingPlayers.map((player) => player.getId())),
      insertedCommand.then(() => newPlayers.map((player) => player.getId())),
    ]);
    const homeId = await homeTeam.save(db);
    const visitorId = await visitingTeam.save(db);

    const homeGameId = await homeGameTeam.save(db);
    const visitorGameId = await visitingGameTeam.save(db);

    return { gameId, playIds, playerIds: updatePlayerIds.concat(newPlayerIds), homeId, visitorId, homeGameId, visitorGameId };
  } catch (err) {
    // rethrow
    /* istanbul ignore next */
    throw err;
  }
}

/**
 * Register all dependents in the correct order so that each has the proper ID to refer to others
 * @param game
 * @param homeTeam
 * @param visitingTeam
 * @param homePlayers
 * @param visitorPlayers
 * @param plays
 */
export function registerAllDependents(
  game: Game, homeTeam: Team, visitingTeam: Team,
  homePlayers: Player[], visitorPlayers: Player[], plays: Play[],
  homeGameTeam: TeamGame, visitingGameTeam: TeamGame
): void {
  // games
  game.registerDependents([homeTeam, visitingTeam, homeGameTeam, visitingGameTeam]);
  game.registerDependents(homePlayers.concat(visitorPlayers));
  game.registerDependents(plays);
  // plays
  plays.forEach((play) => {
    homePlayers.concat(visitorPlayers).forEach((player) => {
      if (play.parsedData.results.playersInvolved
        .indexOf(player.parsedData.games[0].codeInGame) !== -1) {
        play.registerDependents([player]);
        player.registerDependents([play]);
      }
    });
    play.registerDependents([game]);
  });
  // teams (only register a player to a team if they are new to the DB)
  homeTeam.registerDependents([game, homeGameTeam]);
  homeTeam.registerDependents(homePlayers.filter((player) => !player.getAlreadyExists()));
  visitingTeam.registerDependents([game, visitingGameTeam]);
  visitingTeam.registerDependents(visitorPlayers.filter((player) => !player.getAlreadyExists()));

  // homeGameTeam.registerDependents([game]);
  // homeGameTeam.registerDependents(homePlayers.filter((player) => !player.getAlreadyExists()));
  // visitingGameTeam.registerDependents([game]);
  // visitingGameTeam.registerDependents(visitorPlayers.filter((player) => !player.getAlreadyExists()));

  // players
  // Note: players have already been registered to plays they were in
  homePlayers.forEach((player) => {
    player.registerDependents([homeTeam, game, homeGameTeam]);
  });
  visitorPlayers.forEach((player) => {
    player.registerDependents([visitingTeam, game, visitingGameTeam]);
  });
}
