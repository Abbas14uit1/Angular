import * as mongo from "mongodb";

import { BasketballStatcrewImportBase } from "../BasketballStatcrewImportBase";
import { Game } from "./game";
import { Play } from "./play";
import { Team } from "./team";

import { VH } from "../../AthlyteImporter";
import { parsePlayer } from "./helpers/playerParser";
import { winstonLogger } from "../../../winstonLogger";
// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/basketball";
import * as AthlyteCommon from "../../../../../../../typings/athlyte/basketball/common-stats.d";
import * as AthlytePlayer from "../../../../../../../typings/athlyte/basketball/player.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/basketball/team.d";
import { TeamGame } from "./teamGames";

/**
 * Player class manages the entire lifecycle of player data,
 * from import from Statcrew JSON through saving to Mongo
 */
export class Player extends BasketballStatcrewImportBase {
  public parsedData: Athlyte.IPlayer;
  /**
   * Games, plays, and teams need to know a player's ID before they are saved to Mongo
   */
  public dependents: Array<Game | Play | Team | TeamGame>;
  private alreadyExists: boolean;
  private initialized: boolean;

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
   * Check whether a player exists in a Mongo DB. Returns the player's ID
   * if found; otherwise generates a new ID.
   * @param db Mongo DB connection
   */
  public async generateId(db: mongo.Db, sportCode: "MBB" | "WBB"): Promise<string> {
    const query = db.collection("players")
      .findOne({ playerId: this.parsedData.playerId, sportCode: sportCode, teamCode: this.parsedData.teamCode }, { fields: { _id: 1 } }); // Need to check team code
    const existingPlayerId = await query;
    let id: string;
    if (existingPlayerId) {
      id = existingPlayerId._id;
      this.alreadyExists = true;
      this.initialized = true;
    } else {
      id = new mongo.ObjectID().toHexString();
      this.alreadyExists = false;
      this.initialized = true;
    }
    return id;
  }

  /**
   * Check whether a player already exists in Mongo
   */
  public getAlreadyExists(): boolean {
    if (this.initialized == false) {
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
        sportCode: this.parsedData.sportCode,
        teamCode: this.parsedData.teamCode,
        teamId: this.parsedData.teamId,
        teamName: this.parsedData.teamName,
        teamTidyName: this.parsedData.teamTidyName,
        tidyName: this.parsedData.tidyName,
        playerId: this.parsedData.playerId,
        teamConference: this.parsedData.teamConference,
        teamConferenceDivision: this.parsedData.teamConferenceDivision
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
        dependent instanceof TeamGame) {
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
    teamTidyName: string,
    teamConference: string,
    teamConferenceDivision: string,
    opponentCode: number,
    opponentName: string,
    opponentConference: string,
    opponentConferenceDivision: string,
    side: VH,
    gameDate: Date,
    actualDate: string, sportCode: "MBB" | "WBB"  ): void {
    this.parsedData = parsePlayer(player, teamCode, teamName, teamTidyName, teamConference,
              teamConferenceDivision, opponentCode, opponentName, opponentConference,
              opponentConferenceDivision, side, gameDate,actualDate, sportCode);
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
}
