import * as mongo from "mongodb";

import { StatcrewImportBase } from "../StatcrewImportBase";
import { Game } from "./game";
import { Play } from "./play";
import { Team } from "./team";

import { winstonLogger } from "../../../winstonLogger";
import { VH } from "../../AthlyteImporter";
import { parsePlayer } from "../helpers/playerParser";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteCommon from "../../../../../../../typings/athlyte/football/common-stats.d";
import * as AthlytePlayer from "../../../../../../../typings/athlyte/football/player.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/football/team.d";
import { match } from "minimatch";
import { TeamGame } from "./teamGame";

/**
 * Player class manages the entire lifecycle of player data,
 * from import from Statcrew JSON through saving to Mongo
 */
export class Player extends StatcrewImportBase {
  public parsedData: Athlyte.IPlayer;
  /**
   * Games, plays, and teams need to know a player's ID before they are saved to Mongo
   */
  public dependents: Array<Game | Play | Team | TeamGame>;
  private alreadyExists: boolean;
  private initialized: boolean;
  private readonly playerClass: string[] = ["FR", "SO", "JR", "SR"];

  constructor() {
    super();
    this.dependents = [];
    this.alreadyExists = false;
    this.initialized = false;
    this.parsedData = {
      _id: undefined,
      games: [],
      teamId: undefined,
    } as any;
  }

  /**
   * Check whether a player already exists in Mongo
   */
  public getAlreadyExists(): boolean {
    if (this.initialized === false) {
      throw new Error("Trying to check existance before checking the DB for the ID");
    } else {
      return this.alreadyExists;
    }
  }

  /* istanbul ignore next */
  /**
   * Manually set a player as existing/ not existing in database.
   * Note: This should only be used in testing!
   * @param exists Boolean indicating whether a player already exists in DB
   */
  public _setAlreadyExists(exists: boolean): void {
    this.alreadyExists = exists;
    this.initialized = true;
  }

  /**
   * Prepare dynamic player data (data which may change from game to game)
   * for saving to Mongo
   */
  public prepareDynamicData(): AthlytePlayer.IPlayerDynamicData {
    if (this.parsedData.games.length === 0) {
      throw new Error("Trying to save data before all fields have been populated");
    } else {
      return {
        games: this.parsedData.games,
      };
    }
  }

  /**
   * Prepare static player data (data which does not change from game to game)
   * for saving to Mongo
   */
  public prepareStaticData(): AthlytePlayer.IPlayerStaticData {
    if (this.parsedData._id === undefined || this.parsedData.teamId === undefined) {
      throw new Error("Trying to save data before all fields have been populated");
    } else {
      return {
        _id: this.parsedData._id,
        name: this.parsedData.name,
        sportCode: "MFB",
        teamCode: this.parsedData.teamCode,
        playerId: this.parsedData.playerId,
        teamId: this.parsedData.teamId,
        teamName: this.parsedData.teamName,
        teamConference: this.parsedData.teamConference,
        teamConferenceDivision: this.parsedData.teamConferenceDivision,
        teamTidyName: this.parsedData.teamTidyName,
        tidyName: this.parsedData.tidyName,
      };
    }
  }

  /**
   * Mark a player as being involved in a play (ex: threw a pass) by adding
   * the ID of that play to the player's list of plays.
   * @param id ID of the play involving this player
   */
  public updatePlayRef(id: string) {
    this.parsedData.games[0].plays.push(id);
  }

  /**
   * Mark a player as being involved in a game, regardless of
   * whether they started or played.
   * @param id ID of the game involving this player
   */
  public updateGameRef(id: string) {
    this.parsedData.games[0].gameId = id;
  }

  /**
   * Mark a player as being a member of a team; technically only
   * necessary for the static (initial) data.
   * @param id ID of the team this player belongs to
   */
  public updateTeamRef(id: string) {
    this.parsedData.teamId = id;
  }

  /**
   * Update the dependents of this player.
   * Calling this function will pass the ID of this player to the instances
   * of <Team|Player|Game>Class that need to know this player's ID before saving.
   */
  public updateDependents() {
    for (const dependent of this.dependents) {
      if (dependent instanceof Team ||
        dependent instanceof Game || 
        dependent instanceof TeamGame ) {
        dependent.updatePlayerRef(this.getId());
      } else if (dependent instanceof Play) {
        dependent.updatePlayerRef(this.getId(), this.parsedData.games[0].codeInGame);
      } else {
        throw new Error("Dependents of player must be team or play");
      }
    }
  }

  /**
   * Parses the player information using a helper function
   * @param player the player information to parse
   * @param teamName name of the team the player is on
   * @param side visitor or home of team
   * @param gameDate date of the game
   */
  public parse(
    player: StatcrewTeam.IPlayer,
    teamCode: number,
    teamName: string,
    teamConference: string,
    teamConferenceDivision: string,
    teamTidyName: string,
    opponentCode: number,
    opponentName: string,
    opponentConference: string,
    opponentConferenceDivision: string,
    side: VH,
    gameDate: Date,
    actualDate: string): void {
    this.parsedData = parsePlayer(player, teamCode, teamName, teamConference, teamConferenceDivision, teamTidyName,
      opponentCode, opponentName, opponentConference, opponentConferenceDivision, side, gameDate, actualDate);
  }

  /**
   * Saves the player to the database
   * updates the player if it already exists, otherwise inserts
   * @param db mongo database
   */
  public async save(db: mongo.Db): Promise<string> {
    if (this.getAlreadyExists()) {
      const updateCommand = {
        q: { _id: this.getId() },
        u: { $push: { games: { $each: this.prepareDynamicData().games } } },
        multi: false,
        upsert: false,
      };
      return db.command({
        update: "players",
        updates: [updateCommand],
        ordered: true, // true = bail out if any update fails
      }).then(() => this.getId());
    } else {
      const preparedData = Object.assign({}, this.prepareStaticData(), this.prepareDynamicData());
      return db.collection("players").insert(preparedData)
        .then(() => this.getId());
    }
  }

  /**
   * Prepares the player for batch saving
   * returns either the command to update the player, or the player object to insert if it's new
   */
  public prepareForBatchSave() {
    if (this.getAlreadyExists()) {
      return ({
        q: { _id: this.getId() },
        u: { $push: { games: { $each: this.prepareDynamicData().games } } },
        multi: false,
        upsert: false,
      });
    } else {
      return Object.assign({}, this.prepareStaticData(), this.prepareDynamicData());
    }
  }

  /**
   * Check whether a player exists in a Mongo DB. Returns the player's ID
   * if found; otherwise generates a new ID.
   * @param db Mongo DB connection
   */
  public async generateId(db: mongo.Db): Promise<string> {
    /*const query = db.collection("players")
      .findOne({ tidyName: this.parsedData.tidyName, sportCode: "MFB", teamCode: this.parsedData.teamCode },
      { fields: { _id: 1 } }); // Need to check team code
    */

    let id: string = "";

    if (this.parsedData.playerId != null) {
      const gen_id = new mongo.ObjectID().toHexString();
      const result_update = await db.collection("players").updateOne({ playerId: this.parsedData.playerId }, 
                                            {"$set": {playerId: this.parsedData.playerId,
                                            name: this.parsedData.name,
                                            sportCode: "MFB",
                                            teamCode: this.parsedData.teamCode,
                                            teamId: this.parsedData.teamId,
                                            teamName: this.parsedData.teamName,
                                            teamConference: this.parsedData.teamConference,
                                            teamConferenceDivision: this.parsedData.teamConferenceDivision,
                                            teamTidyName: this.parsedData.teamTidyName,
                                            tidyName: this.parsedData.name,
                                            }, "$setOnInsert": {_id: gen_id}},{upsert: true});
      const result = await db.collection("players").findOne({ playerId: this.parsedData.playerId });
      if (result) {
        id = result._id;
      }
    } else {
      /**
       * As per the division 1 rules a player can play in college sports for 5 years.
       * In five years he can play in the game only for 4 season.
       * so we will look for players who played 4 years before or after the current year (as per xml).
       * So we get contemprary players with the same name to evaluate.
       */
      const minAcceptedSeason = this.parsedData.games[0].season - 4;
      const maxAcceptedSeason = this.parsedData.games[0].season + 4;

      const queryString = this.getQueryString(minAcceptedSeason, maxAcceptedSeason);

      // winstonLogger.log("info", JSON.stringify(queryString));
      const query = db.collection("players").aggregate(queryString);

      const matchedPlayers = await query.toArray();

      for (const player of matchedPlayers) {
        const samePlayer: boolean = await this.areTheySamePlayers(db, player._id, player);
        if (samePlayer === true) {
          id = player._id;
          break; // found the player lets go back
        }
      }
    }

    if (id === "") {
      // winstonLogger.log("info", "Create new ID ");
      // create a new id as there is no matching player.
      id = new mongo.ObjectID().toHexString();
      this.alreadyExists = false;
      this.initialized = true;
    } else {
      // winstonLogger.log("info", "use ID " + id);
      this.alreadyExists = true;
      this.initialized = true;
    }
    return id;
  }

  /**
   * Constructs a range query to search for the player who fits the best as per the known stats and information.
   * @param minAcceptedSeason season to start the range query construction
   * @param maxAcceptedSeason season to end the range query construction.
   */
  private getQueryString(minAcceptedSeason: number, maxAcceptedSeason: number) {
    return [
      {
        $match: {
          $and: [
            { tidyName: this.parsedData.tidyName },
            { sportCode: "MFB" },
            { teamCode: this.parsedData.teamCode },
            { "games.season": { $gte: minAcceptedSeason } },
            { "games.season": { $lte: maxAcceptedSeason } },
          ],
        },
      },
      {
        $unwind: "$games",
      },
      {
        $sort: { "games.gameDate": 1 },
      },
      {
        $group: {
          _id: "$_id",
          minSeason: { $min: "$games.season" },
          maxSeason: { $max: "$games.season" },
          startingClass: { $first: "$games.playerClass" },
          endingClass: { $last: "$games.playerClass" },
          tidyName: { $first: "$tidyName" },
          teamName: { $first: "$teamName" },
        },
      },
      {
        $project: {
          minSeason: 1,
          maxSeason: 1,
          _id: 1,
          tidyName: 1,
          teamName: 1,
          teamId: 1,
          startingClass: 1,
          endingClass: 1,
        },
      },
    ];
  }

  /**
   * Makes a rule based approach to identify a player.
   * If the given player id and the current player are same then returns true else false.
   * @param db Mongo DB
   * @param id Id of the player from the Mongo DB who could be a possible match for the player.
   * @param player Current player that we are processing.
   */
  private async areTheySamePlayers(db: mongo.Db, id: string, player: any): Promise<boolean> {

    const currentSeason: number = this.parsedData.games[0].season;

    /** Rule1: The current game xml that is uploaded is between or equal to an existing min and max season.
     * Then match to see if the player class is what it should be for the current season.
     * The player class is assigned based on a order [FR, SO, JR, SR]
     * Also handle on redshirted event where in a player class can repeat for a max of two season.
     * Also redshirt can happen only once per player.
     * TODO: There is a posibility of miss if the files are not uploaded by date (asc) and
     * the player names are same during the same season, but this is a rare scenario.
     */
    if (currentSeason >= player.minSeason && currentSeason <= player.maxSeason) {
      // winstonLogger.log("info", "matching between");
      const resultCode: number = await this.matchPlayerByIdAndPlayerClass(db, id);

      if (resultCode > 0) {

        return true;
      } else {
        return false;
      }
    }

    /**
     * Rule2: The current games xml thats is uploaded is less than then the known minimum season for the player.
     * We need to check the difference between the maxSeason for the player and the currentSeason.
     * If the difference is less than or equal to 5, then its the same player else return player not a match.
     */
    if (currentSeason < player.minSeason) {

      if (player.maxSeason - currentSeason > 5) {
        return false;
      }
      // winstonLogger.log("info", "matching backward");
      const resultCode: number = await this.matchPlayerCareerWithPlayerClassBackward(db, id);
      // winstonLogger.log("info", "Moving backward returned " + resultCode);
      if (resultCode > 0) {
        return true;
      } else {
        return false;
      }

    } else if (currentSeason > player.maxSeason) {
      /**
       * Rule3: The current games xml thats is uploaded is greater than then the known maximum season for the player.
       * We need to check the difference between the minSeason for the player and the currentSeason.
       * If the difference is less than or equal to 5, then its the same player else return player not a match.
       */

      if (currentSeason - player.minSeason > 5) {
        return false;
      }
      // winstonLogger.log("info", "matching forward");
      const resultCode: number = await this.matchPlayerCareerWithPlayerClassForward(db, id);
      //  winstonLogger.log("info", "Moving forward returned " + resultCode);
      if (resultCode > 0) {
        return true;
      } else {
        return false;
      }

    }

    return false;
  }

  /**
   * Match the player with the known order of the player class.
   * Call this method only if the required order of match is in decending order.
   * Returns 0 or negative numbers if the player is not a match.
   * @param db Mondo DB
   * @param id Player id
   */
  private async matchPlayerCareerWithPlayerClassBackward(db: mongo.Db, id: string): Promise<number> {

    const playerDetailBySeason = await this.getPlayerClassBySeason(db, id);
    let result: number = 0;

    let startIndex: number = -1;
    let currentStartIndex: number = -1;
    for (let count: number = 0; count < 4; count++) {

      if (this.playerClass[count] === playerDetailBySeason[0].playerClass) {
        startIndex = count;
      }
      if (this.playerClass[count] === this.parsedData.games[0].playerClass) {
        currentStartIndex = count;
      }
    }
    // winstonLogger.log("info", " startIndex " + startIndex + " currentStartIndex " + currentStartIndex);
    /** If the index is greater or equal then this is not the player as the
     * player class is moving upwards whule we are expecting it to be moving downwards
     */
    if (currentStartIndex > startIndex) {
      result = -1;
      return result;
    }

    const redShirtedSeason: number = this.getPlayerRedShirtedSeason(playerDetailBySeason);
    // winstonLogger.log("info", "redShirtedSeason " + redShirtedSeason);

    if (currentStartIndex === startIndex && redShirtedSeason <= 0) {
      if (this.parsedData.games[0].season === playerDetailBySeason[0].season - 1) {
        result = 1;
        return result;
      } else {
        result = -1;
        return result;
      }
    }

    const indexToMove: number = startIndex - currentStartIndex;
    // winstonLogger.log("info", "index to move in backward indexToMove " + indexToMove +
    // " startIndex " + startIndex + " currentStartIndex " + currentStartIndex);

    if (indexToMove === 0 && this.parsedData.games[0].season + 1 === playerDetailBySeason[0].season
      && redShirtedSeason > 0) {
      /**
       * The player class is same as the min seasons playerclass.
       * So if the player is redshirted and the season is one below the min then for sure he is not the player
       */
      result = -1;
      return result;
    }

    if ((startIndex - indexToMove) > 0 &&
      this.playerClass[startIndex - indexToMove] === this.parsedData.games[0].playerClass) {
      result = 1;
      return result;
    }

    /**
     * If the player is already redshirted then the player class should match exact.
     * If its not matching then the player is not the correct one.
     */
    if (redShirtedSeason > 0) {
      result = -1;
      return result;
    }

    // Handle the redshirted event in the current xml. This should be during the freshmen year.
    if (startIndex - indexToMove === -1 && this.playerClass[0] === this.parsedData.games[0].playerClass) {
      result = 2;
      return result;
    }

    // As of now the player is not yet redshirted but the current xml could indicate a redshirted event.
    // So let us evaluate for it.
    // winstonLogger.log("info", "hi i am here startIndex " + startIndex + " indexToMove " + indexToMove);
    if (this.playerClass[startIndex - indexToMove - 1] === this.parsedData.games[0].playerClass &&
      this.parsedData.games[0].season === playerDetailBySeason[0].season - 1) {
      result = 2;
      return result;
    }

    return result;
  }

  /**
   * Match the player with the known order of the player class.
   * Call this method only if the required order of match is in ascending order.
   * Returns 0 or negative numbers if the player is not a match.
   * @param db Mondo DB
   * @param id Player id
   */
  private async matchPlayerCareerWithPlayerClassForward(db: mongo.Db, id: string): Promise<number> {

    const playerDetailBySeason = await this.getPlayerClassBySeason(db, id);
    let result: number = 0;

    let startIndex: number = -1;
    let currentStartIndex: number = -1;
    for (let count: number = 0; count < 4; count++) {

      if (this.playerClass[count] === playerDetailBySeason[playerDetailBySeason.length - 1].playerClass) {
        startIndex = count;
      }
      if (this.playerClass[count] === this.parsedData.games[0].playerClass) {
        currentStartIndex = count;
      }
    }

    /** If the index is less or equal then this is not the player as the
     * player class is moving downwards whule we are expecting it to be moving upwards
     */
    if (currentStartIndex < startIndex) {
      result = -1;
      return result;
    }

    const redShirtedSeason: number = this.getPlayerRedShirtedSeason(playerDetailBySeason);

    if (currentStartIndex === startIndex && redShirtedSeason <= 0) {
      if (this.parsedData.games[0].season - 1 === playerDetailBySeason[playerDetailBySeason.length - 1].season) {
        result = 1;
        return result;
      } else {
        result = -1;
        return result;
      }
    }

    const indexToMove: number = currentStartIndex - startIndex;
    // winstonLogger.log("info", "moving ahead with " + indexToMove);

    if (indexToMove === 0 &&
      this.parsedData.games[0].season - 1 === playerDetailBySeason[playerDetailBySeason.length - 1].season
      && redShirtedSeason > 0) {
      /**
       * The player class is same as the min seasons playerclass.
       * So if the player is redshirted and the season is one above the max then for sure he is not the player
       */
      result = -1;
      return result;
    }

    if ((startIndex + indexToMove) <= 3 &&
      this.playerClass[startIndex + indexToMove] === this.parsedData.games[0].playerClass) {
      result = 1;
      return result;
    }

    /**
     * If the player is already redshirted then the player class should match exact.
     * If its not matching then the player is not the correct one.
     */
    if (redShirtedSeason > 0) {
      result = -1;
      return result;
    }

    // Handle the redshirted event in the current xml. In case the redshirt happened during the end of his career.
    if (startIndex + indexToMove === 4 && this.playerClass[3] === this.parsedData.games[0].playerClass) {
      result = 2;
      return result;
    }

    // As of now the player is not yet redshirted but the current xml could indicate a redshirted event.
    // So let us evaluate for it.

    if (this.playerClass[startIndex + indexToMove - 1] === this.parsedData.games[0].playerClass &&
      this.parsedData.games[0].season - 1 === playerDetailBySeason[playerDetailBySeason.length - 1].season) {
      result = 2;
      return result;
    }

    return result;
  }

  /**
   * Check if the given player id and the current season, player class combination is valid
   * @param db Mongo db
   * @param id Id of the player
   * Returns 0 if player does not match,
   * -1 if the playerclass exist but the season is not matching.
   * 1 if the player matches
   */
  private async matchPlayerByIdAndPlayerClass(db: mongo.Db, id: string): Promise<number> {

    const playerDetailBySeason = await this.getPlayerClassBySeason(db, id);

    let result: number = 0;
    let count: number = 0;

    playerDetailBySeason.forEach((player) => {

      // Step1 we have already done our hardwork. So let us just say we found the player.
      if (player.season === this.parsedData.games[0].season &&
        player.playerClass === this.parsedData.games[0].playerClass) {
        result = 1; // Found the player.
        return;
      }

      // Step2 If the player season and the player class is not matchning whats in the DB
      // then simolly assume the current player is not matching
      if (player.season === this.parsedData.games[0].season &&
        player.playerClass !== this.parsedData.games[0].playerClass) {
        result = -1; // He is not the player. Reason: For the known season the playerClass has to be same..
        return;
      }
    });

    // Return if the result is not zero. Either way we have concluded the identification.
    if (result !== 0) {
      return result;
    }

    // In case the result is 0 we still have to perform few more checks.

    const numberOfSeasonsPlayed: number = playerDetailBySeason.length;

    // Step3 The player has played more than 5 games and the current season is not matching the season.
    if (result === 0 && numberOfSeasonsPlayed >= 5) {
      /**The player has played all the 5 season and the result 0 indicates that the
       * season & class combination was not found.
       * So it should be a new player.
       */
      return result;
    }
    const redShirtedSeason: number = this.getPlayerRedShirtedSeason(playerDetailBySeason);

    /**
     * Identify the index (startIndex) of the player class for the first season
     * Also identify the current seasons index (currentIndex) as per the playerclass
     * So the total jump needed is currentIndex - startIndex.
     */

    let startIndex: number = -1;
    let currentStartIndex: number = -1;
    for (count = 0; count < 4; count++) {

      if (this.playerClass[count] === playerDetailBySeason[0].playerClass) {
        startIndex = count;
      }
      if (this.playerClass[count] === this.parsedData.games[0].playerClass) {
        currentStartIndex = count;
      }
    }

    // Difference between the minimum playerclass index and the current game player class.
    const indexToMove = currentStartIndex - startIndex;

    // winstonLogger.log("info", "moving ahead with " + indexToMove);

    if (indexToMove === 0 &&
      this.parsedData.games[0].season - 1 === playerDetailBySeason[playerDetailBySeason.length - 1].season
      && redShirtedSeason > 0) {
      /**
       * The player class is same as the min seasons playerclass.
       * So if the player is redshirted and the season is one above the max then for sure he is not the player
       */
      result = -1;
      return result;
    }

    if (indexToMove === 0 && this.parsedData.games[0].season + 1 === playerDetailBySeason[0].season
      && redShirtedSeason > 0) {
      /**
       * The player class is same as the min seasons playerclass.
       * So if the player is redshirted and the season is one below the min then for sure he is not the player
       */
      result = -1;
      return result;
    }

    if (playerDetailBySeason[0].season + indexToMove === this.parsedData.games[0].season &&
      redShirtedSeason === 0 && this.playerClass[startIndex + indexToMove] === this.parsedData.games[0].playerClass) {
      // The season has moved correct and the player class is perfectly matching.
      result = 1;
    } else if (playerDetailBySeason[0].season + indexToMove + 1 === this.parsedData.games[0].season
      && redShirtedSeason !== 0 &&
      redShirtedSeason >= playerDetailBySeason[0].season && redShirtedSeason <= this.parsedData.games[0].season &&
      this.playerClass[startIndex + indexToMove] === this.parsedData.games[0].playerClass) {
      // The player is redhsirted so we need to move +1 in our index
      result = 1;
    } else {
      result = -1;
    }

    // winstonLogger.log("info", "return result " + result);

    return result;
  }

  private async getPlayerClassBySeason(db: mongo.Db, id: string) {
    const queryString = [
      { $match: { _id: id } },
      {
        $unwind: "$games",
      },
      {
        $group: {
          _id: {
            id: "$_id", season: "$games.season",
          },
          season: { $first: "$games.season" },
          playerClass: { $first: "$games.playerClass" },
          tidyName: { $first: "$tidyName" },
          teamName: { $first: "$teamName" },
        },
      },
      {
        $sort: {
          season: 1,
        },
      },
      {
        $project: {
          season: 1,
          _id: 1,
          tidyName: 1,
          teamName: 1,
          playerClass: 1,
        },
      },
    ];

    const query = await db.collection("players").aggregate(queryString);

    const playerDetailBySeason = await query.toArray();

    return playerDetailBySeason;
  }

  /**
   * Gets the season where the player was redshirted. Returns 0 if not redshirted.
   * @param matchedPlayers
   */
  private getPlayerRedShirtedSeason(matchedPlayers: any[]): number {
    let previousClass: string = "";
    let result: number = 0;
    for (const player of matchedPlayers) {
      if (previousClass === player.playerClass) {
        result = player.season - 1;
        break;
      }
      previousClass = player.playerClass;
    }
    return result;
  }

}
